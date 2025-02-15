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

const HelpSupport = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme(); // Get theme values & accent color

  // State to track which FAQ is open
  const [openFAQ, setOpenFAQ] = useState(null);

  // Sample FAQs
  const faqs = [
    {
      question: "Hvordan oppretter jeg en konto?",
      answer: "For å opprette en konto, gå til påloggingssiden og velg 'Opprett konto'. Følg instruksjonene og fyll ut detaljene dine.",
    },
    {
      question: "Hvordan endrer jeg passordet mitt?",
      answer: "Gå til innstillinger, velg 'Sikkerhet og Personvern' og deretter 'Endre passord'. Følg instruksjonene for å oppdatere passordet ditt.",
    },
    {
      question: "Hvordan sletter jeg kontoen min?",
      answer: "Kontakt vår kundestøtte via 'Kontakt oss'-siden for å be om sletting av kontoen din.",
    },
    {
      question: "Hvordan kan jeg rapportere et problem?",
      answer: "Du kan rapportere problemer ved å gå til 'Kontakt oss'-siden og sende oss en melding med beskrivelsen av problemet.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <View style={[styles.headerWrapper, { borderBottomColor: theme.border }]}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={[styles.header, { color: theme.text }]}>Hjelp & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ofte stilte spørsmål</Text>
          {faqs.map((faq, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <Text style={[styles.label, { color: theme.text }]}>{faq.question}</Text>
                <Ionicons name={openFAQ === index ? "chevron-up" : "chevron-down"} size={20} color={accentColor} />
              </TouchableOpacity>
              {openFAQ === index && <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{faq.answer}</Text>}
            </View>
          ))}
        </View>

        {/* Contact Support Button */}
        <TouchableOpacity
          style={[styles.supportButton, { backgroundColor: accentColor }]}
          onPress={() => navigation.navigate("contactus")}
        >
          <Text style={styles.supportButtonText}>Kontakt Support</Text>
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
    borderBottomWidth: 1,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  faqAnswer: {
    fontSize: 14,
    paddingVertical: 10,
    paddingLeft: 10,
  },
  label: {
    fontSize: 16,
  },
  supportButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  supportButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HelpSupport;
