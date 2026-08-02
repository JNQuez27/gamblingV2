import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/services/supabase';
import type { NotificationKind, NotificationPreferences } from '@/types/notification';

// All local-notification plumbing lives here: permission, the recurring
// weekly-check-in reminder, immediate alerts (the "alarm" for a bad weekly
// score), quiet hours, and persistence of preferences + a log of what was
// sent. Web has no local notifications - every call degrades to a no-op.

const WEEKLY_REMINDER_ID = 'weekly-checkin-reminder';
const IS_WEB = Platform.OS === 'web';

// Show alerts even while the app is foregrounded.
if (!IS_WEB) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (IS_WEB) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// ── Quiet hours ─────────────────────────────────────────────────

// "22:00"–"06:00" style windows, evaluated against the current time.
// Handles windows that cross midnight.
export function isWithinQuietHours(
  prefs: Pick<NotificationPreferences, 'quietStart' | 'quietEnd'>,
  now: Date = new Date(),
): boolean {
  if (!prefs.quietStart || !prefs.quietEnd) return false;
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const start = toMinutes(prefs.quietStart);
  const end = toMinutes(prefs.quietEnd);
  const cur = now.getHours() * 60 + now.getMinutes();
  return start <= end ? cur >= start && cur < end : cur >= start || cur < end;
}

// ── Weekly reminder ─────────────────────────────────────────────

// Recurring reminder every Sunday 7 PM local time (expo weekday: 1 = Sunday).
export async function scheduleWeeklyCheckinReminder(): Promise<void> {
  if (IS_WEB) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await cancelWeeklyCheckinReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_REMINDER_ID,
    content: {
      title: 'Weekly check-in 📋',
      body: 'Five quick questions about your week. It takes one minute.',
      data: { route: '/weekly-checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 19,
      minute: 0,
    },
  });
}

export async function cancelWeeklyCheckinReminder(): Promise<void> {
  if (IS_WEB) return;
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_REMINDER_ID);
}

// ── Immediate alert ─────────────────────────────────────────────

// The "alarm": fire a local notification right now (e.g. a high weekly score).
// Respects quiet hours; returns whether it was actually shown.
export async function sendImmediateAlert(
  title: string,
  body: string,
  prefs?: Pick<NotificationPreferences, 'quietStart' | 'quietEnd'>,
): Promise<boolean> {
  if (IS_WEB) return false;
  if (prefs && isWithinQuietHours(prefs)) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
  return true;
}

// ── Persistence ─────────────────────────────────────────────────

export async function logNotification(
  userId: string,
  kind: NotificationKind,
  title: string,
  body: string,
): Promise<void> {
  const { error } = await supabase.from('notification_logs').insert({
    user_id: userId,
    kind,
    title,
    body,
  });
  if (error) throw error;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    mathEngine: data.math_engine,
    checklist: data.checklist,
    weeklyCheckin: data.weekly_checkin,
    quietStart: data.quiet_start ?? undefined,
    quietEnd: data.quiet_end ?? undefined,
  };
}

export async function saveNotificationPreferences(
  userId: string,
  prefs: NotificationPreferences,
): Promise<void> {
  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: userId,
    math_engine: prefs.mathEngine,
    checklist: prefs.checklist,
    weekly_checkin: prefs.weeklyCheckin,
    quiet_start: prefs.quietStart ?? null,
    quiet_end: prefs.quietEnd ?? null,
  });
  if (error) throw error;

  // Keep the OS-level schedule consistent with the saved preference.
  if (prefs.weeklyCheckin) await scheduleWeeklyCheckinReminder();
  else await cancelWeeklyCheckinReminder();
}
