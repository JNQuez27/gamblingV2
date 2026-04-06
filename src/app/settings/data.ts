export type ToggleSetting = {
  key: string;
  label: string;
  desc: string;
  value: boolean;
};

export const defaultToggleSettings: ToggleSetting[] = [
  {
    key: "daily_reminder",
    label: "Daily reminder",
    desc: "Get a gentle nudge each day at 8:00 AM",
    value: true,
  },
  {
    key: "streak_alerts",
    label: "Streak alerts",
    desc: "Remind me if I'm about to lose my streak",
    value: true,
  },
  {
    key: "insight_notif",
    label: "Weekly insights",
    desc: "Receive a summary every Sunday evening",
    value: false,
  },
  {
    key: "pause_prompts",
    label: "Pause prompts",
    desc: "Random mindfulness nudges throughout the day",
    value: false,
  },
];

export const privacyDefaults = {
  biometric: false,
  analytics: true,
};
