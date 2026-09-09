import type { MoralReasoningLevel, ReadinessStage, RiskLevel } from '@/types/psychology';
import type { SpendingSummary } from '@/types/spending';
import type { UsageBand } from '@/types/usage';
import { peso, opportunityCost, limitProximity } from '@/utils/mathEngine';
import { PAGCOR_REFERENCE_BETS } from '@/constants/phPrices';

// Rule-based reply generator for the in-app consultation. Pure function:
// give it what the user said plus their current context, get back the app's
// reply. The theories are applied here explicitly:
//
//  - Kohlberg (moral development): the SAME advice is framed differently per
//    level - pre-conventional hears consequences ("you lose ₱X"), conventional
//    hears relationships/norms ("the people counting on you"), and
//    post-conventional hears principles ("the life you decided to build").
//  - Theories of readiness (TTM stages of change): the call-to-action matches
//    the user's stage - no "quit today" pressure on a contemplator.
//  - Law of Exercise: high open-counts are explained as habit reinforcement.
//  - Opportunity cost: money talk always converts to concrete PH goods.
//  - Current time: late-night messages get a specific late-night warning,
//    because that is when most slips happen.

export interface ConsultationContext {
  riskLevel?: RiskLevel;
  readinessStage: ReadinessStage;
  moralReasoningLevel: MoralReasoningLevel;
  spendingSummary?: SpendingSummary | null;
  usageBand?: UsageBand;
  streak: number;
  now?: Date; // injectable for tests; defaults to the real current time
}

// Kohlberg-tuned framing appended to money/urge advice.
function moralFrame(level: MoralReasoningLevel, amount: number): string {
  switch (level) {
    case 'pre-conventional':
      return `Concretely: skipping this bet keeps ${peso(amount)} in your pocket tonight.`;
    case 'conventional':
      return `Think of the people who count on you - ${peso(amount)} kept is something you can show them.`;
    case 'post-conventional':
      return `You already decided what kind of life you want. ${peso(amount)} is a small vote for it.`;
  }
}

// Stage-appropriate call to action (Transtheoretical Model).
function stageAction(stage: ReadinessStage): string {
  switch (stage) {
    case 'pre-contemplation':
      return 'No pressure to change anything today - just notice the pattern and write it down.';
    case 'contemplation':
      return 'You are weighing it. Try listing what gambling costs you vs. gives you - the diary is a good place.';
    case 'preparation':
      return 'You are close. Pick ONE step from your behavior plan and give it a date.';
    case 'action':
      return 'You are in the action stage - protect the routine that is working. One day at a time.';
    case 'maintenance':
      return 'You have built real distance. The goal now is protecting it: know your triggers, keep the check-ins.';
  }
}

function isLateNight(now: Date): boolean {
  const h = now.getHours();
  return h >= 22 || h < 5;
}

export function generateAppReply(userText: string, ctx: ConsultationContext): string {
  const now = ctx.now ?? new Date();
  const text = userText.toLowerCase();
  const sessionCost = PAGCOR_REFERENCE_BETS.averageSessionSpend;
  const parts: string[] = [];

  // Crisis words always come first and short-circuit everything else.
  if (/suicide|kill myself|end it|hurt myself|mamatay/.test(text)) {
    return (
      'I hear you, and this matters more than anything about gambling. Please talk to a person right now: ' +
      'NCMH Crisis Hotline 1553 (toll-free, 24/7) or 911. You are not alone in this.'
    );
  }

  if (/urge|tempt|itch|crave|gusto|want to bet|about to bet/.test(text)) {
    parts.push('Urges peak and pass in about 10 minutes. Do not fight it - time it. Breathe, and watch it fade.');
    parts.push(moralFrame(ctx.moralReasoningLevel, sessionCost));
  } else if (/money|spend|lost|loss|utang|debt|budget|pera/.test(text)) {
    if (ctx.spendingSummary && ctx.spendingSummary.limit > 0) {
      parts.push(limitProximity(ctx.spendingSummary));
      parts.push(opportunityCost(ctx.spendingSummary.current));
    } else {
      parts.push(`One ordinary session runs about ${peso(sessionCost)}. ${opportunityCost(sessionCost)}.`);
    }
    parts.push(moralFrame(ctx.moralReasoningLevel, sessionCost));
  } else if (/slip|relapse|failed|gambled again|natalo/.test(text)) {
    parts.push('A slip is data, not a verdict. What mattered most is that you told the truth about it.');
    if (ctx.streak > 0) {
      parts.push(`Before this, you had ${ctx.streak} bet-free day${ctx.streak === 1 ? '' : 's'} - that progress is still real.`);
    }
    parts.push(stageAction(ctx.readinessStage));
  } else if (/app|open|kept opening|screen time/.test(text) && ctx.usageBand) {
    switch (ctx.usageBand) {
      case 'severe':
      case 'high':
        parts.push('Your open-count is high. Every open strengthens the habit loop - deleting or hiding the app breaks the cue.');
        break;
      default:
        parts.push('Your open-count is under control. Each day you do not open the app, the connection weakens - that is the Law of Exercise working for you.');
    }
  } else if (/help|counselor|therapist|hotline|professional/.test(text)) {
    parts.push('Talking to a professional is a strong move, not a last resort. NCMH: 1553 (toll-free). For emergencies: 911.');
    if (ctx.riskLevel === 'high' || ctx.riskLevel === 'severe') {
      parts.push('Your last assessment also points that way - a real-person consultation is the right next step.');
    }
  } else {
    parts.push('Tell me more. What happened, and what were you feeling right before it?');
    parts.push(stageAction(ctx.readinessStage));
  }

  if (isLateNight(now)) {
    parts.push('Also - it is late. Most slips happen at this hour. If you can, put the phone down after this and rest.');
  }

  return parts.join(' ');
}
