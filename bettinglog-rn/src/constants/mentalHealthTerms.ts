// Glossary connecting gambling behavior to mental-health language. Shown in
// the Learn tab so users can name what they are experiencing - naming a
// feeling or pattern is itself a documented step toward controlling it.

export interface MentalHealthTerm {
  term: string;
  short: string;      // one-line definition shown in the list
  detail: string;     // expanded explanation
}

export const MENTAL_HEALTH_TERMS: MentalHealthTerm[] = [
  {
    term: 'Urge',
    short: 'A strong, temporary pull to gamble.',
    detail:
      'Urges feel permanent but behave like waves - they build, peak in roughly 10 minutes, and fade. "Urge surfing" means riding the wave without acting on it.',
  },
  {
    term: 'Trigger',
    short: 'Anything that sets off an urge.',
    detail:
      'Common triggers: stress, boredom, payday, alcohol, late nights, and even ads. Your diary exists to find YOUR triggers, because they are personal.',
  },
  {
    term: 'Loss chasing',
    short: 'Betting again to win back what you lost.',
    detail:
      'The single strongest predictor of gambling harm. The brain treats "almost even" as a goal worth any cost - which is exactly how small losses become debts.',
  },
  {
    term: "Gambler's fallacy",
    short: 'Believing a win is "due" after losses.',
    detail:
      'Every spin, draw, and fight is independent. A losing streak does not raise your odds - the machine, the cards, and the lotto balls have no memory.',
  },
  {
    term: 'Gambling disorder',
    short: 'The clinical name for problem gambling.',
    detail:
      'Recognized in the DSM-5 as a behavioral addiction - the same reward circuitry as substance addiction. It is a health condition, not a character flaw, and it is treatable.',
  },
  {
    term: 'Comorbidity',
    short: 'When gambling problems travel with others.',
    detail:
      'Anxiety, depression, and substance use commonly appear alongside gambling problems, each feeding the other. Treating the mood often loosens the gambling - and vice versa.',
  },
  {
    term: 'Relapse / slip',
    short: 'Gambling again after a period of stopping.',
    detail:
      'In the stages-of-change model, relapse is an expected part of recovery, not the end of it. What matters is logging it honestly and returning to the plan.',
  },
  {
    term: 'Habit loop',
    short: 'Cue → routine → reward.',
    detail:
      'Each time a cue (notification, boredom) leads to the routine (opening the app) and a reward (excitement), the loop gets stronger - the Law of Exercise. Breaking any link weakens the whole loop.',
  },
];
