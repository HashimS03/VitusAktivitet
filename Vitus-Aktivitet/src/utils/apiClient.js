import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_CONFIG } from '../config/serverConfig';

const apiClient = axios.create({
  baseURL: SERVER_CONFIG.getBaseUrl(),
  timeout: 10000,
});

// Add detailed logging to help debug token issues
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log("Token retrieved for request:", token ? "Token exists" : "No token");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header set:", `Bearer ${token.substring(0, 10)}...`);
      }
    } catch (error) {
      console.log("Error getting auth token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to detect 403 issues
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 403) {
      console.log("JWT Authentication failed - 403 Forbidden");
      // Could add logic to refresh token or redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;