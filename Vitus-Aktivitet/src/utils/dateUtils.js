/**
 * Utility functions for handling dates and times in the app
 * Ensures consistent date handling between server and client
 */

/**
 * Parse a date string from the server and handle SQL Server datetime format
 * @param {string} dateString - Date string from server/database
 * @returns {Date} Date object
 */
export const parseServerDate = (dateString) => {
  if (!dateString) return new Date();
  
  try {
    // For debugging
    console.log(`Parsing date: ${dateString}`);
    
    // Handle SQL Server datetime format (YYYY-MM-DD HH:MM:SS.mmm)
    if (typeof dateString === 'string') {
      // Treat all database dates as UTC by adding 'Z'
      if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
        return new Date(dateString + 'Z');
      }
      
      // SQL Server datetime format doesn't have a 'T'
      if (!dateString.includes('T') && !dateString.includes('Z')) {
        // Replace space with 'T' and add 'Z' to treat as UTC
        return new Date(dateString.replace(' ', 'T') + 'Z');
      }
    }
    
    // Otherwise just parse as is
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return new Date();
  }
};

/**
 * Format a date for sending to the server - ensures consistent format
 * @param {Date} date - Date object
 * @returns {string} Formatted date string in SQL Server format
 */
export const formatServerDate = (date) => {
  if (!date) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Format for SQL Server: YYYY-MM-DD HH:MM:SS
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Format a date for display in the UI (date only)
 * @param {string|Date} dateInput - Date string or object
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (dateInput) => {
  if (!dateInput) return "Ingen dato";
  
  const date = dateInput instanceof Date ? dateInput : parseServerDate(dateInput);
  
  if (isNaN(date.getTime())) {
    return "Ugyldig dato";
  }
  
  return date.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

/**
 * Format a time for display in the UI
 * @param {string|Date} dateInput - Date string or object
 * @returns {string} Formatted time string
 */
export const formatDisplayTime = (dateInput) => {
  if (!dateInput) return "Ingen tid";
  
  const date = dateInput instanceof Date ? dateInput : parseServerDate(dateInput);
  
  if (isNaN(date.getTime())) {
    return "Ugyldig tid";
  }
  
  return date.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Get the difference in days between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Number of days
 */
export const getDaysDifference = (startDate, endDate) => {
  const start = startDate instanceof Date ? startDate : parseServerDate(startDate);
  const end = endDate instanceof Date ? endDate : parseServerDate(endDate);
  
  // Set to beginning of day for accurate calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};