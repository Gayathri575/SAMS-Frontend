import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Determine the backend API base URL:
 * 1. EXPO_PUBLIC_API_URL env variable (highest priority)
 * 2. If running on physical device / Expo Go, extract the computer's LAN IP from hostUri (e.g. "10.199.199.228:8082" -> "10.199.199.228")
 * 3. Android Emulator fallback (10.0.2.2 points to host machine)
 * 4. Web / iOS simulator fallback (localhost)
 */
function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8081/api`;
    }
  }

  const defaultHost = Platform.OS === 'android' ? 'http://10.0.2.2:8081' : 'http://localhost:8081';
  return `${defaultHost}/api`;
}

const BASE_URL = getBaseUrl();

console.log('[API] Initialized with baseURL:', BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;