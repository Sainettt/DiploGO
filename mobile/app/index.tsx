import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
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
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Log in to continue your journey.</Text>
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#B3B3B3"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#B3B3B3"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionGroup}>
          <ThemeButton title="Log In" onPress={handleLogin} />
          
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          <ThemeButton 
            title="Continue with Google" 
            variant="outline" 
            icon={<AntDesign name="google" size={20} color="#FFFFFF" />}
            onPress={handleGoogleLogin} 
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Primary background
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 80, // Offset to push the fields slightly above center as requested
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B3B3',
  },
  inputGroup: {
    marginBottom: 24,
    gap: 16,
  },
  input: {
    backgroundColor: '#1E1E1E', // Surface color
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  errorText: {
    color: '#CF6679', // Material Design Dark Theme Error Color
    fontSize: 14,
    marginBottom: -8,
  },
  actionGroup: {
    gap: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  dividerText: {
    color: '#B3B3B3',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  linkText: {
    color: '#BB86FC', // Neon purple accent
    fontSize: 14,
    fontWeight: '700',
  },
});
