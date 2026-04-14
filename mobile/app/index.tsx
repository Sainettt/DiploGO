import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemeButton } from '../src/components/ThemeButton';
import { AntDesign } from '@expo/vector-icons';

import { authApi } from '../src/api/auth.api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      console.log('Logged in successfully', response);
    } catch (e) {
      console.error('Login failed:', e);
      setError('Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    alert('Google Login Triggered');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#121212] justify-center px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="w-full mb-20">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-[32px] font-bold text-white mb-2">Welcome back.</Text>
          <Text className="text-base text-[#B3B3B3]">Log in to continue your journey.</Text>
        </View>

        {/* Inputs */}
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

        {/* Actions */}
        <View className="gap-4">
          <ThemeButton title="Log In" onPress={handleLogin} />
          
          <View className="flex-row items-center my-2">
            <View className="flex-1 h-[1px] bg-[#333333]" />
            <Text className="text-[#B3B3B3] px-4 text-sm font-semibold">OR</Text>
            <View className="flex-1 h-[1px] bg-[#333333]" />
          </View>

          <ThemeButton 
            title="Continue with Google" 
            variant="outline" 
            icon={<AntDesign name="google" size={20} color="#FFFFFF" />}
            onPress={handleGoogleLogin} 
          />
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-10">
          <Text className="text-[#B3B3B3] text-sm">Don't have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-[#BB86FC] text-sm font-bold">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
