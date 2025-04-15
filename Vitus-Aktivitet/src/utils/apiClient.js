import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_CONFIG } from '../config/serverConfig';

// Create an axios instance with base URL
const apiClient = axios.create({
  baseURL: SERVER_CONFIG.getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptor to add auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      // Consider adding navigation to login here
    }
    return Promise.reject(error);
  }
);

export default apiClient;