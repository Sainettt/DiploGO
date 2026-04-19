import React, { useState, useEffect } from 'react';
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
import { useGoogleAuth, loginWithGoogle } from '../../src/api/oauth.api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { request, response, promptAsync } = useGoogleAuth();

  // Navigate based on onboarding completion status
  const navigateAfterAuth = async () => {
    const settings = await onboardingApi.getOnBoarding().catch(() => null);
    if (settings?.onBoardingCompleted) {
      router.replace('/home');
    } else {
      router.replace('/onboarding/purpose');
    }
  };

  // Handle Google OAuth response
  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        (async () => {
          try {
            await loginWithGoogle(idToken);
            await navigateAfterAuth();
          } catch {
            setError('Google login failed. Please try again.');
          } finally {
            setGoogleLoading(false);
          }
        })();
      } else {
        setError('Google login failed: no token received.');
        setGoogleLoading(false);
      }
    } else if (response.type === 'error') {
      setError('Google login failed. Please try again.');
      setGoogleLoading(false);
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response]);

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
      await navigateAfterAuth();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string' && msg.includes('Google Sign-In')) {
        setError('This account uses Google Sign-In. Please use "Continue with Google".');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  const handleGooglePress = () => {
    setError('');
    setGoogleLoading(true);
    promptAsync();
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
            onPress={handleGooglePress}
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
