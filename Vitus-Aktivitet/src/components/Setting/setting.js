import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // 👈 Importer navigasjon


const SettingsRow = ({ icon, title, value, onPress }) => (
  <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
    <View style={styles.settingsLeft}>
      <Ionicons name={icon} size={24} color="#000" />
      <Text style={styles.settingsText}>{title}</Text>
    </View>
    {value && (
      <Text
        style={[styles.settingsValue, value === "ON" && styles.activeValue]}
      >
        {value}
      </Text>
    )}
  </TouchableOpacity>
);

const SettingsSection = ({ children }) => (
  <View style={styles.settingsSection}>{children}</View>
);

export default function SettingScreen() {
  const navigation = useNavigation(); // 👈 Hent navigasjon

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 🔙 Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Settings Header */}
        <Text style={styles.settingsHeader}>Innstillinger</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../../assets/figure/aura.jpeg")}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Hashem Sheikh</Text>
          <Text style={styles.contact}>
            youremail@domain.com | +47 256 27 189
          </Text>
        </View>

        {/* Settings Sections */}
        <SettingsSection>
          <SettingsRow
            icon="document-text"
            title="Rediger Profil Informasjon"
          />
          <SettingsRow icon="notifications" title="Varslinger" value="ON" />
          <SettingsRow icon="language" title="Språk" value="Norsk"  
          onPress={() => navigation.navigate("Language")} // ✅ Navigate to Language Selection
          />
          
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon="shield-checkmark"
            title="Sikkerhet og Personvern"
          />
          <SettingsRow icon="color-palette" title="Tema" value="Lys Modus" />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow icon="help-circle" title="Help & Support" />
          <SettingsRow icon="chatbubbles" title="Kontakt oss" />
          <SettingsRow
            icon="lock-closed"
            title="Personvern og Retningslinjer"
          />
          <SettingsRow
            icon="log-out"
            title="Logg ut"
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Start" }], // ✅ Use "Start" instead of "Startscreen"
              });
            }}/>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5F3F3" },
  backButton: {
    padding: 16,
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  settingsHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E6E6FA",
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  contact: { color: "#666", marginBottom: 24 },
  settingsSection: {
    backgroundColor: "white",
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
  settingsValue: { color: "#0066FF" },
  activeValue: { fontWeight: "600" },
});
