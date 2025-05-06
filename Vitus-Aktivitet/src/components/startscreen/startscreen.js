import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  Linking,
  Alert,
  BackHandler,
  Platform,
} from "react-native";
import { Video } from "expo-av";

const { width, height } = Dimensions.get("window");
const TEAL_COLOR = "#00B6AA";

export default function StartScreen({ navigation }) {
  const [isConsentVisible, setIsConsentVisible] = useState(true);

  const handleAcceptConsent = () => {
    setIsConsentVisible(false);
  };

  const handleDeclineConsent = () => {
    Alert.alert(
      "Samtykke kreves",
      "Du må godta personvernpolicyen for å bruke VitusAktivitet. Hvis du avslår, kan du ikke fortsette. Ønsker du å avslutte appen?",
      [
        {
          text: "Nei, prøv igjen",
          onPress: () => setIsConsentVisible(true), // Holder modalen åpen
          style: "cancel",
        },
        {
          text: "Ja, avslutt",
          onPress: () => {
            if (Platform.OS === "android") {
              BackHandler.exitApp(); // Avslutter appen på Android
            } else {
              // På iOS kan vi ikke avslutte appen programmatisk, så vi informerer brukeren
              Alert.alert(
                "Informasjon",
                "Vennligst lukk appen manuelt hvis du ikke ønsker å fortsette.",
                [{ text: "OK" }]
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://example.com/privacy-policy"); // Erstatt med faktisk URL
  };

  const openTermsOfUse = () => {
    Linking.openURL("https://example.com/terms-of-use"); // Erstatt med faktisk URL
  };

  return (
    <View style={styles.container}>
      <Video
        source={require("../../../assets/runner.mp4")}
        style={styles.backgroundVideo}
        shouldPlay
        isLooping
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/vitusaktivitet_white_sq.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.bottomContent}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginButtonText}>Logg inn</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Har ikke en konto? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.signupLink}>Opprett nå</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isConsentVisible}
        onRequestClose={() => setIsConsentVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>Personvern og samtykke</Text>
            <Text style={styles.modalText}>
              VitusAktivitet verdsetter ditt personvern. Vi bruker dataene dine
              til å forbedre opplevelsen din i appen, i samsvar med vår{" "}
              <Text style={styles.link} onPress={openPrivacyPolicy}>
                personvernpolicy
              </Text>{" "}
              og{" "}
              <Text style={styles.link} onPress={openTermsOfUse}>
                vilkår for bruk
              </Text>
              . Ved å fortsette godtar du vår behandling av data. Du kan når som
              helst trekke tilbake samtykket ditt via appens innstillinger.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.declineButton]}
                onPress={handleDeclineConsent}
              >
                <Text style={styles.buttonText}>Avslå</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={handleAcceptConsent}
              >
                <Text style={styles.buttonText}>Godta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundVideo: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 100,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoImage: {
    width: 300,
    height: 150,
  },
  bottomContent: {
    gap: 24,
  },
  loginButton: {
    backgroundColor: TEAL_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  signupLink: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: "100%",
    maxHeight: height * 0.5,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 3,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  link: {
    color: TEAL_COLOR,
    textDecorationLine: "underline",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: "center",
    flex: 1,
  },
  acceptButton: {
    backgroundColor: TEAL_COLOR,
  },
  declineButton: {
    backgroundColor: "#DDD",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
