// A questionnaire the app can run. Either a published validated instrument
// (e.g. PGSI) or a custom one that must pass the 3-validator rule before use.
export type InstrumentSource = 'validated' | 'custom';

export interface InstrumentItem {
  id: string;
  itemOrder: number;
  prompt: string;
  // Answer options with their point values, e.g.
  // [{ label: 'Never', value: 0 }, { label: 'Sometimes', value: 1 }, ...]
  scale: { label: string; value: number }[];
}

export interface Instrument {
  id: string;
  name: string;         // "PGSI"
  version: string;
  construct: string;    // what it measures
  source: InstrumentSource;
  isActive: boolean;    // custom instruments: true only after 3 approvals
  items: InstrumentItem[];
}

export type ValidatorVerdict = 'approved' | 'revise' | 'rejected';

export interface InstrumentValidator {
  id: string;
  instrumentId: string;
  validatorName: string;
  credentials?: string;
  verdict: ValidatorVerdict;
  remarks?: string;
  validatedAt: string;
}
