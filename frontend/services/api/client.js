import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, setToken } from './tokenStorage';

// The backend runs on the developer's machine during development.
// - Android emulator reaches the host machine via 10.0.2.2.
// - iOS simulator and web can reach it via localhost.
// - A physical device needs the machine's LAN IP (set EXPO_PUBLIC_API_URL).
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${DEV_HOST}:4000/api`;

export { getToken, setToken };

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes every failure into a plain Error with a readable message,
// so screens never need to know about axios/response shapes.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Network error. Please check your connection and try again.';
    if (error.response) {
      message = error.response.data?.message || `Request failed (${error.response.status})`;
    } else if (error.request) {
      message = 'Could not reach the server. Is the backend running?';
    }
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);

export default client;
