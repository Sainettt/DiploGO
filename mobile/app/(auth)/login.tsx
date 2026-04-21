import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeButton } from '../../src/components/ThemeButton';
import { AntDesign } from '@expo/vector-icons';

import { authApi } from '../../src/api/auth.api';
import { onboardingApi } from '../../src/api/onboarding.api';
import { useGoogleSignIn } from '../../src/hooks/useGoogleSignIn';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { request, signIn } = useGoogleSignIn({
    labels: {
      failed: 'Google login failed. Please try again.',
      noToken: 'Google login failed: no token received.',
    },
    setError,
    setLoading: setGoogleLoading,
  });

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await authApi.login({ email, password });
      await AsyncStorage.setItem('jwt_token', response.access_token);
      const settings = await onboardingApi.getOnBoarding().catch(() => null);
      router.replace(settings?.onBoardingCompleted ? '/home' : '/onboarding/purpose');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string' && msg.includes('Google Sign-In')) {
        setError('This account uses Google Sign-In. Please use "Continue with Google".');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#121212] justify-center px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="w-full mb-20">
        <View className="mb-10">
          <Text className="text-[32px] font-bold text-white mb-2">Welcome back.</Text>
          <Text className="text-base text-[#B3B3B3]">Log in to continue your journey.</Text>
        </View>

        <View className="mb-6 gap-4">
          {error ? <Text className="text-[#CF6679] text-sm -mb-2">{error}</Text> : null}
          <TextInput
            className="bg-[#1E1E1E] rounded-xl px-4 py-[18px] text-base text-white border border-[#333333]"
            placeholder="Email address"
            placeholderTextColor="#B3B3B3"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="bg-[#1E1E1E] rounded-xl px-4 py-[18px] text-base text-white border border-[#333333]"
            placeholder="Password"
            placeholderTextColor="#B3B3B3"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="gap-4">
          <ThemeButton title="Log In" onPress={handleLogin} />

          <View className="flex-row items-center my-2">
            <View className="flex-1 h-[1px] bg-[#333333]" />
            <Text className="text-[#B3B3B3] px-4 text-sm font-semibold">OR</Text>
            <View className="flex-1 h-[1px] bg-[#333333]" />
          </View>

          <ThemeButton
            title={googleLoading ? 'Connecting...' : 'Continue with Google'}
            variant="outline"
            icon={
              googleLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <AntDesign name="google" size={20} color="#FFFFFF" />
              )
            }
            onPress={signIn}
            disabled={!request || googleLoading}
          />
        </View>

        <View className="flex-row justify-center mt-10">
          <Text className="text-[#B3B3B3] text-sm">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="text-[#BB86FC] text-sm font-bold">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
