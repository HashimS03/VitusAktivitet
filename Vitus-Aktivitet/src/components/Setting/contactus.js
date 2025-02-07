import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ContactUs = () => {
  const navigation = useNavigation();

  // State for user message
  const [message, setMessage] = useState("");

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={styles.header}>Kontakt Oss</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontaktinformasjon</Text>

          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL("mailto:support@yourapp.com")}>
            <Ionicons name="mail" size={24} color="#48CAB2" />
            <Text style={styles.label}>support@yourapp.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL("tel:+4723456789")}>
            <Ionicons name="call" size={24} color="#48CAB2" />
            <Text style={styles.label}>+47 23 45 67 89</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL("https://yourapp.com")}>
            <Ionicons name="globe" size={24} color="#48CAB2" />
            <Text style={styles.label}>www.yourapp.com</Text>
          </TouchableOpacity>
        </View>

        {/* Message Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send oss en melding</Text>

          <TextInput
            style={styles.messageInput}
            multiline
            numberOfLines={5}
            placeholder="Skriv din melding her..."
            value={message}
            onChangeText={setMessage}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => alert("Meldingen din har blitt sendt!")}
          >
            <Text style={styles.submitText}>SEND</Text>
          </TouchableOpacity>
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
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  messageInput: {
    backgroundColor: "#EEF4FF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#48CAB2",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ContactUs;
