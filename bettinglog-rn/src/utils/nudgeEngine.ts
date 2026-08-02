import type { SpendingSummary } from '@/types/spending';
import { peso, opportunityCost, limitProximity } from '@/utils/mathEngine';
import { PAGCOR_REFERENCE_BETS } from '@/constants/phPrices';

// Composes the "reality smart-math" nudge shown when a gambling app/site is
// detected. Design rules the user asked for:
//   - Never annoying: kept short, sent at most once per cooldown (the caller
//     throttles), and worded as a calm friend - never shaming or alarmist.
//   - "Gaslight them out of gambling" = gentle cognitive reframing: make the
//     bet feel smaller and the alternative feel realer, using the user's OWN
//     numbers (opportunity cost, streak, spending limit).
// Pure function; the notification layer decides whether/when to actually send.

export interface NudgeContext {
  appName: string;
  source: 'app' | 'website';
  spendingSummary: SpendingSummary | null;
  streak: number;
}

// Rotates so back-to-back detections don't read identically.
let rotation = 0;

export function buildGamblingNudge(ctx: NudgeContext): { title: string; body: string } {
  const cost = PAGCOR_REFERENCE_BETS.averageSessionSpend;
  const opened = ctx.source === 'website' ? `${ctx.appName}` : `${ctx.appName}`;

  // Candidate lines - only include the streak/limit ones when we have the data,
  // so the message always says something true.
  const candidates: { title: string; body: string }[] = [
    {
      title: 'Quick pause 🌿',
      body: `About to open ${opened}? A session is usually about ${peso(cost)} - ${opportunityCost(cost)}. The urge fades in ~10 minutes. Your call.`,
    },
    {
      title: 'One breath first 🫧',
      body: `${opened} again? Most opens end in a quiet regret, not a jackpot. ${opportunityCost(cost)} is real - the win isn't.`,
    },
    {
      title: 'Future you says hi 🌱',
      body: `${peso(cost)} skipped today is ${peso(cost * 30)} in a month. ${opened} can wait - you can close it right now.`,
    },
  ];

  if (ctx.streak > 0) {
    candidates.push({
      title: 'Protect the streak 🔥',
      body: `You're ${ctx.streak} day${ctx.streak === 1 ? '' : 's'} bet-free. That streak is worth more than anything ${opened} pays out tonight.`,
    });
  }

  if (ctx.spendingSummary && ctx.spendingSummary.limit > 0) {
    candidates.push({
      title: 'Reality check 💡',
      body: `${limitProximity(ctx.spendingSummary)} Opening ${opened} now could undo that in one tap.`,
    });
  }

  const pick = candidates[rotation % candidates.length];
  rotation += 1;
  return pick;
}
