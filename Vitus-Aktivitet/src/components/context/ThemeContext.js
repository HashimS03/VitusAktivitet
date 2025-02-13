import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const ThemeContext = createContext();

// Define default accent color
const DEFAULT_ACCENT_COLOR = '#48CAB2';

// Define theme configurations
export const createTheme = (isDarkMode, accentColor) => ({
  primary: accentColor,
  secondary: isDarkMode ? '#5E5CE6' : '#5856D6',
  background: isDarkMode ? '#222' : '#F6F6F6',
  surface: isDarkMode ? '#333' : '#FFFFFF',
  text: isDarkMode ? '#FFFFFF' : '#000000',
  textSecondary: isDarkMode ? '#CCCCCC' : '#6C6C6C',
  border: isDarkMode ? '#444444' : '#EAEAEA',
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [theme, setTheme] = useState(createTheme(isDarkMode, accentColor));

  useEffect(() => {
    loadThemePreferences();
  }, []);

  useEffect(() => {
    setTheme(createTheme(isDarkMode, accentColor));
  }, [isDarkMode, accentColor]);

  const loadThemePreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedAccentColor = await AsyncStorage.getItem('accentColor');
      if (savedTheme) setIsDarkMode(savedTheme === 'dark');
      if (savedAccentColor) setAccentColor(savedAccentColor);
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const changeAccentColor = async (newColor) => {
    try {
      setAccentColor(newColor);
      await AsyncStorage.setItem('accentColor', newColor);
    } catch (error) {
      console.error('Error saving accent color:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, accentColor, changeAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
