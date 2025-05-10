import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_CONFIG } from "../config/serverConfig";

const apiClient = axios.create({
  baseURL: SERVER_CONFIG.getBaseUrl(),
  timeout: 10000,
});

// Validate baseURL and log if it's invalid
if (!apiClient.defaults.baseURL || apiClient.defaults.baseURL === "") {
  console.error(
    "Invalid baseURL from SERVER_CONFIG.getBaseUrl():",
    apiClient.defaults.baseURL
  );
}

// Add detailed logging to help debug token issues
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log(
        "Token retrieved from storage:",
        token ? "Present" : "Absent"
      );
      console.log("Request config:", {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers,
      });

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("No token available for request:", config.url);
      }
    } catch (error) {
      console.error("Error adding auth token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to detect 403 and 404 issues
apiClient.interceptors.response.use(
  (response) => {
    console.log("Response received:", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        url: error.response.config.url,
        data: error.response.data,
      });
      if (error.response.status === 403) {
        console.log("JWT Authentication failed - 403 Forbidden");
      } else if (error.response.status === 404) {
        console.log(
          "Resource not found - 404, check server or endpoint:",
          error.response.config.url
        );
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
