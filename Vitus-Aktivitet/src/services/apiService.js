import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { SERVER_CONFIG } from '../config/serverConfig';

/**
 * Fetch step activity data
 * @returns {Promise} Step data
 */
export const fetchStepActivity = async () => {
  try {
    const response = await axios.get(
      `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error fetching step activity');
    return [];
  }
};

/**
 * Update step count
 * @param {Number} stepCount - New step count
 * @returns {Promise}
 */
export const updateStepCount = async (stepCount) => {
  try {
    const response = await axios.post(
      `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
      { stepCount, distance: null, timestamp: new Date() },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
        stepCount,
        distance: null,
        timestamp: new Date()
      });
    }
    handleApiError(error, 'Error updating step count');
    throw error;
  }
};

/**
 * Fetch user statistics
 * @returns {Promise} User stats
 */
export const fetchUserStatistics = async () => {
  try {
    const response = await axios.get(
      `${SERVER_CONFIG.getBaseUrl()}/user-statistics`,
      { withCredentials: true }
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Error fetching user statistics');
    return null;
  }
};

/**
 * Complete an event
 * @param {Number} eventId - Event ID
 * @returns {Promise}
 */
export const completeEvent = async (eventId) => {
  try {
    await axios.put(
      `${SERVER_CONFIG.getBaseUrl()}/events/${eventId}/complete`,
      {},
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    handleApiError(error, 'Error completing event');
    return false;
  }
};

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @param {String} message - User-friendly message
 */
export const handleApiError = (error, message) => {
  console.error(`${message}:`, error);
  
  if (error.response) {
    if (error.response.status === 500) {
      Alert.alert("Server Error", `${message}. Please try again later.`);
    } else if (error.response.status === 401) {
      Alert.alert("Authentication Error", "Please log in to sync data.");
    } else if (error.response.status === 503) {
      Alert.alert(
        "Server Problem",
        "The server is temporarily unavailable. Data is saved locally, and we'll sync when the server is back.",
        [{ text: "OK" }]
      );
    }
  }
};

/**
 * Queue a request for later processing
 * @param {String} method - HTTP method
 * @param {String} url - API endpoint
 * @param {Object} data - Request data
 */
export const queueRequest = async (method, url, data) => {
  const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
  queue.push({ method, url, data, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem("requestQueue", JSON.stringify(queue));
};

/**
 * Process queued requests
 */
export const syncQueue = async () => {
  const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
  
  for (const request of queue) {
    try {
      await axios[request.method.toLowerCase()](request.url, request.data, {
        withCredentials: true,
      });
      
      const updatedQueue = queue.filter(r => r.timestamp !== request.timestamp);
      await AsyncStorage.setItem("requestQueue", JSON.stringify(updatedQueue));
    } catch (error) {
      console.error("Failed to sync queued request:", error);
      break;
    }
  }
};