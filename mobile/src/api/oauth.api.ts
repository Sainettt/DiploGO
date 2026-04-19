import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api.client';

// Required: completes the auth session when the app is brought back to foreground
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResponse {
  access_token: string;
  user: { id: string; email: string };
}

// Call this hook inside your screen component
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Paste your Client IDs from Google Cloud Console here:
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  return { request, response, promptAsync };
}

// Call this after receiving a successful Google response
export async function loginWithGoogle(
  idToken: string,
): Promise<GoogleAuthResponse> {
  const res = await apiClient.post<GoogleAuthResponse>('/auth/google', {
    idToken,
  });

  await AsyncStorage.setItem('jwt_token', res.data.access_token);
  return res.data;
}
