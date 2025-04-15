import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";

const EditProfile = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme();
  const { userId } = useContext(UserContext);
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/user`, {
          withCredentials: true,
        });
        const userData = response.data.user;
        setFullName(userData.name || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
        setNickname(userData.name || ""); // Assuming nickname is the same as name for now
        console.log("Loaded user data:", userData);
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Unable to load profile data. Please try again.");
      }
    };
    loadUserData();
  }, [userId]);

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User not logged in.");
      return;
    }
    const url = `${SERVER_CONFIG.getBaseUrl()}/user`.replace(/\/$/, ""); // Remove trailing slash
    console.log("Sending PUT request to:", url, "with userId:", userId, "and body:", {
      name: fullName,
      email,
      phone,
      address,
    });
    try {
      const response = await axios.put(
        url,
        {
          name: fullName,
          email,
          phone,
          address,
        },
        { withCredentials: true }
      );
      console.log("Server response:", response.data);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response && error.response.status === 404) {
        console.log("404 Response details:", error.response);
        Alert.alert("Error", "Server endpoint not found. Please ensure the server is running at " + url);
      } else if (error.response && error.response.status === 400) {
        Alert.alert("Error", error.response.data.message || "Invalid input data.");
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.headerWrapper, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.text }]}>Rediger Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Navn</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>E-post</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Telefon Nummer</Text>
          <View style={[styles.phoneInputContainer, { backgroundColor: theme.surface }]}>
            <Text style={styles.flag}>🇳🇴</Text>
            <TextInput
              style={[styles.phoneInput, { color: theme.text }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Adresse</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: accentColor }]} onPress={handleSubmit}>
          <Text style={styles.submitText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    marginTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomWidth: 1,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  flag: {
    fontSize: 18,
    marginRight: 10,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfile;