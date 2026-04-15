import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeButton } from '../../src/components/ThemeButton';

const TIME_OPTIONS = [
  { id: 5, label: '5 min', description: 'Quick daily boost' },
  { id: 10, label: '10 min', description: 'Steady progress' },
  { id: 15, label: '15 min', description: 'Solid habit' },
  { id: 30, label: '30 min', description: 'Deep focus' },
];

export default function OnboardingTimeScreen() {
  const router = useRouter();
  const { purpose } = useLocalSearchParams<{ purpose: string }>();
  const [selected, setSelected] = useState<number | null>(null);
  const progressAnim = useRef(new Animated.Value(0.33)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.66,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    router.push({
      pathname: '/onboarding/notifications',
      params: { purpose, dailyTime: String(selected) },
    });
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

      <View className="flex-1 px-6 pt-9">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-[28px] font-bold text-white mb-2">How much time{'\n'}per day?</Text>
          <Text className="text-base text-[#B3B3B3]">Pick a goal that fits your schedule.</Text>
        </View>

        {/* Time options */}
        <View className="gap-3">
          {TIME_OPTIONS.map((item) => {
            const isSelected = selected === item.id;
            return (
              <Pressable key={item.id} onPress={() => setSelected(item.id)}>
                <View
                  className="flex-row items-center rounded-xl px-5 py-4"
                  style={{
                    backgroundColor: isSelected ? '#2A1A3E' : '#1E1E1E',
                    borderWidth: 2,
                    borderColor: isSelected ? '#BB86FC' : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  {/* Indicator dot */}
                  <View
                    className="w-5 h-5 rounded-full mr-4 items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor: isSelected ? '#BB86FC' : '#B3B3B3',
                    }}
                  >
                    {isSelected && (
                      <View className="w-2.5 h-2.5 rounded-full bg-[#BB86FC]" />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-base font-bold"
                      style={{ color: isSelected ? '#BB86FC' : '#FFFFFF' }}
                    >
                      {item.label}
                    </Text>
                    <Text className="text-sm text-[#B3B3B3] mt-0.5">{item.description}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Continue */}
      <View className="px-6 pb-10">
        <ThemeButton
          title="Continue"
          onPress={handleContinue}
          style={{ opacity: selected ? 1 : 0.4 }}
        />
      </View>
    </View>
  );
}
