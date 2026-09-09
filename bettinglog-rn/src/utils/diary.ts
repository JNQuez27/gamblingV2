// Shared diary helpers.

// A logged day counts as a slip when its note carries the honest-slip wording
// the check-in writes ("slip"), the word "gambled", or the Filipino "natalo"
// (lost). Manual reflections read as bet-free days. Centralised here so the
// rule stays identical everywhere it's used (home, diary, profile, journey map).
const SLIP_RE = /slip|gambled|natalo/i;

export function isSlipNote(note: string): boolean {
  return SLIP_RE.test(note);
}
