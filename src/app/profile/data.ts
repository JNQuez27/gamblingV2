export interface Achievement {
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
  progress: number;
  goal: number;
  color: string;
  accent: string;
}

export interface StatCard {
  label: string;
  value: string;
  unit: string;
  color: string;
  border: string;
  text: string;
}

export interface WeeklySpending {
  day: string;
  amount: number | null;
}

export interface MoodHistoryItem {
  day: string;
  score: number;
}

export interface SpendingCategory {
  label: string;
  amount: number;
  color: string;
}

export interface ResourceItem {
  name: string;
  desc: string;
  contact: string;
  link: string;
}

export interface ResourceSection {
  category: string;
  accent: string;
  items: ResourceItem[];
}

export const achievements: Achievement[] = [
  {
    icon: "🔥",
    label: "3-Day Streak",
    desc: "3 days in a row",
    unlocked: true,
    progress: 3,
    goal: 3,
    color: "#fef3c7",
    accent: "#f59e0b",
  },
  {
    icon: "🌱",
    label: "First Reflection",
    desc: "Wrote your first diary entry",
    unlocked: true,
    progress: 1,
    goal: 1,
    color: "#dcfce7",
    accent: "#22c55e",
  },
  {
    icon: "🧘",
    label: "Mindful Week",
    desc: "7 consecutive pauses",
    unlocked: false,
    progress: 3,
    goal: 7,
    color: "#eff6ff",
    accent: "#3b82f6",
  },
  {
    icon: "🌟",
    label: "30-Day Champ",
    desc: "Complete 30-day streak",
    unlocked: false,
    progress: 3,
    goal: 30,
    color: "#fdf4ff",
    accent: "#a855f7",
  },
  {
    icon: "💎",
    label: "Deep Thinker",
    desc: "Write 10 diary entries",
    unlocked: false,
    progress: 7,
    goal: 10,
    color: "#ecfeff",
    accent: "#06b6d4",
  },
  {
    icon: "🏔️",
    label: "Peak Aware",
    desc: "Log 50 pauses",
    unlocked: false,
    progress: 24,
    goal: 50,
    color: "#fff7ed",
    accent: "#f97316",
  },
];

export const statCards: StatCard[] = [
  {
    label: "Current Streak",
    value: "3",
    unit: "days",
    color: "#fef3c7",
    border: "#fde68a",
    text: "#92400e",
  },
  {
    label: "Total Pauses",
    value: "24",
    unit: "logged",
    color: "#eff6ff",
    border: "#bfdbfe",
    text: "#1e40af",
  },
  {
    label: "Diary Entries",
    value: "7",
    unit: "written",
    color: "#f0fdf4",
    border: "#bbf7d0",
    text: "#166534",
  },
  {
    label: "Best Streak",
    value: "5",
    unit: "days",
    color: "#fdf4ff",
    border: "#e9d5ff",
    text: "#6b21a8",
  },
];

export const allWeeklySpending: WeeklySpending[] = [
  { day: "Sun", amount: 320 },
  { day: "Mon", amount: 150 },
  { day: "Tue", amount: 480 },
  { day: "Wed", amount: null },
  { day: "Thu", amount: null },
  { day: "Fri", amount: null },
  { day: "Sat", amount: null },
];

export const moodHistory: MoodHistoryItem[] = [
  { day: "Mon", score: 2 },
  { day: "Tue", score: 3 },
  { day: "Wed", score: 2 },
  { day: "Thu", score: 4 },
  { day: "Fri", score: 3 },
  { day: "Sat", score: 4 },
  { day: "Sun", score: 5 },
];

export const spendingCategories: SpendingCategory[] = [
  { label: "Gambling", amount: 560, color: "#f87171" },
  { label: "Food", amount: 320, color: "#34d399" },
  { label: "Transport", amount: 150, color: "#60a5fa" },
  { label: "Entertainment", amount: 210, color: "#a78bfa" },
  { label: "Others", amount: 90, color: "#fbbf24" },
];

export const RESOURCES: ResourceSection[] = [
  {
    category: "Crisis Support",
    accent: "#ef4444",
    items: [
      {
        name: "National Problem Gambling Helpline",
        desc: "24/7 confidential support",
        contact: "1-800-522-4700",
        link: "tel:1-800-522-4700",
      },
      {
        name: "Crisis Text Line",
        desc: "Text HOME to 741741",
        contact: "Text HOME to 741741",
        link: "sms:741741?body=HOME",
      },
    ],
  },
  {
    category: "Support Groups",
    accent: "#3b82f6",
    items: [
      {
        name: "Gamblers Anonymous",
        desc: "Peer-led support groups nationwide",
        contact: "gamblersanonymous.org",
        link: "https://www.gamblersanonymous.org",
      },
      {
        name: "SMART Recovery",
        desc: "Science-based self-empowerment",
        contact: "smartrecovery.org",
        link: "https://www.smartrecovery.org",
      },
    ],
  },
  {
    category: "Mental Health Care",
    accent: "#ec4899",
    items: [
      {
        name: "SAMHSA National Helpline",
        desc: "Free referral & info service",
        contact: "1-800-662-4357",
        link: "tel:1-800-662-4357",
      },
      {
        name: "BetterHelp Online Therapy",
        desc: "Affordable online counseling",
        contact: "betterhelp.com",
        link: "https://www.betterhelp.com",
      },
    ],
  },
  {
    category: "Education & Resources",
    accent: "#8b5cf6",
    items: [
      {
        name: "Stop It Now",
        desc: "Evidence-based gambling resources",
        contact: "stopitnow.org",
        link: "https://www.stopitnow.org",
      },
      {
        name: "Council on Problem Gambling",
        desc: "Prevention & education programs",
        contact: "ncpg.org",
        link: "https://www.ncpg.org",
      },
    ],
  },
];
