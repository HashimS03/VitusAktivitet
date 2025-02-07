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

const HelpSupport = () => {
  const navigation = useNavigation();

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
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={styles.header}>Hjelp & Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ofte stilte spørsmål</Text>
          {faqs.map((faq, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <Text style={styles.label}>{faq.question}</Text>
                <Ionicons name={openFAQ === index ? "chevron-up" : "chevron-down"} size={20} color="#48CAB2" />
              </TouchableOpacity>
              {openFAQ === index && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </View>
          ))}
        </View>

        {/* Contact Support Button */}
        <TouchableOpacity
          style={styles.supportButton}
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
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 10,
    paddingLeft: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  supportButton: {
    backgroundColor: "#48CAB2",
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
