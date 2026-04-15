import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [status, setStatus] = useState<'loading' | 'auth' | 'guest'>('loading');

  useEffect(() => {
    AsyncStorage.getItem('jwt_token').then((token) => {
      setStatus(token ? 'auth' : 'guest');
    });
  }, []);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#BB86FC" />
      </View>
    );
  }

  if (status === 'auth') return <Redirect href="/home" />;
  return <Redirect href="/login" />;
}
