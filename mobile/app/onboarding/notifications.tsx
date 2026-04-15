import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeButton } from '../../src/components/ThemeButton';
import { onboardingApi } from '../../src/api/onboarding.api';

export default function OnboardingNotificationsScreen() {
  const router = useRouter();
  const { purpose, dailyTime } = useLocalSearchParams<{ purpose: string; dailyTime: string }>();
  const progressAnim = useRef(new Animated.Value(0.66)).current;
  const bellAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Bell pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(bellAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
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
    // TODO: call expo-notifications requestPermissionsAsync() here
    // import * as Notifications from 'expo-notifications';
    // await Notifications.requestPermissionsAsync();
    await finish(true);
  };

  const handleSkip = async () => {
    await finish(false);
  };

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
        {/* Bell icon */}
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

        {/* Text */}
        <Text className="text-[28px] font-bold text-white text-center mb-4">
          Never miss a day
        </Text>
        <Text className="text-base text-[#B3B3B3] text-center leading-6 px-4">
          Enable notifications to get daily reminders and stay consistent with your learning goals.
        </Text>
      </View>

      {/* Actions */}
      <View className="px-6 pb-10 gap-4">
        <ThemeButton title="Allow Notifications" onPress={handleAllow} />
        <ThemeButton title="Maybe Later" variant="outline" onPress={handleSkip} />
      </View>
    </View>
  );
}
