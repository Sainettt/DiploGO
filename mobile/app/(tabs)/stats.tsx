import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_STATS = [
  { label: 'Streak', value: '0', unit: 'days', color: '#FF8A4C' },
  { label: 'Score', value: '0', unit: 'xp', color: '#BB86FC' },
  { label: 'Accuracy', value: '0', unit: '%', color: '#03DAC6' },
  { label: 'Topics', value: '0', unit: '', color: '#BB86FC' },
];

export default function StatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 pt-4">
          <Text className="text-2xl font-bold text-white">Your Stats</Text>
          <Text className="text-sm text-[#B3B3B3] mt-1">
            Track your progress over time
          </Text>
        </View>

        <View className="px-6 mt-6 flex-row flex-wrap justify-between">
          {MOCK_STATS.map((stat) => (
            <View
              key={stat.label}
              className="w-[48%] rounded-2xl p-5 mb-3"
              style={{ backgroundColor: '#1E1E1E' }}
            >
              <Text className="text-xs uppercase tracking-wider text-[#B3B3B3]">
                {stat.label}
              </Text>
              <View className="flex-row items-baseline mt-2">
                <Text
                  className="text-3xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </Text>
                {stat.unit ? (
                  <Text className="text-sm text-[#B3B3B3] ml-1">{stat.unit}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View className="px-6 mt-4">
          <View
            className="rounded-2xl p-6 items-center"
            style={{ backgroundColor: '#1E1E1E' }}
          >
            <Text className="text-sm text-[#B3B3B3] text-center">
              Detailed charts and history coming soon.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
