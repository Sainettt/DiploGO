import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  DAYS_SCHEDULED_AHEAD,
  getRandomReminderMessage,
} from '../utils/notificationMessages';

/**
 * Notification service: permissions, scheduling daily local reminders,
 * and obtaining an Expo push token for server-sent notifications.
 *
 * All functions are safe to call on web — they return early with a no-op
 * because expo-notifications is not supported in a browser environment.
 */

export const IS_WEB = Platform.OS === 'web';

export const DAILY_REMINDER_HOUR = 19; // 19:00 local time
export const DAILY_REMINDER_MINUTE = 0;

const ANDROID_CHANNEL_ID = 'daily-reminder';
const DAILY_REMINDER_DATA_TYPE = 'daily-reminder';

// Foreground behavior: also show banner/list when the app is open.
// Called once from _layout.tsx.
export function configureNotificationHandler(): void {
  if (IS_WEB) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Daily Reminders',
    description: 'Daily reminders to keep your streak alive',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#BB86FC',
  });
}

/**
 * Asks the OS for permission. Returns true if granted.
 * Returns false on web (notifications not supported in browser).
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (IS_WEB) return false;

  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (IS_WEB) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Get the Expo Push Token for this device.
 * Returns null on web and simulators.
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (IS_WEB || !Device.isDevice) return null;

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return token.data;
  } catch (e) {
    console.warn('Failed to get Expo push token', e);
    return null;
  }
}

/**
 * Schedule N one-off local notifications — one per day for the next N days —
 * each with a random Duolingo-style message. No-op on web.
 */
export async function scheduleDailyReminders(opts?: {
  hour?: number;
  minute?: number;
  days?: number;
}): Promise<void> {
  if (IS_WEB) return;

  await ensureAndroidChannel();
  await cancelDailyReminders();

  const hour = opts?.hour ?? DAILY_REMINDER_HOUR;
  const minute = opts?.minute ?? DAILY_REMINDER_MINUTE;
  const days = opts?.days ?? DAYS_SCHEDULED_AHEAD;

  const now = new Date();

  for (let i = 1; i <= days; i++) {
    const when = new Date();
    when.setDate(now.getDate() + i);
    when.setHours(hour, minute, 0, 0);

    if (i === 1 && when.getTime() <= now.getTime()) {
      when.setDate(when.getDate() + 1);
    }

    const { title, body } = getRandomReminderMessage();

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: DAILY_REMINDER_DATA_TYPE, route: '/home' },
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
  }
}

/** Cancel only our daily reminders. No-op on web. */
export async function cancelDailyReminders(): Promise<void> {
  if (IS_WEB) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.type === DAILY_REMINDER_DATA_TYPE)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
