import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-[#121212] px-6 justify-center items-center">
      {/* Card */}
      <View
        className="w-full rounded-2xl p-8 items-center mb-12"
        style={{
          backgroundColor: '#1E1E1E',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🎮</Text>
        <Text className="text-[26px] font-bold text-white text-center mb-2">
          Welcome to DiploGO
        </Text>
        <Text className="text-base text-[#B3B3B3] text-center leading-6">
          Your gamified learning journey starts here.
        </Text>

        {/* Accent divider */}
        <View className="w-16 h-1 rounded-full bg-[#BB86FC] mt-6" />

        {/* Stats placeholder */}
        <View className="flex-row gap-8 mt-6">
          <View className="items-center">
            <Text className="text-[22px] font-bold text-[#03DAC6]">0</Text>
            <Text className="text-xs text-[#B3B3B3] mt-1">Streak</Text>
          </View>
          <View className="items-center">
            <Text className="text-[22px] font-bold text-[#BB86FC]">0</Text>
            <Text className="text-xs text-[#B3B3B3] mt-1">Topics</Text>
          </View>
          <View className="items-center">
            <Text className="text-[22px] font-bold text-[#03DAC6]">0</Text>
            <Text className="text-xs text-[#B3B3B3] mt-1">Score</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout}>
        <Text className="text-[#B3B3B3] text-sm">Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
