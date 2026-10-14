import { assertHttps, birthYear, buildBundle, fhirGender, summarizeResponse, type AssessmentRecord } from './lib';

const record: AssessmentRecord = {
  sessionId: '11111111-1111-4111-8111-111111111111',
  instrument: 'PGSI',
  completedAt: '2026-10-14T03:15:00.000Z',
  totalScore: 5,
  riskLevel: 'moderate',
  category: 'Moderate risk',
  isBaseline: true,
  patient: { pseudonym: 'abc123', gender: 'prefer_not', birthdate: '2003-06-21' },
  answers: [
    { order: 2, prompt: 'Second item?', value: 1 },
    { order: 1, prompt: 'First item?', value: 3 },
  ],
};
const ids = {
  patient: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  response: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  observation: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
};
const bundle = buildBundle(record, ids);
const [patient, response, observation] = bundle.entry.map((e) => e.resource as any);

describe('buildBundle', () => {
  test('is a FHIR transaction of Patient, QuestionnaireResponse, Observation', () => {
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('transaction');
    expect(bundle.entry.map((e) => e.resource.resourceType)).toEqual([
      'Patient',
      'QuestionnaireResponse',
      'Observation',
    ]);
    expect(bundle.entry.map((e) => e.request.method)).toEqual(['POST', 'POST', 'POST']);
  });

  test('internal references resolve to the bundle entries', () => {
    expect(response.subject.reference).toBe(bundle.entry[0].fullUrl);
    expect(observation.subject.reference).toBe(bundle.entry[0].fullUrl);
    expect(observation.derivedFrom[0].reference).toBe(bundle.entry[1].fullUrl);
  });

  test('patient is pseudonymized and minimized', () => {
    expect(patient.identifier[0].value).toBe('abc123');
    expect(patient.name).toBeUndefined();
    expect(patient.telecom).toBeUndefined();
    expect(patient.birthDate).toBe('2003');
    expect(patient.gender).toBe('unknown');
  });

  test('answers are ordered by item and keep their scores', () => {
    expect(response.item.map((i: any) => [i.linkId, i.answer[0].valueInteger])).toEqual([
      ['1', 3],
      ['2', 1],
    ]);
    expect(response.status).toBe('completed');
  });

  test('observation carries the total, its interpretation, and a survey category', () => {
    expect(observation.valueInteger).toBe(5);
    expect(observation.interpretation[0].text).toBe('Moderate risk');
    expect(observation.code.coding[0].code).toBe('PGSI-total');
    expect(observation.category[0].coding[0]).toMatchObject({ code: 'survey' });
    expect(observation.note[0].text).toBe('Baseline assessment');
  });

  test('every entry is a conditional create, so re-sending does not duplicate', () => {
    for (const e of bundle.entry) {
      const id = Array.isArray((e.resource as any).identifier)
        ? (e.resource as any).identifier[0]
        : (e.resource as any).identifier;
      expect(e.request.ifNoneExist).toBe(`identifier=${id.system}|${id.value}`);
    }
  });

  test('serializes to plain JSON', () => {
    expect(JSON.parse(JSON.stringify(bundle))).toEqual(bundle);
  });
});

describe('helpers', () => {
  test('gender maps to FHIR administrative gender', () => {
    expect(fhirGender('male')).toBe('male');
    expect(fhirGender('Female')).toBe('female');
    expect(fhirGender('prefer_not')).toBe('unknown');
    expect(fhirGender(null)).toBe('unknown');
  });

  test('birth year only', () => {
    expect(birthYear('1999-01-31')).toBe('1999');
    expect(birthYear(null)).toBeUndefined();
  });

  test('only HTTPS targets are allowed', () => {
    expect(assertHttps('https://hapi.fhir.org/baseR4/')).toBe('https://hapi.fhir.org/baseR4');
    expect(() => assertHttps('http://hapi.fhir.org/baseR4')).toThrow(/https/);
  });

  test('reads a transaction-response, tolerates anything else', () => {
    const ok = {
      resourceType: 'Bundle',
      type: 'transaction-response',
      entry: [{ response: { status: '201 Created', location: 'Patient/9/_history/1' } }],
    };
    expect(summarizeResponse(ok)).toEqual(['201 Created Patient/9/_history/1']);
    expect(summarizeResponse(null)).toEqual([]);
    expect(summarizeResponse({ resourceType: 'OperationOutcome' })).toEqual([]);
  });
});
