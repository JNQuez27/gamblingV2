import type { GamblingCategory } from '../../constants/gamblingApps';

// One self-reported "I opened a gambling app" record for a given day.
export interface GamblingUsageLog {
  id: string;
  appName: string;
  category?: GamblingCategory;
  openCount: number;    // times opened (the core Law-of-Exercise metric)
  timeSpent: number;    // minutes (optional)
  loggedDate: string;   // "YYYY-MM-DD"
  createdAt: string;
}

// A gambling app rolled up across all logs, for the top-3 ranking.
export interface RankedApp {
  appName: string;
  totalOpens: number;
  totalMinutes: number;
  rank: number;         // 1..N
}

// How heavy the opening habit is — decided by src/utils/thresholdEngine.ts.
export type UsageBand = 'controlled' | 'elevated' | 'high' | 'severe';
