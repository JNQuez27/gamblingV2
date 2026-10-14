// Supabase Edge Function: fhir-export - the HL7 FHIR interoperability pipeline.
//
//   1. Extract one assessment record from the database (assessment_sessions
//      + assessment_responses + instrument items + profile demographics).
//   2. Serialize it into a FHIR R4 transaction Bundle (lib.ts).
//   3. Audit the attempt, POST the Bundle over HTTPS to FHIR_TARGET_URL, then
//      record the outcome. fhir_record_export() (migration 0010) stores the
//      payload encrypted at rest and appends to the hash-chained, append-only
//      fhir_audit_log. Nothing is sent unless the attempt was audited first.
//
// Request:  POST, header `apikey: <secret API key>`, body {"session_id":"<uuid>"}
//           (optional; the most recent assessment is used when omitted).
//           `?dry=1` builds and returns the Bundle without sending it (audited
//           as fhir.preview).
// Auth:     only the project's secret API keys (sb_secret_...) are accepted,
//           same model as price-sync, so deploy with --no-verify-jwt. The key's
//           name is written to the audit log as the actor.
// Secrets:  FHIR_TARGET_URL (default: the public HAPI FHIR R4 test server),
//           optional FHIR_TARGET_TOKEN sent as a Bearer token to the target.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { assertHttps, buildBundle, summarizeResponse, type AssessmentRecord } from './lib.ts';

const DEFAULT_TARGET = 'https://hapi.fhir.org/baseR4';
const FHIR_JSON = 'application/fhir+json';

// Named secret keys from the platform (SUPABASE_SECRET_KEYS is a JSON object);
// SUPABASE_SECRET_KEY is the single-key fallback for the local CLI.
function secretKeys(): [string, string][] {
  try {
    const named = Object.entries(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}')).filter(
      (e): e is [string, string] => typeof e[1] === 'string' && e[1].length > 0,
    );
    if (named.length) return named;
  } catch {
    // fall through
  }
  const single = Deno.env.get('SUPABASE_SECRET_KEY');
  return single ? [['default', single]] : [];
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const fail = (status: number, error: string) => Response.json({ ok: false, error }, { status });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return fail(405, 'POST only');

  const key = req.headers.get('apikey') ?? '';
  const match = key ? secretKeys().find(([, value]) => value === key) : undefined;
  if (!match) return fail(403, 'Forbidden');
  const actor = `secret_key:${match[0]}`;
  const db = createClient(Deno.env.get('SUPABASE_URL')!, key);
  const dry = new URL(req.url).searchParams.get('dry') === '1';

  let target: string;
  try {
    target = assertHttps(Deno.env.get('FHIR_TARGET_URL') ?? DEFAULT_TARGET);
  } catch (e) {
    return fail(500, String((e as Error).message));
  }

  const body = (await req.json().catch(() => ({}))) as { session_id?: string };

  // 1. Extract
  let query = db
    .from('assessment_sessions')
    .select('id, user_id, total_score, risk_level, category, is_baseline, completed_at, instruments(name)');
  query = body.session_id
    ? query.eq('id', body.session_id)
    : query.order('completed_at', { ascending: false }).limit(1);
  const { data: session, error: sessionErr } = await query.maybeSingle();
  if (sessionErr) return fail(500, sessionErr.message);
  if (!session) return fail(404, 'assessment session not found');

  const [answersRes, profileRes] = await Promise.all([
    db
      .from('assessment_responses')
      .select('response, instrument_items(item_order, prompt)')
      .eq('session_id', session.id),
    db.from('profiles').select('gender, birthdate').eq('id', session.user_id).maybeSingle(),
  ]);
  if (answersRes.error) return fail(500, answersRes.error.message);
  if (profileRes.error) return fail(500, profileRes.error.message);

  // deno-lint-ignore no-explicit-any
  const s = session as any;
  const record: AssessmentRecord = {
    sessionId: s.id,
    instrument: s.instruments?.name ?? 'assessment',
    completedAt: s.completed_at,
    totalScore: s.total_score,
    riskLevel: s.risk_level,
    category: s.category,
    isBaseline: !!s.is_baseline,
    patient: {
      pseudonym: await sha256Hex(s.user_id), // the raw user id never leaves
      gender: profileRes.data?.gender ?? null,
      birthdate: profileRes.data?.birthdate ?? null,
    },
    // deno-lint-ignore no-explicit-any
    answers: (answersRes.data ?? []).map((a: any) => ({
      order: a.instrument_items.item_order,
      prompt: a.instrument_items.prompt,
      value: Number(a.response),
    })),
  };

  // 2. Serialize
  const bundle = buildBundle(record, {
    patient: crypto.randomUUID(),
    response: crypto.randomUUID(),
    observation: crypto.randomUUID(),
  });
  const payload = JSON.stringify(bundle);

  const audit = (action: string, outcome: string, httpStatus: number | null, detail: string) =>
    db.rpc('fhir_record_export', {
      p_actor: actor,
      p_action: action,
      p_outcome: outcome,
      p_session_id: record.sessionId,
      p_patient_pseudonym: record.patient.pseudonym,
      p_target_url: target,
      p_http_status: httpStatus,
      p_payload: payload,
      p_detail: detail,
    });

  if (dry) {
    const { error } = await audit('fhir.preview', 'success', null, 'dry run, not transmitted');
    if (error) return fail(500, `audit failed: ${error.message}`);
    return new Response(JSON.stringify(bundle, null, 2), { headers: { 'Content-Type': FHIR_JSON } });
  }

  // 3. Audit first; no audit, no transmission.
  const start = await audit('fhir.transmit.start', 'success', null, 'sending');
  if (start.error) return fail(500, `audit failed, nothing sent: ${start.error.message}`);

  let httpStatus = 0;
  let detail = '';
  let created: string[] = [];
  try {
    const headers: Record<string, string> = { 'Content-Type': FHIR_JSON, Accept: FHIR_JSON };
    const token = Deno.env.get('FHIR_TARGET_TOKEN');
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(target, {
      method: 'POST',
      headers,
      body: payload,
      signal: AbortSignal.timeout(30_000),
    });
    httpStatus = res.status;
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // non-JSON error page
    }
    created = summarizeResponse(parsed);
    detail = res.ok ? created.join('; ') : `HTTP ${res.status}: ${text.slice(0, 300)}`;
  } catch (e) {
    detail = `request failed: ${String((e as Error).message ?? e)}`;
  }
  const ok = httpStatus >= 200 && httpStatus < 300;

  const done = await audit('fhir.transmit', ok ? 'success' : 'failure', httpStatus || null, detail);

  return Response.json(
    {
      ok: ok && !done.error,
      target,
      http_status: httpStatus || null,
      session_id: record.sessionId,
      payload_sha256: await sha256Hex(payload),
      created,
      audit_id: done.data ?? null,
      ...(ok ? {} : { error: detail }),
      ...(done.error ? { audit_error: done.error.message } : {}),
    },
    { status: ok ? 200 : 502 },
  );
});
