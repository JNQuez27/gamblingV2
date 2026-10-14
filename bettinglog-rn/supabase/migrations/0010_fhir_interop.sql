-- 0010: HL7 FHIR interoperability pipeline (Edge Function fhir-export) and
-- its Data Privacy Act controls. Run once in the Supabase SQL Editor after
-- 0009. Safe to re-run.
--
-- * Encryption at rest: every transmitted payload is kept only as
--   pgp_sym_encrypt() ciphertext (pgcrypto, AES-256), under a key that is
--   generated inside Supabase Vault by this script - no person, file, or
--   function source ever holds it. This is on top of Supabase's own disk
--   encryption.
-- * Access control: RLS is on with no client policies, app users (anon,
--   authenticated) have no privileges at all, and service_role may only
--   SELECT. Writes go exclusively through the SECURITY DEFINER functions
--   below, which only service_role may execute - the Edge Function reaches
--   them with a secret API key.
-- * Immutable audit log: fhir_audit_log is append-only. UPDATE, DELETE and
--   TRUNCATE are rejected by triggers and not granted to anyone, and every
--   row is hash-chained to the one before it, so a change made by bypassing
--   the triggers is still detected by verify_fhir_audit_chain().

create extension if not exists pgcrypto with schema extensions;

-- 1. Encryption key, generated server-side (32 random bytes).
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'fhir_payload_key') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'base64'),
      'fhir_payload_key',
      'Symmetric key for fhir_exports.payload_encrypted (migration 0010)'
    );
  end if;
end $$;

-- 2. Tables
create table if not exists fhir_exports (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references assessment_sessions(id) on delete cascade,
  patient_pseudonym text not null,
  target_url        text not null,
  http_status       int,
  payload_sha256    text not null,
  payload_encrypted bytea not null,
  created_at        timestamptz not null default now()
);
create index if not exists fhir_exports_session_idx on fhir_exports (session_id);

-- No foreign keys on purpose: the trail outlives the record it describes
-- (an account deletion erases the health data, not the history of access).
-- It holds ids and hashes only, never health data.
create table if not exists fhir_audit_log (
  id             bigint generated always as identity primary key,
  occurred_at    timestamptz not null default now(),
  actor          text not null,
  action         text not null,  -- fhir.preview | fhir.transmit.start | fhir.transmit | fhir.decrypt
  outcome        text not null,  -- success | failure
  session_id     uuid,
  target_url     text,
  http_status    int,
  payload_sha256 text,
  detail         text,
  prev_hash      text not null,
  row_hash       text not null
);

alter table fhir_exports   enable row level security;
alter table fhir_audit_log enable row level security;
revoke all on fhir_exports, fhir_audit_log from public, anon, authenticated, service_role;
grant select on fhir_exports, fhir_audit_log to service_role;
revoke all on sequence fhir_audit_log_id_seq from public, anon, authenticated, service_role;

-- 3. Hash chain. One canonical text form per row, with the timestamp pinned
-- to UTC so the hash never depends on the session's TimeZone.
create or replace function fhir_audit_hash(r fhir_audit_log)
returns text
language sql
stable
set search_path = public, extensions
as $$
  select encode(digest(concat_ws('|',
    r.prev_hash,
    to_char(r.occurred_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    r.actor, r.action, r.outcome,
    coalesce(r.session_id::text, ''), coalesce(r.target_url, ''),
    coalesce(r.http_status::text, ''), coalesce(r.payload_sha256, ''),
    coalesce(r.detail, '')
  ), 'sha256'), 'hex')
$$;

create or replace function fhir_audit_chain()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  select row_hash into new.prev_hash from fhir_audit_log order by id desc limit 1;
  new.prev_hash := coalesce(new.prev_hash, repeat('0', 64));
  new.occurred_at := now();
  new.row_hash := fhir_audit_hash(new);
  return new;
end $$;

create or replace function fhir_audit_block()
returns trigger
language plpgsql
as $$
begin
  raise exception 'fhir_audit_log is append-only: % is not allowed', tg_op;
end $$;

drop trigger if exists fhir_audit_chain       on fhir_audit_log;
drop trigger if exists fhir_audit_no_change   on fhir_audit_log;
drop trigger if exists fhir_audit_no_truncate on fhir_audit_log;
create trigger fhir_audit_chain before insert on fhir_audit_log
  for each row execute function fhir_audit_chain();
create trigger fhir_audit_no_change before update or delete on fhir_audit_log
  for each row execute function fhir_audit_block();
create trigger fhir_audit_no_truncate before truncate on fhir_audit_log
  for each statement execute function fhir_audit_block();

-- Internal: the only writer of the trail. The lock serializes appends so the
-- chain order matches id order.
create or replace function fhir_audit_append(
  p_actor text, p_action text, p_outcome text, p_session_id uuid,
  p_target_url text, p_http_status int, p_payload_sha256 text, p_detail text
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare v_id bigint;
begin
  perform pg_advisory_xact_lock(hashtext('fhir_audit_log'));
  insert into fhir_audit_log
    (actor, action, outcome, session_id, target_url, http_status, payload_sha256, detail, prev_hash, row_hash)
  values
    (p_actor, p_action, p_outcome, p_session_id, p_target_url, p_http_status, p_payload_sha256, p_detail, '', '')
  returning id into v_id;
  return v_id;
end $$;

-- 4. Called by the Edge Function for every access. For 'fhir.transmit' the
-- payload is also stored, encrypted. Returns the audit row id.
create or replace function fhir_record_export(
  p_actor text, p_action text, p_outcome text, p_session_id uuid,
  p_patient_pseudonym text, p_target_url text, p_http_status int,
  p_payload text, p_detail text
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text := encode(digest(p_payload, 'sha256'), 'hex');
  v_key  text;
begin
  if p_action = 'fhir.transmit' then
    select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fhir_payload_key';
    if v_key is null then
      raise exception 'fhir_payload_key is missing from Vault (run migration 0010)';
    end if;
    insert into fhir_exports
      (session_id, patient_pseudonym, target_url, http_status, payload_sha256, payload_encrypted)
    values
      (p_session_id, p_patient_pseudonym, p_target_url, p_http_status, v_hash,
       pgp_sym_encrypt(p_payload, v_key, 'cipher-algo=aes256'));  -- default would be aes128
  end if;
  return fhir_audit_append(p_actor, p_action, p_outcome, p_session_id,
                           p_target_url, p_http_status, v_hash, p_detail);
end $$;

-- 5. Authorized read-back of a stored payload. Decryption is itself audited.
create or replace function fhir_read_export(p_export_id uuid, p_actor text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
  v_row fhir_exports;
  v_payload text;
begin
  select * into v_row from fhir_exports where id = p_export_id;
  if not found then
    raise exception 'no fhir_exports row %', p_export_id;
  end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'fhir_payload_key';
  v_payload := pgp_sym_decrypt(v_row.payload_encrypted, v_key);
  perform fhir_audit_append(p_actor, 'fhir.decrypt', 'success', v_row.session_id,
                            v_row.target_url, null, v_row.payload_sha256, p_export_id::text);
  return v_payload::jsonb;
end $$;

-- 6. Tamper check: recomputes the whole chain.
create or replace function verify_fhir_audit_chain()
returns table (ok boolean, rows_checked bigint, first_bad_id bigint)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  r    fhir_audit_log;
  prev text := repeat('0', 64);
  n    bigint := 0;
begin
  for r in select * from fhir_audit_log order by id loop
    n := n + 1;
    if r.prev_hash <> prev or r.row_hash <> fhir_audit_hash(r) then
      return query select false, n, r.id;
      return;
    end if;
    prev := r.row_hash;
  end loop;
  return query select true, n, null::bigint;
end $$;

-- 7. Execute rights: service_role only.
revoke all on function fhir_audit_hash(fhir_audit_log) from public, anon, authenticated;
revoke all on function fhir_audit_append(text, text, text, uuid, text, int, text, text)
  from public, anon, authenticated, service_role;
revoke all on function fhir_record_export(text, text, text, uuid, text, text, int, text, text)
  from public, anon, authenticated;
revoke all on function fhir_read_export(uuid, text) from public, anon, authenticated;
revoke all on function verify_fhir_audit_chain() from public, anon, authenticated;
grant execute on function fhir_record_export(text, text, text, uuid, text, text, int, text, text) to service_role;
grant execute on function fhir_read_export(uuid, text) to service_role;
grant execute on function verify_fhir_audit_chain() to service_role;
