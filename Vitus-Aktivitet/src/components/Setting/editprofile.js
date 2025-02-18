import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

const EditProfile = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme(); // Get theme and accent color

  // State variables for input fields
  const [fullName, setFullName] = useState("Hashem Sheikh");
  const [nickname, setNickname] = useState("Hashem Sheikh");
  const [email, setEmail] = useState("youremail@domain.com");
  const [phone, setPhone] = useState("256 27 189");
  const [address, setAddress] = useState("Alf Bjerkes Vei 28");

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header Section */}
      <View style={[styles.headerWrapper, { borderBottomColor: theme.border }]}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={[styles.header, { color: theme.text }]}>Rediger Profil</Text>
      </View>

      {/* Scrollable Form */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Navn</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>E-post</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Phone Number */}
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

        {/* Address */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Adresse</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: accentColor }]} onPress={() => alert("Profil oppdatert!")}>
          <Text style={styles.submitText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
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
