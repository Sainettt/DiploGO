import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeButton } from '../../src/components/ThemeButton';

const PURPOSES = [
  { id: 'programming', label: 'Programming', emoji: '💻' },
  { id: 'languages', label: 'Languages', emoji: '🌍' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'mathematics', label: 'Mathematics', emoji: '➗' },
  { id: 'history', label: 'History', emoji: '📚' },
  { id: 'other', label: 'Other', emoji: '🎨' },
];

export default function OnboardingPurposeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.33,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    router.push({ pathname: '/onboarding/time', params: { purpose: selected } });
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

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 36, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-10">
          <Text className="text-[28px] font-bold text-white mb-2">What do you want{'\n'}to learn?</Text>
          <Text className="text-base text-[#B3B3B3]">Choose a topic that interests you most.</Text>
        </View>

        {/* Purpose grid */}
        <View className="flex-row flex-wrap gap-3">
          {PURPOSES.map((item) => {
            const isSelected = selected === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelected(item.id)}
                style={{ width: '47%' }}
              >
                <View
                  className="rounded-xl p-5 items-center justify-center"
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
                  <Text style={{ fontSize: 36, marginBottom: 10 }}>{item.emoji}</Text>
                  <Text
                    className="text-sm font-bold text-center"
                    style={{ color: isSelected ? '#BB86FC' : '#FFFFFF' }}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

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
