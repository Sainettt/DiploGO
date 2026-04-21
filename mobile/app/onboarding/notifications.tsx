import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeButton } from '../../src/components/ThemeButton';
import { onboardingApi } from '../../src/api/onboarding.api';
import { userApi } from '../../src/api/user.api';
import {
  requestNotificationPermissions,
  scheduleDailyReminders,
  getExpoPushToken,
  cancelDailyReminders,
} from '../../src/services/notifications';

const IS_WEB = Platform.OS === 'web';

export default function OnboardingNotificationsScreen() {
  const router = useRouter();
  const { purpose, dailyTime } = useLocalSearchParams<{ purpose: string; dailyTime: string }>();
  const progressAnim = useRef(new Animated.Value(0.66)).current;
  const bellAnim = useRef(new Animated.Value(1)).current;
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Web doesn't support local notifications — skip this step automatically.
    if (IS_WEB) {
      finish(false);
    }
  }, []);

  const finish = async (pushNotifications: boolean) => {
    try {
      await onboardingApi.save({
        purpose,
        dailyTimeSpent: Number(dailyTime),
        pushNotifications,
        onBoardingCompleted: true,
      });
    } catch (e) {
      console.error('Onboarding save failed:', e);
    }
    router.replace('/home');
  };

  const handleAllow = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const granted = await requestNotificationPermissions();

      if (granted) {
        await scheduleDailyReminders();

        const token = await getExpoPushToken();
        if (token) {
          await userApi.updatePushToken(token).catch((e) => {
            console.warn('Failed to register push token:', e);
          });
        }

        await finish(true);
      } else {
        await finish(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await cancelDailyReminders().catch(() => null);
      await userApi.updatePushToken(null).catch(() => null);
      await finish(false);
    } finally {
      setBusy(false);
    }
  };

  // On web this screen auto-redirects — render nothing to avoid a flash.
  if (IS_WEB) return null;

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Progress bar */}
      <View className="h-1 bg-[#1E1E1E] mx-6 mt-14 rounded-full overflow-hidden">
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: '#03DAC6',
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>

      <View className="flex-1 px-6 items-center justify-center">
        <Animated.View
          style={{
            transform: [{ scale: bellAnim }],
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: '#2A1A3E',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <Text style={{ fontSize: 44 }}>🔔</Text>
        </Animated.View>

        <Text className="text-[28px] font-bold text-white text-center mb-4">
          Never miss a day
        </Text>
        <Text className="text-base text-[#B3B3B3] text-center leading-6 px-4">
          Enable notifications to get daily reminders and stay consistent with your learning goals.
        </Text>
      </View>

      <View className="px-6 pb-10 gap-4">
        <ThemeButton
          title={busy ? 'Setting up...' : 'Allow Notifications'}
          onPress={handleAllow}
          disabled={busy}
        />
        <ThemeButton
          title="Maybe Later"
          variant="outline"
          onPress={handleSkip}
          disabled={busy}
        />
      </View>
    </View>
  );
}
