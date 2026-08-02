import type { SpendingSummary } from '@/types/spending';
import { REFERENCE_COSTS } from '@/constants/phPrices';

// Replaces motivational quotes with personal, numeric, opportunity-cost
// messages built from the user's own data. Every function here is pure and
// returns a plain string the notification/UI layer can display.
// PH reference costs live in constants/phPrices.ts (single source of truth,
// alongside the PAGCOR-anchored bet sizes).

export function peso(amount: number): string {
  return `₱${Math.round(amount).toLocaleString('en-PH')}`;
}

// "₱6,000 this month ≈ 1 month of groceries"
export function opportunityCost(amount: number): string {
  if (amount >= REFERENCE_COSTS.monthGroceries) {
    const months = (amount / REFERENCE_COSTS.monthGroceries).toFixed(1);
    return `${peso(amount)} ≈ ${months} month(s) of groceries`;
  }
  const rides = Math.floor(amount / REFERENCE_COSTS.jeepneyFare);
  return `${peso(amount)} ≈ ${rides} jeepney rides`;
}

// "At ₱1,500/week you're on track for ₱78,000 this year."
export function yearlyProjection(weeklySpend: number): string {
  return `At ${peso(weeklySpend)}/week you're on track for ${peso(weeklySpend * 52)} this year.`;
}

// "You're at 85% of your ₱5,000 limit - ₱750 left."
export function limitProximity(summary: SpendingSummary): string {
  if (summary.isOverLimit) {
    return `You're ${peso(summary.current - summary.limit)} over your ${peso(summary.limit)} limit.`;
  }
  return `You're at ${summary.percentUsed}% of your ${peso(summary.limit)} limit - ${peso(summary.remaining)} left.`;
}

// "You opened gambling apps 34× this week, up 21% from last week."
export function frequencyMath(thisWeek: number, lastWeek: number): string {
  if (lastWeek === 0) {
    return `You opened gambling apps ${thisWeek}× this week.`;
  }
  const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  const direction = change >= 0 ? `up ${change}%` : `down ${Math.abs(change)}%`;
  return `You opened gambling apps ${thisWeek}× this week, ${direction} from last week.`;
}

// Law of Effect - surface the satisfying outcome of restraint.
// "3 days without gambling = ₱1,200 kept."
export function savingsReinforcement(cleanDays: number, dailyAverageSpend: number): string {
  return `${cleanDays} day(s) without gambling = ${peso(cleanDays * dailyAverageSpend)} kept.`;
}
