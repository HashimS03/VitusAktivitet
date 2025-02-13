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

const LogRecordingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId, eventTitle } = route.params || {};

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
    <View style={styles.container}>
      <Text style={styles.title}>{eventTitle || "Loggføring"}</Text>
      <Text style={styles.label}>Skriv inn ditt resultat</Text>
      <TextInput
        style={styles.input}
        value={result}
        onChangeText={setResult}
        placeholder="F.eks. 50 push-ups eller 2 km"
        keyboardType="default"
      />
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
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
    backgroundColor: "#fff",
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
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#00BFA5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LogRecordingScreen;
