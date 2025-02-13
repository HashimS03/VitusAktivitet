import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

const Language = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme(); // Get theme and accent color

  // State for selected language
  const [selectedLanguage, setSelectedLanguage] = useState("Norsk Bokmål");

  const suggestedLanguages = ["English (US)", "Norsk Bokmål"];
  const otherLanguages = [
    "Mandarin",
    "Hindi",
    "Spanish",
    "French",
    "Norsk Sidemål",
    "Russian",
    "Indonesian",
    "Vietnamese",
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <View style={[styles.headerWrapper, { borderBottomColor: theme.border }]}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.header, { color: theme.text }]}>Språk</Text>
      </View>

      {/* Language Selection */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Suggested Languages */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Suggested</Text>
          {suggestedLanguages.map((language) => (
            <TouchableOpacity
              key={language}
              style={styles.row}
              onPress={() => setSelectedLanguage(language)}
            >
              <Text style={[styles.label, { color: theme.text }]}>{language}</Text>
              <View
                style={[
                  styles.radio,
                  selectedLanguage === language && {
                    borderColor: accentColor,
                    backgroundColor: accentColor,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Languages */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Others</Text>
          {otherLanguages.map((language) => (
            <TouchableOpacity
              key={language}
              style={styles.row}
              onPress={() => setSelectedLanguage(language)}
            >
              <Text style={[styles.label, { color: theme.text }]}>{language}</Text>
              <View
                style={[
                  styles.radio,
                  selectedLanguage === language && {
                    borderColor: accentColor,
                    backgroundColor: accentColor,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40, // Adjust for status bar height
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    position: "relative",
    borderBottomWidth: 1, // Adds bottom border for separation
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
    marginTop: 10, // Moves the title lower
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#B3E5FC", // Default border color for unselected
    backgroundColor: "transparent",
  },
});

export default Language;
