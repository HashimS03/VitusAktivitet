"use client";

import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";
import { Alert } from "react-native";

export default function EditProfile() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { userId } = useContext(UserContext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }
      console.log("Fetching user data for userId:", userId);
      console.log("Request URL:", `${SERVER_CONFIG.getBaseUrl()}/user`);
      const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User data response:", response.data);
      if (response.data.success) {
        const user = response.data.user;
        setFullName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setAddress(user.address || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load user data."
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }
      const updateData = {
        name: fullName,
        email,
        phone,
        address,
      };
      console.log("Submitting profile update with data:", updateData);
      console.log("Request URL:", `${SERVER_CONFIG.getBaseUrl()}/user`);
      console.log("Request Headers:", { Authorization: `Bearer ${token}` });
      const response = await axios.put(
        `${SERVER_CONFIG.getBaseUrl()}/user`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Profile update response:", response.data);
      if (response.data.success) {
        Alert.alert("Success", "Profile updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile."
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Rediger Profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Profil Detaljer</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Fullt navn *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: isDarkMode ? theme.border : theme.primary + "30",
              },
            ]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Skriv inn fullt navn"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>E-postadresse *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: isDarkMode ? theme.border : theme.primary + "30",
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Skriv inn e-postadresse"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Telefonnummer</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: isDarkMode ? theme.border : theme.primary + "30",
              },
            ]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Skriv inn telefonnummer"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Adresse</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: isDarkMode ? theme.border : theme.primary + "30",
              },
            ]}
            value={address}
            onChangeText={setAddress}
            placeholder="Skriv inn adresse"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: theme.primary + "20" }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.skipButtonText, { color: theme.primary }]}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: theme.border },
            fullName && email && [styles.continueButtonActive, { backgroundColor: theme.primary }],
          ]}
          onPress={handleSubmit}
          disabled={!(fullName && email)}
        >
          <Text
            style={[
              styles.continueButtonText,
              { color: theme.textSecondary },
              fullName && email && [styles.continueButtonTextActive, { color: theme.card }],
            ]}
          >
            Lagre
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    paddingBottom: 40,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    borderRadius: 12,
  },
  continueButtonActive: {
    backgroundColor: "#00B6AA",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButtonTextActive: {
    color: "#FFF",
  },
});