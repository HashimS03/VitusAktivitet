import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#48CAB2"; // Original teal color
const DARKER_COLOR = "#3AA891"; // Darker teal for when password is filled

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Handle email input
  const handleEmailChange = (text) => {
    setEmail(text);
  };

  // Handle Next button press to show password field
  const handleNextPress = () => {
    if (email.trim().length > 0) {
      setShowPasswordField(true);
    }
  };

  // Determine button color and enable state based on password input
  const isPasswordFilled = password.trim().length > 0;
  const buttonColor = showPasswordField && isPasswordFilled ? DARKER_COLOR : PRIMARY_COLOR;
  const isButtonDisabled = (showPasswordField && !isPasswordFilled) || ( !showPasswordField && email.trim().length === 0);

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
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
              handleNextPress(); // Show password field if not already shown
            } else if (showPasswordField && isPasswordFilled) {
              navigation.replace("MainApp"); // Proceed to MainApp if password is filled
            }
          }}
          disabled={isButtonDisabled}
        >
          <Text style={styles.loginButtonText}>
            {showPasswordField ? "Login" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC", // Very soft blue-gray
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Softer, larger radius
    padding: 28,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, // Very subtle shadow
    shadowRadius: 12,
    elevation: 3,
    position: "relative", // For positioning the back button
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  backButtonText: {
    color: PRIMARY_COLOR, // Teal color
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 30,
    fontWeight: "600", // Slightly softer than 700
    color: "#1A1A1A", // Dark but not stark black
    textAlign: "center",
    marginBottom: 12,
    marginTop: 40, // Added to avoid overlap with back button
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280", // Soft gray
    textAlign: "center",
    marginBottom: 36,
  },
  inputContainer: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "500", // Medium weight for softness
    color: "#374151", // Gentle dark gray
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB", // Very light gray
    borderRadius: 16, // Softer corners
    borderWidth: 1,
    borderColor: "#E5E7EB", // Subtle border
    color: "#1F2937",
  },
  loginButton: {
    borderRadius: 16, // Rounded edges
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500", // Softer weight
  },
});