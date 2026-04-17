import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe, Palette, Volume2, LogOut, ChevronRight } from 'lucide-react-native';

type SettingRow = {
  key: string;
  label: string;
  value: string;
  icon: React.ReactNode;
};

const SETTINGS: SettingRow[] = [
  { key: 'language', label: 'Language', value: 'English', icon: <Globe color="#BB86FC" size={20} /> },
  { key: 'theme', label: 'Theme', value: 'Dark', icon: <Palette color="#BB86FC" size={20} /> },
  { key: 'sounds', label: 'Sounds', value: 'On', icon: <Volume2 color="#BB86FC" size={20} /> },
];

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt_token');
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-6 pt-4">
          <Text className="text-2xl font-bold text-white">Profile Settings</Text>
          <Text className="text-sm text-[#B3B3B3] mt-1">
            Preferences and account
          </Text>
        </View>

        <View
          className="mx-6 mt-6 rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#1E1E1E' }}
        >
          {SETTINGS.map((item, idx) => (
            <Pressable
              key={item.key}
              className="flex-row items-center px-5 py-4"
              style={{
                borderBottomWidth: idx < SETTINGS.length - 1 ? 1 : 0,
                borderBottomColor: '#2A2A2A',
              }}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(187, 134, 252, 0.15)' }}
              >
                {item.icon}
              </View>
              <Text className="flex-1 text-base text-white">{item.label}</Text>
              <Text className="text-sm text-[#B3B3B3] mr-2">{item.value}</Text>
              <ChevronRight color="#B3B3B3" size={18} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={handleLogout}
          className="mx-6 mt-6 rounded-2xl flex-row items-center justify-center py-4"
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <LogOut color="#CF6679" size={18} />
          <Text className="text-base font-semibold text-[#CF6679] ml-2">
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
