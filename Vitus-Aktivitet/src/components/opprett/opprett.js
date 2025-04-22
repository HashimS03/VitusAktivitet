import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system"; // For converting image URI to Base64

const { width } = Dimensions.get("window");

export default function opprett({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null); // Store the avatar data

  // Load the avatar selection when the component mounts
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const selection = await AsyncStorage.getItem("userAvatarSelection");
        if (selection) {
          const parsedSelection = JSON.parse(selection);
          if (parsedSelection.type === "avatar") {
            setAvatar(parsedSelection.value.toString());
          } else if (parsedSelection.type === "photo") {
            const base64 = await FileSystem.readAsStringAsync(
              parsedSelection.value,
              {
                encoding: FileSystem.EncodingType.Base64,
              }
            );
            const base64WithPrefix = `data:image/jpeg;base64,${base64}`;
            setAvatar(base64WithPrefix);
            console.log("Base64 image:", base64WithPrefix.substring(0, 50)); // Log the first 50 characters
          }
        }
      } catch (error) {
        console.error("Error loading avatar for registration:", error);
      }
    };
    loadAvatar();
  }, []);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!email || !password || !name) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    console.log("Registering with data:", { name, email, password, avatar }); // Add this log

    try {
      const response = await axios.post(
        `${SERVER_CONFIG.getBaseUrl()}/register`,
        {
          name,
          email,
          password,
          avatar,
        }
      );

      console.log("Registration response:", response.status, response.data);

      if (response.data.success) {
        Alert.alert("Success", "User registered successfully");
        navigation.replace("GenderSelection");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "An error occurred"
      );
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
