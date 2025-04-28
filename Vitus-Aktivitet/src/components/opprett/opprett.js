import React, { useState } from "react";
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
import { SERVER_CONFIG } from "../../config/serverConfig";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#48CAB2";
const DARKER_COLOR = "#3AA891";

export default function opprett({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Password is required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      console.log(`Sending registration request to: ${SERVER_CONFIG.getBaseUrl()}/register`);
      console.log("Registration data:", { name, email });

      const response = await axios.post(`${SERVER_CONFIG.getBaseUrl()}/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        avatar: null,
        phone: null,
        address: null,
      });

      console.log("Registration response:", response.status, response.data);

      if (response.data.success) {
        Alert.alert("Success", "User registered successfully. Please log in.");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response) {
        console.error("Server responded with:", error.response.status, error.response.data);
        errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
        if (error.response.status === 400 && error.response.data.message === "Email already exists") {
          errorMessage = "This email is already registered. Please use a different email or log in.";
        }
      } else if (error.request) {
        console.error("No response received");
        errorMessage = "Cannot connect to the server. Please check your internet connection.";
      } else {
        console.error("Request setup error:", error.message);
        errorMessage = "An unexpected error occurred.";
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const isFormFilled = name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0 && confirmPassword.trim().length > 0;
  const buttonColor = isFormFilled ? DARKER_COLOR : PRIMARY_COLOR;

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up with your Entra ID</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="yourname@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: buttonColor, opacity: isFormFilled ? 1 : 0.6 }]}
          onPress={handleRegister}
          disabled={!isFormFilled}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Login now</Text>
          </TouchableOpacity>
        </View>
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
  registerButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#6B7280",
    fontSize: 16,
  },
  loginLink: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "500",
  },
});