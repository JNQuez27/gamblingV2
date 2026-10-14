# fhir-export: HL7 FHIR interoperability pipeline

A Supabase Edge Function (native backend route, no Mirth) that takes one
existing PGSI assessment from the BettingLog database, serializes it into an
HL7 FHIR R4 transaction Bundle, and sends it over HTTPS to an external FHIR
server.

## Pipeline

1. **Extract**: `assessment_sessions` + `assessment_responses` +
   `instrument_items` + `profiles` (gender, birth date).
2. **Serialize** (`lib.ts`): FHIR R4 `Bundle` of type `transaction` with
   - `Patient`: pseudonymized (SHA-256 of the user id), no name or contact,
     birth year only
   - `QuestionnaireResponse`: the 9 item answers
   - `Observation`: the total score and its interpretation, derived from the
     QuestionnaireResponse

   Each entry is a conditional create on an identifier, so re-sending the same
   session never duplicates data on the target.
3. **Transmit** (`index.ts`): `POST` with `Content-Type: application/fhir+json`
   to `FHIR_TARGET_URL` (default `https://hapi.fhir.org/baseR4`). Non-HTTPS
   targets are rejected.
4. **Record**: every attempt is audited before sending, and the outcome is
   audited after (see Data Privacy Act controls).

## Data Privacy Act controls (`../../migrations/0010_fhir_interop.sql`)

| Control | Implementation |
|---|---|
| Encryption at rest | Sent payloads are stored only as `pgp_sym_encrypt(..., 'cipher-algo=aes256')` ciphertext in `fhir_exports`. The key is generated inside Supabase Vault (`fhir_payload_key`) and never appears in code or the repo. |
| Access control credentials | The function accepts only the project's secret API keys (`apikey` header), whose name is logged as the actor. App users (anon, authenticated) have no privileges on the tables or functions. `service_role` can only read; writes go through `SECURITY DEFINER` functions. Target credentials (`FHIR_TARGET_TOKEN`) are function secrets. |
| Immutable audit log | `fhir_audit_log` is append-only: UPDATE, DELETE and TRUNCATE are blocked by triggers (even for the owner) and not granted. Rows are hash-chained; `select * from verify_fhir_audit_chain();` detects any forged row. |

## Run it

```bash
# deploy (from bettinglog-rn/)
npx supabase functions deploy fhir-export --no-verify-jwt

# preview the payload without sending it (still audited)
curl -X POST "https://<project>.supabase.co/functions/v1/fhir-export?dry=1" \
  -H "apikey: <secret API key>" -d '{"session_id":"<uuid>"}'

# send it
curl -X POST "https://<project>.supabase.co/functions/v1/fhir-export" \
  -H "apikey: <secret API key>" -d '{"session_id":"<uuid>"}'
```

## Tests

- `lib.test.ts` (jest, `npm test`): Bundle structure, references,
  pseudonymization, HTTPS-only, and transaction-response parsing.
