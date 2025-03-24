// Centralized server configuration

export const SERVER_CONFIG = {
  BASE_URL: "http://localhost:4000",  // Development
  // BASE_URL: "https://your-production-server.com", // Production
  
  // Use this function to get the correct URL based on environment
  getBaseUrl: () => {
    // You could add environment detection logic here
    return SERVER_CONFIG.BASE_URL;
  }
};