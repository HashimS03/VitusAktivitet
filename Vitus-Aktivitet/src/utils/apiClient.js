import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_CONFIG } from '../config/serverConfig';

const apiClient = axios.create({
  baseURL: SERVER_CONFIG.getBaseUrl(),
  timeout: 15000, // Increased timeout for Azure hosted services
  withCredentials: true, // Enable cookies for session support
});

// Add detailed logging to help debug token issues
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Log request details for debugging
      console.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
      console.log("Token status:", token ? "Present" : "Missing");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("No authentication token found in AsyncStorage");
      }
      
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  async (error) => {
    console.error("API Error:", error.response?.status, error.response?.data?.message || error.message);
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log("Authentication error detected");
      
      // Option: Attempt to refresh token here if you implement token refresh logic
      
      // For now, store auth error state
      await AsyncStorage.setItem('authError', 'true');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;