import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Library } from 'lucide-react-native';

export default function LibraryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={['top']}>
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-white">Topic Library</Text>
        <Text className="text-sm text-[#B3B3B3] mt-1">
          Create and manage your topics
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(187, 134, 252, 0.15)' }}
        >
          <Library color="#BB86FC" size={36} />
        </View>
        <Text className="text-lg font-semibold text-white text-center">
          No topics yet
        </Text>
        <Text className="text-sm text-[#B3B3B3] text-center mt-2">
          Topic creation and question management will live here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
