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
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

const SecurityPrivacy = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme(); // 🌙 Get Theme & Accent Color

  // State for security toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [adTracking, setAdTracking] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <View style={[styles.headerWrapper, { borderBottomColor: theme.border }]}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={[styles.header, { color: theme.text }]}>Sikkerhet & Personvern</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sikkerhet</Text>

          {/* Change Password */}
          <TouchableOpacity style={styles.row} onPress={() => alert("Gå til endre passord-siden")}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Endre passord</Text>
            <Ionicons name="chevron-forward" size={20} color={accentColor} />
          </TouchableOpacity>

          {/* Two-Factor Authentication */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Tofaktorautentisering</Text>
            <Switch
              value={twoFactorAuth}
              onValueChange={setTwoFactorAuth}
              trackColor={{ false: theme.switchOff, true: accentColor }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>

          {/* Biometric Login */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Biometrisk innlogging</Text>
            <Switch
              value={biometricLogin}
              onValueChange={setBiometricLogin}
              trackColor={{ false: theme.switchOff, true: accentColor }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>

        {/* Privacy Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personvern</Text>

          {/* Ad Tracking */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Sporing av annonser</Text>
            <Switch
              value={adTracking}
              onValueChange={setAdTracking}
              trackColor={{ false: theme.switchOff, true: accentColor }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>

          {/* Data Sharing */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Deling av data</Text>
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              trackColor={{ false: theme.switchOff, true: accentColor }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>

        {/* Privacy Policy Button */}
        <TouchableOpacity
          style={[styles.privacyButton, { backgroundColor: accentColor }]}
          onPress={() => navigation.navigate("PrivacyPolicy")}  // 👈 Navigate to PrivacyPolicy
        >
          <Text style={styles.privacyButtonText}>Vis Personvernregler</Text>
        </TouchableOpacity>
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
  privacyButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  privacyButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SecurityPrivacy;
