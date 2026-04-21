import '../global.css';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  configureNotificationHandler,
  hasNotificationPermission,
  scheduleDailyReminders,
} from '../src/services/notifications';
import { onboardingApi } from '../src/api/onboarding.api';

const IS_WEB = Platform.OS === 'web';

// Configure foreground notification behavior once at module load.
// The function itself is a no-op on web, so this is safe.
configureNotificationHandler();

export default function Layout() {
  const router = useRouter();

  // expo-notifications types are only available on native — import lazily to
  // avoid crashing the web bundle when the package is not polyfilled.
  const responseListenerRef = useRef<{ remove(): void } | null>(null);

  // 1) Re-schedule daily reminders on every native app start.
  useEffect(() => {
    if (IS_WEB) return;

    (async () => {
      const jwt = await AsyncStorage.getItem('jwt_token');
      if (!jwt) return;

      const granted = await hasNotificationPermission();
      if (!granted) return;

      const settings = await onboardingApi.getOnBoarding().catch(() => null);
      if (settings?.pushNotifications) {
        await scheduleDailyReminders();
      }
    })();
  }, []);

  // 2) Handle notification taps (warm + cold start) — native only.
  useEffect(() => {
    if (IS_WEB) return;

    // Dynamic import keeps the web bundle clean.
    import('expo-notifications').then((Notifications) => {
      // Cold start: app launched by tapping a notification.
      Notifications.getLastNotificationResponseAsync().then((res) => {
        const route = res?.notification?.request?.content?.data?.route;
        if (typeof route === 'string') router.replace(route as any);
      });

      // Warm: app already in memory when notification is tapped.
      responseListenerRef.current =
        Notifications.addNotificationResponseReceivedListener((res) => {
          const route = res?.notification?.request?.content?.data?.route;
          if (typeof route === 'string') router.replace(route as any);
        });
    });

    return () => {
      responseListenerRef.current?.remove();
    };
  }, [router]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121212' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
