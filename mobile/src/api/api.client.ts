import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL when testing on a real device or emulator
// If Android Emulator, use http://10.0.2.2:3000
// If iOS Simulator or Web, use http://localhost:3000
const API_URL = 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token from AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s (e.g., token expiration)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration/unauthorized access (e.g., redirect to login)
      await AsyncStorage.removeItem('jwt_token');
      // Expo router navigation could be injected here, but generally handled at context level
    }
    return Promise.reject(error);
  }
);
