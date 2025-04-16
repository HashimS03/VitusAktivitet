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

export default function opprett({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!email || !password || !name) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      console.log(`Sending registration request to: ${SERVER_CONFIG.getBaseUrl()}/register`);
      
      const response = await axios.post(`${SERVER_CONFIG.getBaseUrl()}/register`, {
        name,
        email,
        password,
        avatar: null,
      });

      console.log("Registration response:", response.status, response.data);
      
      if (response.data.success) {
        Alert.alert("Success", "User registered successfully");
        navigation.replace("GenderSelection");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response) {
        console.error("Server responded with:", error.response.status, error.response.data);
        Alert.alert("Registration Failed", error.response.data.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error("No response received");
        Alert.alert("Connection Error", "Cannot connect to the server. Please check your internet connection or try again later.");
      } else {
        console.error("Request setup error:", error.message);
        Alert.alert("Error", "An unexpected error occurred during registration.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="raziul.cse@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.inputBorder} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.inputBorder} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Re-write Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <View style={styles.inputBorder} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.inputBorder} />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleRegister}>
          <Text style={styles.createButtonText}>Create Now</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have account? </Text>
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
    backgroundColor: "#F5F5F5",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    marginTop: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B1B3D",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    color: "#1B1B3D",
  },
  inputBorder: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginTop: 8,
  },
  createButton: {
    backgroundColor: "#1B1B3D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#666666",
    fontSize: 16,
  },
  loginLink: {
    color: "#1B1B3D",
    fontSize: 16,
    fontWeight: "600",
  },
});