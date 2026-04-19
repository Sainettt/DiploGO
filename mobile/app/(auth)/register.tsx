import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeButton } from '../../src/components/ThemeButton';
import { AntDesign } from '@expo/vector-icons';

import { authApi } from '../../src/api/auth.api';
import { onboardingApi } from '../../src/api/onboarding.api';
import { useGoogleAuth, loginWithGoogle } from '../../src/api/oauth.api';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
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
            setError('Google sign-up failed. Please try again.');
          } finally {
            setGoogleLoading(false);
          }
        })();
      } else {
        setError('Google sign-up failed: no token received.');
        setGoogleLoading(false);
      }
    } else if (response.type === 'error') {
      setError('Google sign-up failed. Please try again.');
      setGoogleLoading(false);
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response]);

  const handleRegister = async () => {
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await authApi.register({ username, email, password });
      await AsyncStorage.setItem('jwt_token', response.access_token);
      router.replace('/onboarding/purpose');
    } catch (e) {
      console.error('Registration failed:', e);
      setError('Registration failed. Username or email may already be in use.');
    }
  };

  const handleGooglePress = () => {
    setError('');
    setGoogleLoading(true);
    promptAsync();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#121212]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="grow justify-center px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full mb-[60px]">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-[32px] font-bold text-white mb-2">Create Account</Text>
            <Text className="text-base text-[#B3B3B3]">Join DiploGO and start learning today.</Text>
          </View>

          {/* Inputs */}
          <View className="mb-6 gap-4">
            {error ? <Text className="text-[#CF6679] text-sm -mb-2">{error}</Text> : null}
            <TextInput
              className="bg-[#1E1E1E] rounded-xl px-4 py-[18px] text-base text-white border border-[#333333]"
              placeholder="Username"
              placeholderTextColor="#B3B3B3"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
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

          {/* Actions */}
          <View className="gap-4">
            <ThemeButton title="Sign Up" onPress={handleRegister} />

            <View className="flex-row items-center my-2">
              <View className="flex-1 h-[1px] bg-[#333333]" />
              <Text className="text-[#B3B3B3] px-4 text-sm font-semibold">OR</Text>
              <View className="flex-1 h-[1px] bg-[#333333]" />
            </View>

            <ThemeButton
              title={googleLoading ? 'Connecting...' : 'Sign up with Google'}
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

          {/* Footer */}
          <View className="flex-row justify-center mt-10">
            <Text className="text-[#B3B3B3] text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text className="text-[#BB86FC] text-sm font-bold">Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
