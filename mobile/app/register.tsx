import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemeButton } from '../src/components/ThemeButton';
import { AntDesign } from '@expo/vector-icons';

import { authApi } from '../src/api/auth.api';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      console.log('Registered successfully', response);
      // Optional: Save token or navigate to main screen
      router.replace('/'); 
    } catch (e) {
      console.error('Registration failed:', e);
      setError('Registration failed. Username or email may already be in use.');
    }
  };

  const handleGoogleRegister = () => {
    console.log('Google Register Triggered');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join DiploGO and start learning today.</Text>
          </View>

          {/* Inputs */}
          <View style={styles.inputGroup}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#B3B3B3"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
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
            <ThemeButton title="Sign Up" onPress={handleRegister} />
            
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.line} />
            </View>

            <ThemeButton 
              title="Sign up with Google" 
              variant="outline" 
              icon={<AntDesign name="google" size={20} color="#FFFFFF" />}
              onPress={handleGoogleRegister} 
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Primary background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 60, // Offset upwards
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
    color: '#CF6679', // Material Design error color
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
    color: '#BB86FC',
    fontSize: 14,
    fontWeight: '700',
  },
});
