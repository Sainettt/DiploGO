import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame } from 'lucide-react-native';

const MOCK_TOPICS = [
  { id: '1', title: 'JavaScript', emoji: '🟨', progress: 0 },
  { id: '2', title: 'Python', emoji: '🐍', progress: 0 },
  { id: '3', title: 'History', emoji: '📜', progress: 0 },
  { id: '4', title: 'Math', emoji: '➗', progress: 0 },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Top section — Streak */}
        <View className="px-6 pt-4">
          <View
            className="rounded-2xl p-6 flex-row items-center"
            style={{
              backgroundColor: '#1E1E1E',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              className="w-14 h-14 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: 'rgba(255, 138, 76, 0.15)' }}
            >
              <Flame color="#FF8A4C" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-wider text-[#B3B3B3]">
                Current Streak
              </Text>
              <Text className="text-3xl font-bold text-white mt-1">
                0 <Text className="text-base font-medium text-[#B3B3B3]">days</Text>
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-[22px] font-bold text-[#03DAC6]">0</Text>
              <Text className="text-xs text-[#B3B3B3] mt-1">Best</Text>
            </View>
          </View>
        </View>

        {/* Middle section — Topics */}
        <View className="px-6 mt-8">
          <Text className="text-lg font-bold text-white mb-4">Choose a topic</Text>
          <View className="flex-row flex-wrap justify-between">
            {MOCK_TOPICS.map((topic) => (
              <Pressable
                key={topic.id}
                className="w-[48%] rounded-2xl p-4 mb-3"
                style={{ backgroundColor: '#1E1E1E' }}
              >
                <Text style={{ fontSize: 32 }}>{topic.emoji}</Text>
                <Text className="text-base font-semibold text-white mt-2">
                  {topic.title}
                </Text>
                <View className="h-1 rounded-full bg-[#2A2A2A] mt-3 overflow-hidden">
                  <View
                    className="h-full bg-[#BB86FC]"
                    style={{ width: `${topic.progress}%` }}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
