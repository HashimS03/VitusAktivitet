import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_CONFIG } from '../config/serverConfig';
import { Alert } from 'react-native';

const apiClient = axios.create({
  baseURL: SERVER_CONFIG.getBaseUrl(),
  timeout: 15000, // Increased timeout for Azure hosted services
  withCredentials: true, // Enable cookies for session support
});

// Request interceptor - add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token with consistent key name
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Request with token to ${config.url}`);
      } else {
        console.warn("No auth token found in storage");
      }
      
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - unified error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Centralized error handling
    if (error.response) {
      const { status, data } = error.response;
      
      // Auth errors
      if (status === 401 || status === 403) {
        console.log("Authentication error:", data?.message || "Invalid or expired token");
        
        // Show alert to user only once
        const lastAlertTime = await AsyncStorage.getItem('lastAuthErrorAlert');
        const now = Date.now();
        if (!lastAlertTime || (now - parseInt(lastAlertTime)) > 5000) {
          Alert.alert(
            "Session Expired",
            "Your login session has expired. Please log in again.",
            [{ text: "OK" }]
          );
          await AsyncStorage.setItem('lastAuthErrorAlert', now.toString());
        }
      }
      
      // Log all API errors
      console.error(`API Error (${status}):`, data?.message || "Unknown error");
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;