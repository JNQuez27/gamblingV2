// Kinds of notification the app sends. Math-engine messages replace the old
// motivational quotes; checklists nudge the healthy-habit loop; weekly is the
// recurring check-in prompt.
export type NotificationKind = 'math' | 'checklist' | 'weekly';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  sentAt: string;
}

export interface NotificationPreferences {
  mathEngine: boolean;
  checklist: boolean;
  weeklyCheckin: boolean;
  quietStart?: string;   // "HH:MM"
  quietEnd?: string;     // "HH:MM"
}
