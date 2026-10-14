// Pure HL7 FHIR R4 serialization for the fhir-export Edge Function. No Deno
// or network APIs here, so jest tests it directly (lib.test.ts).
//
// One assessment session becomes a FHIR "transaction" Bundle of three
// resources that reference each other by urn:uuid:
//   Patient                - pseudonymized: no name, contact, or user id, and
//                            birth YEAR only (data minimization)
//   QuestionnaireResponse  - the item-by-item answers
//   Observation            - the total score, derived from the response
// Every entry is a conditional create keyed on an identifier, so sending the
// same session twice does not duplicate anything on the receiving server.
//
// Codes: the category uses the standard HL7 observation-category CodeSystem.
// The score code is a BettingLog-local CodeSystem; no standard terminology
// code is claimed for the instrument totals.

export const BL_SYSTEM = 'https://bettinglog.app/fhir';
const OBSERVATION_CATEGORY = 'http://terminology.hl7.org/CodeSystem/observation-category';

export interface AssessmentAnswer {
  order: number; // instrument_items.item_order
  prompt: string;
  value: number; // the stored 0-3 response
}

export interface AssessmentRecord {
  sessionId: string;
  instrument: string; // instruments.name, e.g. "PGSI"
  completedAt: string; // ISO timestamp
  totalScore: number;
  riskLevel: string;
  category: string | null;
  isBaseline: boolean;
  patient: {
    pseudonym: string; // SHA-256 of the user id, computed by the caller
    gender: string | null; // profiles.gender
    birthdate: string | null; // profiles.birthdate (YYYY-MM-DD)
  };
  answers: AssessmentAnswer[];
}

// Fresh UUIDs for the Bundle's internal urn:uuid references (caller supplies
// them so this module stays deterministic).
export interface BundleIds {
  patient: string;
  response: string;
  observation: string;
}

// profiles.gender is 'male' | 'female' | 'prefer_not' (free text tolerated).
export function fhirGender(g: string | null): 'male' | 'female' | 'unknown' {
  const v = (g ?? '').trim().toLowerCase();
  if (v === 'male' || v === 'female') return v;
  return 'unknown';
}

export function birthYear(date: string | null): string | undefined {
  const m = /^(\d{4})/.exec(date ?? '');
  return m ? m[1] : undefined;
}

// Outbound transmission must use HTTPS. Returns the URL without a trailing
// slash (the FHIR base URL is POSTed to directly).
export function assertHttps(url: string): string {
  const u = new URL(url);
  if (u.protocol !== 'https:') {
    throw new Error(`FHIR target must use https://, got ${u.protocol}//`);
  }
  return url.replace(/\/+$/, '');
}

const ident = (kind: string, value: string) => ({ system: `${BL_SYSTEM}/${kind}`, value });
const ifNoneExist = (i: { system: string; value: string }) => `identifier=${i.system}|${i.value}`;

export function buildBundle(r: AssessmentRecord, ids: BundleIds) {
  const patientUrl = `urn:uuid:${ids.patient}`;
  const responseUrl = `urn:uuid:${ids.response}`;
  const observationUrl = `urn:uuid:${ids.observation}`;

  const patientId = ident('patient-pseudonym', r.patient.pseudonym);
  const responseId = ident('assessment-response', r.sessionId);
  const observationId = ident('assessment-score', r.sessionId);
  const year = birthYear(r.patient.birthdate);
  const label = `${r.instrument} total score`;

  const patient = {
    resourceType: 'Patient',
    identifier: [patientId],
    gender: fhirGender(r.patient.gender),
    ...(year ? { birthDate: year } : {}),
  };

  const questionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    identifier: responseId, // 0..1 in R4
    status: 'completed',
    subject: { reference: patientUrl },
    authored: r.completedAt,
    item: [...r.answers]
      .sort((a, b) => a.order - b.order)
      .map((a) => ({
        linkId: String(a.order),
        text: a.prompt,
        answer: [{ valueInteger: a.value }],
      })),
  };

  const observation = {
    resourceType: 'Observation',
    identifier: [observationId],
    status: 'final',
    category: [{ coding: [{ system: OBSERVATION_CATEGORY, code: 'survey', display: 'Survey' }] }],
    code: {
      coding: [{ system: `${BL_SYSTEM}/CodeSystem/assessment`, code: `${r.instrument}-total`, display: label }],
      text: label,
    },
    subject: { reference: patientUrl },
    effectiveDateTime: r.completedAt,
    valueInteger: r.totalScore,
    interpretation: [{ text: r.category ?? r.riskLevel }],
    derivedFrom: [{ reference: responseUrl }],
    ...(r.isBaseline ? { note: [{ text: 'Baseline assessment' }] } : {}),
  };

  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        fullUrl: patientUrl,
        resource: patient,
        request: { method: 'POST', url: 'Patient', ifNoneExist: ifNoneExist(patientId) },
      },
      {
        fullUrl: responseUrl,
        resource: questionnaireResponse,
        request: { method: 'POST', url: 'QuestionnaireResponse', ifNoneExist: ifNoneExist(responseId) },
      },
      {
        fullUrl: observationUrl,
        resource: observation,
        request: { method: 'POST', url: 'Observation', ifNoneExist: ifNoneExist(observationId) },
      },
    ],
  };
}

// A FHIR transaction-response lists one response per entry, e.g.
// { status: "201 Created", location: "Patient/123/_history/1" }.
export function summarizeResponse(body: unknown): string[] {
  const entries = (body as { entry?: unknown } | null)?.entry;
  if (!Array.isArray(entries)) return [];
  return entries.map((e) => {
    const res = (e as { response?: { status?: string; location?: string } })?.response;
    return `${res?.status ?? '?'} ${res?.location ?? ''}`.trim();
  });
}
