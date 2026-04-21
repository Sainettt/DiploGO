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

    scopes: ['openid', 'profile', 'email'],
  });

  return { request, response, promptAsync };
}

// Call this after receiving a successful Google response.
// We send the accessToken (not idToken) because native Android/iOS OAuth
// clients do not return id_token — only the Web client type does.
// The backend verifies the accessToken via Google's userinfo endpoint.
export async function loginWithGoogle(
  accessToken: string,
): Promise<GoogleAuthResponse> {
  const res = await apiClient.post<GoogleAuthResponse>('/auth/google', {
    accessToken,
  });

  await AsyncStorage.setItem('jwt_token', res.data.access_token);
  return res.data;
}
