import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

const SettingsRow = ({ icon, title, value, onPress, isLastItem }) => {
  const { theme, accentColor } = useTheme(); // Get Theme & Accent Color

  return (
    <TouchableOpacity
      style={[
        styles.settingsRow,
        !isLastItem && {
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        }, // ✅ Only add border if NOT last item
      ]}
      onPress={onPress}
    >
      <View style={styles.settingsLeft}>
        <Ionicons name={icon} size={24} color={theme.text} />
        <Text style={[styles.settingsText, { color: theme.text }]}>
          {title}
        </Text>
      </View>
      {value && (
        <Text
          style={[
            styles.settingsValue,
            { color: accentColor },
            value === "ON" && styles.activeValue,
          ]}
        >
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const SettingsSection = ({ children }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.settingsSection, { backgroundColor: theme.surface }]}>
      {children}
    </View>
  );
};

export default function SettingScreen() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme(); // ✅ Ensure correct theme state

  // 🔴 Logout Confirmation Function
  const handleLogout = () => {
    Alert.alert("Logg ut", "Er du sikker på at du vil logge ut?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Logg ut",
        style: "destructive",
        onPress: () =>
          navigation.reset({ index: 0, routes: [{ name: "Start" }] }),
      },
    ]);
  };

  // ✅ Correctly detect theme mode (light/dark)
  const themeMode = isDarkMode ? "Mørk Modus" : "Lys Modus"; // 🔥 FIXED

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView>
        {/* 🔹 Header Section */}
        <View style={styles.headerContainer}>
          {/* 🔙 Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>

          {/* 🏷 Title Aligned with Back Button */}
          <Text style={[styles.settingsHeader, { color: theme.text }]}>
            Innstillinger
          </Text>
        </View>

        {/* 🔹 Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../../assets/figure/aura.jpeg")}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.surface }]}
            >
              <Ionicons name="pencil" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            Hashem Sheikh
          </Text>
          <Text style={[styles.contact, { color: theme.textSecondary }]}>
            youremail@domain.com | +47 256 27 189
          </Text>
        </View>

        {/* 🔹 Settings Sections */}
        <SettingsSection>
          {[
            {
              icon: "document-text",
              title: "Rediger Profil Informasjon",
              route: "EditProfile",
            },
            {
              icon: "notifications",
              title: "Varslinger",
              value: "ON",
              route: "notificationeditor",
            },
            {
              icon: "language",
              title: "Språk",
              value: "Norsk",
              route: "Language",
            },
          ].map((item, index, array) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              value={item.value}
              onPress={() => navigation.navigate(item.route)}
              isLastItem={index === array.length - 1} // ✅ Last item gets NO border
            />
          ))}
        </SettingsSection>

        <SettingsSection>
          {[
            {
              icon: "shield-checkmark",
              title: "Sikkerhet og Personvern",
              route: "securityprivacy",
            },
            {
              icon: "color-palette",
              title: "Tema",
              value: themeMode,
              route: "Theme",
            }, // ✅ FIXED
          ].map((item, index, array) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              value={item.value}
              onPress={() => navigation.navigate(item.route)}
              isLastItem={index === array.length - 1}
            />
          ))}
        </SettingsSection>

        <SettingsSection>
          {[
            {
              icon: "help-circle",
              title: "Help & Support",
              route: "helpsupport",
            },
            { icon: "chatbubbles", title: "Kontakt oss", route: "contactus" },
            { icon: "log-out", title: "Logg ut", onPress: handleLogout },
          ].map((item, index, array) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              onPress={
                item.onPress
                  ? item.onPress
                  : () => navigation.navigate(item.route)
              }
              isLastItem={index === array.length - 1}
            />
          ))}
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ✅ Header Fix: Aligns title and back button properly
  headerContainer: {
    flexDirection: "row",
    alignItems: "center", // Aligns items on the same row
    paddingHorizontal: 16,
    paddingVertical: 16, // ✅ Moves title up
  },

  backButton: {
    padding: 8,
  },

  settingsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1, // ✅ Ensures title is centered while back button stays on the left
    left: -10, // ✅ Moves title slightly left to balance alignment
    textAlign: "center",
    marginLeft: -24, // ✅ Moves title slightly left to balance alignment
  },

  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  contact: { marginBottom: 24 },
  settingsSection: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  settingsLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsText: { fontSize: 16 },
  settingsValue: { fontSize: 16 },
  activeValue: { fontWeight: "600" },
});
