import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Theme = () => {
  const navigation = useNavigation();

  // State for dark mode toggle
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State for accent color selection
  const [selectedColor, setSelectedColor] = useState("#48CAB2");

  // Predefined accent colors
  const accentColors = ["#48CAB2", "#FF6B6B", "#FFD93D", "#4C82FB", "#8A4FFF"];

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#222" : "#F6F6F6" }]}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={isDarkMode ? "#FFF" : "#000"} />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={[styles.header, { color: isDarkMode ? "#FFF" : "#000" }]}>Tema</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dark Mode Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFF" : "#333" }]}>Tema Modus</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: isDarkMode ? "#FFF" : "#333" }]}>Mørk Modus</Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#ccc", true: selectedColor }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>

        {/* Accent Color Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? "#FFF" : "#333" }]}>Fargevalg</Text>
          <View style={styles.colorRow}>
            {accentColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorCircle, { backgroundColor: color, borderColor: selectedColor === color ? "#FFF" : "transparent" }]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && <Ionicons name="checkmark" size={18} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
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
    marginTop: Platform.OS === "ios" ? 60 : 40, // Adjust for status bar height
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
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
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
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Theme;
