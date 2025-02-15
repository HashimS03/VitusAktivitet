'use client';

import React, { useEffect, useState } from "react";
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
import { useTheme } from '../context/ThemeContext';

const Theme = () => {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme, theme, changeAccentColor, accentColor } = useTheme(); // Get theme values
  
  // Predefined accent colors
  const accentColors = ["#48CAB2", "#FF6B6B", "#FFD93D", "#4C82FB", "#8A4FFF"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={[styles.header, { color: theme.text }]}>Tema</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dark Mode Toggle */}
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tema Modus</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Mørk Modus</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#ccc", true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
        </View>

        {/* Accent Color Selection */}
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Fargevalg</Text>
          <View style={styles.colorRow}>
            {accentColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle, 
                  { 
                    backgroundColor: color,
                    borderColor: accentColor === color ? theme.text : "transparent"
                  }
                ]}
                onPress={() => changeAccentColor(color)} // Now directly updates global theme
              >
                {accentColor === color && (
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                )}
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
    marginTop: Platform.OS === "ios" ? 60 : 40,
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
