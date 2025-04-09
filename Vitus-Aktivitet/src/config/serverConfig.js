export const SERVER_CONFIG = {  
  // Your Azure web app URL - replace with your actual Azure URL
  PROD_URL: "https://apphractivity01-dqcuh0g2epgsgfeq.westeurope-01.azurewebsites.net",
  
  // Always use the production URL, regardless of environment
  getBaseUrl: () => SERVER_CONFIG.PROD_URL,
};