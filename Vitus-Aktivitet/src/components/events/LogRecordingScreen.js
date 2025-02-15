import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

const LogRecordingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, eventTitle } = route.params || {};
  const { theme, accentColor } = useTheme(); // 🌙 Get Theme & Accent Color

  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!result.trim()) {
      Alert.alert("Feil", "Du må skrive inn et resultat");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulerer sending til database, erstatt dette med API-kall senere
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Registrert", "Ditt resultat er lagret!");
      navigation.goBack(); // Går tilbake til eventet
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke lagre resultatet. Prøv igjen.");
    }

    setIsSubmitting(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        {eventTitle || "Loggføring"}
      </Text>
      <Text style={[styles.label, { color: theme.text }]}>
        Skriv inn ditt resultat
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={result}
        onChangeText={setResult}
        placeholder="F.eks. 50 push-ups eller 2 km"
        placeholderTextColor={theme.textSecondary}
        keyboardType="default"
      />
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: isSubmitting ? theme.disabled : accentColor },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? "Lagrer..." : "Send inn resultat"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LogRecordingScreen;
