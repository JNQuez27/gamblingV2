import type { ReadinessStage, TBPStep } from '@/types/psychology';

// Default Theoretical Behavior Plan, built on Ajzen's Theory of Planned
// Behavior (TPB). Each step targets one TPB construct in order:
//   1. attitude               → see the true cost/benefit
//   2. subjective norm        → involve the people whose opinion matters
//   3. perceived behavioral control → remove friction, add obstacles to betting
//   4. intention              → a dated, concrete commitment
//   5. behavior               → the action itself, kept reviewable
//
// The wording adapts to the user's readiness stage (Transtheoretical Model)
// so a contemplator is never handed an action-stage plan.

type NewStep = Omit<TBPStep, 'id' | 'createdAt'>;

export function defaultTBPSteps(stage: ReadinessStage): NewStep[] {
  const early = stage === 'pre-contemplation' || stage === 'contemplation';

  const steps: NewStep[] = [
    {
      stepNumber: 1,
      title: 'See the real cost (attitude)',
      description: early
        ? 'For one week, just log every bet and every urge. No judgment - the numbers will speak.'
        : 'Review your spending log and write one sentence about what that money could have been.',
      status: 'pending',
    },
    {
      stepNumber: 2,
      title: 'Tell one person (subjective norm)',
      description:
        'Pick one person you trust and tell them you are working on your gambling. Their awareness alone changes the math.',
      status: 'pending',
    },
    {
      stepNumber: 3,
      title: 'Add friction (perceived control)',
      description:
        'Move gambling apps off your home screen - or delete them. Remove saved cards from betting sites. Make the bet cost effort.',
      status: 'pending',
    },
    {
      stepNumber: 4,
      title: 'Commit to a number (intention)',
      description: early
        ? 'Choose a spending limit you would be comfortable telling your family about, and set it in the app.'
        : 'Set (or lower) your monthly limit in Settings and decide the date of your next bet-free week.',
      status: 'pending',
    },
    {
      stepNumber: 5,
      title: 'Act and review (behavior)',
      description:
        'Do the daily check-in every day this week, then answer the weekly questionnaire honestly. The plan only works if it is reviewed.',
      status: 'pending',
    },
  ];

  return steps;
}
