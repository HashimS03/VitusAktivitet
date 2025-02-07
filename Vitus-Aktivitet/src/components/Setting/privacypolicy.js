import React from "react";
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

const PrivacyPolicy = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={styles.header}>Personvern & Retningslinjer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>1. Innledning</Text>
        <Text style={styles.paragraph}>
          Vi verdsetter ditt personvern og streber etter å beskytte dine personlige data.
          Denne personvernpolitikken forklarer hvordan vi samler inn, bruker og deler
          informasjon når du bruker vår app.
        </Text>

        <Text style={styles.sectionTitle}>2. Hvilken informasjon vi samler inn</Text>
        <Text style={styles.paragraph}>
          Vi kan samle inn personlig identifiserbar informasjon, som navn, e-postadresse,
          telefonnummer og annen informasjon du oppgir til oss.
        </Text>

        <Text style={styles.sectionTitle}>3. Hvordan vi bruker informasjonen</Text>
        <Text style={styles.paragraph}>
          Informasjonen vi samler inn brukes til å forbedre appen, personalisere din
          opplevelse, og for å kommunisere med deg om viktige oppdateringer.
        </Text>

        <Text style={styles.sectionTitle}>4. Deling av informasjon</Text>
        <Text style={styles.paragraph}>
          Vi deler ikke din personlige informasjon med tredjeparter uten ditt samtykke, 
          med mindre det er nødvendig for å levere tjenesten eller som kreves av loven.
        </Text>

        <Text style={styles.sectionTitle}>5. Dine rettigheter</Text>
        <Text style={styles.paragraph}>
          Du har rett til å be om tilgang til, korrigere eller slette din personlige informasjon. 
          Kontakt oss hvis du ønsker å utøve disse rettighetene.
        </Text>

        <Text style={styles.sectionTitle}>6. Endringer i denne personvernpolitikken</Text>
        <Text style={styles.paragraph}>
          Vi forbeholder oss retten til å oppdatere denne personvernpolitikken når som helst.
          Vi vil varsle deg om eventuelle vesentlige endringer.
        </Text>

        <Text style={styles.sectionTitle}>7. Kontakt oss</Text>
        <Text style={styles.paragraph}>
          Hvis du har spørsmål om denne personvernpolitikken, kan du kontakte oss på 
          support@yourapp.com.
        </Text>
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
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
});

export default PrivacyPolicy;
