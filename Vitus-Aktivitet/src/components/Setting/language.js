import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function LanguageSelection() {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState("Norsk");

  const handleSelectLanguage = (language) => {
    setSelectedLanguage(language);
    navigation.goBack(); // ✅ Navigate back after selection
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Velg Språk</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Language Options */}
      <TouchableOpacity
        style={[styles.languageOption, selectedLanguage === "Norsk" && styles.selected]}
        onPress={() => handleSelectLanguage("Norsk")}
      >
        <View style={styles.languageRow}>
          <Text style={styles.flag}>🇳🇴</Text>
          <Text style={styles.languageText}>Norsk</Text>
        </View>
        {selectedLanguage === "Norsk" && <Ionicons name="checkmark" size={24} color="#007AFF" />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.languageOption, selectedLanguage === "English" && styles.selected]}
        onPress={() => handleSelectLanguage("English")}
      >
        <View style={styles.languageRow}>
          <Text style={styles.flag}>🇬🇧</Text>
          <Text style={styles.languageText}>English</Text>
        </View>
        {selectedLanguage === "English" && <Ionicons name="checkmark" size={24} color="#007AFF" />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.languageOption, selectedLanguage === "Español" && styles.selected]}
        onPress={() => handleSelectLanguage("Español")}
      >
        <View style={styles.languageRow}>
          <Text style={styles.flag}>🇪🇸</Text>
          <Text style={styles.languageText}>Español</Text>
        </View>
        {selectedLanguage === "Español" && <Ionicons name="checkmark" size={24} color="#007AFF" />}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  selected: {
    backgroundColor: "#EAF4FE",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 20, 
    marginRight: 8,
  },
  languageText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

