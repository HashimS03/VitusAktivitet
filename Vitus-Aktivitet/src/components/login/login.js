import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { SERVER_CONFIG } from "../../config/serverConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#48CAB2";
const DARKER_COLOR = "#3AA891";

export default function login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const { setUserId } = useContext(UserContext);

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  const handleNextPress = () => {
    if (email.trim().length > 0) {
      setShowPasswordField(true);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    try {
      console.log("Sending login request to:", `${SERVER_CONFIG.getBaseUrl()}/login`);
      
      const response = await axios.post(`${SERVER_CONFIG.getBaseUrl()}/login`, {
        email,
        password,
      });

      console.log("Login response received:", {
        success: response.data.success,
        userId: response.data.userId,
        hasToken: !!response.data.token
      });

      if (response.data.success) {
        // Store the JWT token with the correct key
        if (response.data.token) {
          await AsyncStorage.setItem('authToken', response.data.token); // Changed from 'userToken' to 'authToken'
          console.log("Token stored successfully");
        } else {
          console.error("No token received from server");
        }
        
        setUserId(response.data.userId);
        Alert.alert("Success", "Login successful");
        navigation.replace("MainApp");
      }
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Login failed. Please check your connection."
      );
    }
  };

  const isPasswordFilled = password.trim().length > 0;
  const buttonColor = showPasswordField && isPasswordFilled ? DARKER_COLOR : PRIMARY_COLOR;
  const isButtonDisabled = (showPasswordField && !isPasswordFilled) || (!showPasswordField && email.trim().length === 0);

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Velkommen</Text>
        <Text style={styles.subtitle}>Sign in with your Entra ID</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="yourname@company.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {showPasswordField && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: buttonColor, opacity: isButtonDisabled ? 0.6 : 1 }]}
          onPress={() => {
            if (!showPasswordField) {
              handleNextPress();
            } else if (showPasswordField && isPasswordFilled) {
              handleLogin();
            }
          }}
          disabled={isButtonDisabled}
        >
          <Text style={styles.loginButtonText}>{showPasswordField ? "Login" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  backButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 36,
  },
  inputContainer: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1F2937",
  },
  loginButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
