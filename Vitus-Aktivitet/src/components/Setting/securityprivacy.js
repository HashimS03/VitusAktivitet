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

const SecurityPrivacy = () => {
  const navigation = useNavigation();

  // State for security toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [adTracking, setAdTracking] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={styles.header}>Sikkerhet & Personvern</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Security Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sikkerhet</Text>

          {/* Change Password */}
          <TouchableOpacity style={styles.row} onPress={() => alert("Gå til endre passord-siden")}>
            <Text style={styles.label}>Endre passord</Text>
            <Ionicons name="chevron-forward" size={20} color="#48CAB2" />
          </TouchableOpacity>

          {/* Two-Factor Authentication */}
          <View style={styles.row}>
            <Text style={styles.label}>Tofaktorautentisering</Text>
            <Switch
              value={twoFactorAuth}
              onValueChange={setTwoFactorAuth}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>

          {/* Biometric Login */}
          <View style={styles.row}>
            <Text style={styles.label}>Biometrisk innlogging</Text>
            <Switch
              value={biometricLogin}
              onValueChange={setBiometricLogin}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>

        {/* Privacy Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personvern</Text>

          {/* Ad Tracking */}
          <View style={styles.row}>
            <Text style={styles.label}>Sporing av annonser</Text>
            <Switch
              value={adTracking}
              onValueChange={setAdTracking}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>

          {/* Data Sharing */}
          <View style={styles.row}>
            <Text style={styles.label}>Deling av data</Text>
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>

        {/* Privacy Policy Button */}
        <TouchableOpacity style={styles.privacyButton} onPress={() => alert("Vis personvernregler")}>
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
    backgroundColor: "#F6F6F6",
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
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  privacyButton: {
    backgroundColor: "#48CAB2",
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
