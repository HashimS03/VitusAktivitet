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

const Language = () => {
  const navigation = useNavigation();

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
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.header}>Språk</Text>
      </View>

      {/* Language Selection */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Suggested Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested</Text>
          {suggestedLanguages.map((language) => (
            <TouchableOpacity
              key={language}
              style={styles.row}
              onPress={() => setSelectedLanguage(language)}
            >
              <Text style={styles.label}>{language}</Text>
              <View style={selectedLanguage === language ? styles.radioSelected : styles.radio} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Others</Text>
          {otherLanguages.map((language) => (
            <TouchableOpacity
              key={language}
              style={styles.row}
              onPress={() => setSelectedLanguage(language)}
            >
              <Text style={styles.label}>{language}</Text>
              <View style={selectedLanguage === language ? styles.radioSelected : styles.radio} />
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
    backgroundColor: "#F6F6F6",
    paddingTop: Platform.OS === "ios" ? 60 : 40, // Adjust for status bar height
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
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
    color: "#333",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#B3E5FC",
    backgroundColor: "transparent",
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#48CAB2",
    backgroundColor: "#48CAB2",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Language;
