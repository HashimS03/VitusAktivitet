import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, authHelpers } from '../../utils/apiClient';
import axios from 'axios';
import { SERVER_CONFIG } from '../../config';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Add useEffect to initialize auth state
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing tokens and user data
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (storedToken && storedUserId) {
          setIsLoggedIn(true);
          setUserId(storedUserId);
          setUserToken(storedToken);
          setRefreshToken(storedRefreshToken);
          
          // Verify token by making a test request
          try {
            await apiClient.get('/user');
          } catch (verifyError) {
            // If token is invalid, try to refresh
            if (verifyError.response?.status === 401 && storedRefreshToken) {
              try {
                const response = await axios.post(`${SERVER_CONFIG.getBaseUrl()}/refresh-token`, {
                  refreshToken: storedRefreshToken
                });
                
                if (response.data.token) {
                  // Update stored token
                  await AsyncStorage.setItem('authToken', response.data.token);
                  setUserToken(response.data.token);
                  
                  // If a new refresh token was provided, save it too
                  if (response.data.refreshToken) {
                    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
                    setRefreshToken(response.data.refreshToken);
                  }
                }
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Don't logout automatically - let the user stay logged in
              }
            }
          }
        } else {
          // If no token, ensure we're logged out
          setIsLoggedIn(false);
          setUserId(null);
          setUserToken(null);
          setRefreshToken(null);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authHelpers.login(email, password);
      
      // Store tokens and user data
      const { userId, token, refreshToken } = response;
      
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      
      // Update state
      setIsLoggedIn(true);
      setUserId(userId);
      setUserToken(token);
      setRefreshToken(refreshToken);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authHelpers.register(userData);
      
      // If signup automatically logs in the user
      if (response.token && response.userId) {
        await AsyncStorage.setItem('userId', response.userId);
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
        
        setIsLoggedIn(true);
        setUserId(response.userId);
        setUserToken(response.token);
        setRefreshToken(response.refreshToken);
      }
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during signup' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API if needed
      try {
        await authHelpers.logout();
      } catch (logoutError) {
        // Continue with local logout even if API call fails
        console.warn('Logout API call failed:', logoutError);
      }
      
      // Clear stored tokens and data
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      
      // Reset state
      setIsLoggedIn(false);
      setUserId(null);
      setUserToken(null);
      setRefreshToken(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refreshToken function that can be called
  const refreshAuthToken = async () => {
    try {
      const currentRefreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!currentRefreshToken) {
        console.log("No refresh token available");
        return false;
      }
      
      const response = await axios.post(`${SERVER_CONFIG.getBaseUrl()}/refresh-token`, {
        refreshToken: currentRefreshToken
      });
      
      if (response.data.token) {
        // Save new token
        await AsyncStorage.setItem('authToken', response.data.token);
        setUserToken(response.data.token);
        
        // If a new refresh token is provided, save it too
        if (response.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
          setRefreshToken(response.data.refreshToken);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  // Include refreshAuthToken in the context value
  const authContextValue = {
    isLoggedIn,
    isLoading,
    userId,
    userToken,
    refreshToken,
    login,
    logout,
    refreshAuthToken  // Add this to your context value
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};