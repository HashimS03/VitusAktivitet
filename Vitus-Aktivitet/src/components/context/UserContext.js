import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig"; // Juster stien til din konfig

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null); // Legg til state for avatar

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const response = await axios.get(
            `${SERVER_CONFIG.getBaseUrl()}/user`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.success) {
            setUserId(response.data.user.id);
            setUserAvatar(response.data.user.avatar || null); // Sett avatar fra API
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{ userId, setUserId, userAvatar, setUserAvatar }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Eksporter en tilpasset hook for å bruke contexten
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
