import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_CONFIG } from '../config/serverConfig';
import { Alert, Platform } from 'react-native';

// Constants
const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';
const AUTH_ERROR_THROTTLE_KEY = 'lastAuthErrorAlert';
const AUTH_ERROR_THROTTLE_MS = 5000; // Only show auth error once every 5 seconds
const MAX_RETRY_COUNT = 3; // Maximum number of retries for failed requests

// For handling token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: SERVER_CONFIG.getBaseUrl(),
  timeout: 15000, // Increased timeout for Azure hosted services
  withCredentials: true, // Enable cookies for session support
  maxRedirects: 5, // Allow some redirects
});

// Request interceptor - add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Skip auth header for refresh token and login endpoints
      if (config.url && (config.url.includes('/refresh-token') || 
          config.url.includes('/login') || 
          config.url.includes('/register'))) {
        return config;
      }
      
      // Get token with consistent key name
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Only log in development
        if (__DEV__) {
          console.log(`Request with token to ${config.url}`);
        }
      } else {
        // Only log in development, reduce noise in production
        if (__DEV__ && !config.url.includes('login') && !config.url.includes('register')) {
          console.warn("No auth token found in storage");
        }
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
    const originalRequest = error.config;
    
    // Make sure we have a proper error config to work with
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // For security, add an extra check to avoid retry loops
    originalRequest._retryCount = originalRequest._retryCount || 0;
    if (originalRequest._retryCount >= MAX_RETRY_COUNT) {
      console.warn('Request retry limit reached', originalRequest.url);
      return Promise.reject(error);
    }
    
    // Handle token refresh for 401 errors, but avoid infinite loops
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Skip refresh for login and registration endpoints
      if (originalRequest.url && (originalRequest.url.includes('login') || 
          originalRequest.url.includes('register') || 
          originalRequest.url.includes('refresh-token'))) {
        return Promise.reject(error);
      }
      
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          // When token refresh is complete, retry with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      // Mark this request as retrying and increment count
      originalRequest._retry = true;
      originalRequest._retryCount += 1;
      isRefreshing = true;
      
      try {
        // Get refresh token from storage
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          // No refresh token available, can't refresh
          throw new Error("No refresh token available");
        }
        
        if (__DEV__) {
          console.log("Attempting to refresh token...");
        }
        
        // Try to get a new token - using a new axios instance to avoid interceptors recursion
        const refreshAxios = axios.create({
          baseURL: SERVER_CONFIG.getBaseUrl(),
          timeout: 10000
        });
        
        const response = await refreshAxios.post(`/refresh-token`, { 
          refreshToken 
        });
        
        if (response.data && response.data.token) {
          // Save the new tokens
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
          
          // If a new refresh token was provided, save it too
          if (response.data.refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
          }
          
          // Update authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          
          // Process all requests that failed while refreshing
          processQueue(null, response.data.token);
          
          if (__DEV__) {
            console.log("Token refreshed successfully");
          }
          
          // Retry the original request with the new token
          return apiClient(originalRequest);
        } else {
          throw new Error("Token refresh response didn't contain a new token");
        }
      } catch (refreshError) {
        if (__DEV__) {
          console.error("Token refresh failed:", refreshError);
        }
        
        // Process failed queue
        processQueue(refreshError, null);
        
        // Handle failed refresh - need to clear tokens and prompt login
        await handleAuthError();
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Centralized error handling for other error types
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle non-token-refresh 401/403 errors
      if ((status === 401 || status === 403) && originalRequest._retry) {
        // This is a retry that still failed, so we have a genuine auth problem
        await handleAuthError();
      }
      
      // Network errors might be retryable
      if (status >= 500 || status === 429) {
        // Server errors (5xx) or rate limiting (429)
        if (originalRequest._retryCount < MAX_RETRY_COUNT) {
          originalRequest._retryCount += 1;
          
          // Exponential backoff
          const delay = Math.pow(2, originalRequest._retryCount) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return apiClient(originalRequest);
        }
      }
      
      // Log all API errors (in development only)
      if (__DEV__) {
        console.error(`API Error (${status}):`, data?.message || "Unknown error", originalRequest.url);
      }
    } else if (error.request) {
      // No response received - network error
      if (__DEV__) {
        console.error("No response received:", error.request._url || originalRequest.url);
      }
      
      // Retry network errors with backoff
      if (originalRequest._retryCount < MAX_RETRY_COUNT) {
        originalRequest._retryCount += 1;
        
        // Exponential backoff for network errors
        const delay = Math.pow(2, originalRequest._retryCount) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return apiClient(originalRequest);
      }
    } else {
      // Something else went wrong
      if (__DEV__) {
        console.error("Request setup error:", error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle authentication errors
const handleAuthError = async (error) => {
  // Don't clear auth state immediately on 401 errors
  if (error.response?.status === 401) {
    // Try to refresh the token first
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await axios.post(`${SERVER_CONFIG.getBaseUrl()}/refresh-token`, {
          refreshToken
        });
        
        if (response.data && response.data.token) {
          // Save the new token
          await AsyncStorage.setItem('authToken', response.data.token);
          
          // Update the apiClient headers
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          return true; // Token refreshed successfully
        }
      }
    } catch (refreshError) {
      console.error("Failed to refresh token:", refreshError);
    }
    
    // Instead of clearing auth and redirecting, ask the user
    const lastAlertTime = await AsyncStorage.getItem('lastAuthErrorTime');
    const now = Date.now();
    
    // Only show the alert once every 5 minutes to avoid spamming
    if (!lastAlertTime || (now - parseInt(lastAlertTime)) > 5 * 60 * 1000) {
      await AsyncStorage.setItem('lastAuthErrorTime', now.toString());
      
      // Show a toast or subtle notification instead of an alert
      console.log("Session may need refresh - but keeping your current view");
    }
    
    return false;
  }
};

// Authentication helpers
export const authHelpers = {
  /**
   * Save authentication token and refresh token
   */
  setAuthTokens: async (token, refreshToken) => {
    if (!token) return false;
    try {
      const promises = [AsyncStorage.setItem(AUTH_TOKEN_KEY, token)];
      
      // Also save refresh token if provided
      if (refreshToken) {
        promises.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken));
      }
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Error saving auth tokens:", error);
      return false;
    }
  },
  
  /**
   * Get the current auth token
   */
  getAuthToken: async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  },
  
  /**
   * Get the refresh token
   */
  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },
  
  /**
   * Clear all auth tokens (without calling logout endpoint)
   */
  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY, 
        REFRESH_TOKEN_KEY, 
        USER_ID_KEY
      ]);
      return true;
    } catch (error) {
      console.error("Error clearing tokens:", error);
      return false;
    }
  },
  
  /**
   * Logout user - clear tokens and call logout endpoint
   */
  logout: async () => {
    try {
      // Get token for logging out
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // Call logout API if server is available and we have a token
      if (token) {
        try {
          await apiClient.post('/logout');
        } catch (error) {
          // If server is unavailable, just continue with local logout
          console.log("Couldn't reach server for logout, continuing with local logout");
        }
      }
      
      // Clear all auth tokens
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY, 
        REFRESH_TOKEN_KEY, 
        USER_ID_KEY
      ]);
      
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, try to clear tokens anyway as a last resort
      try {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY]);
      } catch (e) {
        console.error("Final token clear failed:", e);
      }
      return false;
    }
  },
  
  /**
   * Verify token validity by making a test request
   */
  verifyToken: async () => {
    try {
      await apiClient.get('/user');
      return true;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Token invalid
        return false;
      }
      // Any other error is a server/network issue, not necessarily an invalid token
      return null;
    }
  }
};

export default apiClient;