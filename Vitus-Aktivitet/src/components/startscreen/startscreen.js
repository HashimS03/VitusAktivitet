import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");
const TEAL_COLOR = "#00B6AA";

export default function StartScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../../../assets/runner.png")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>vitus</Text>
            <Text style={styles.logoText}>
              aktivitet<Text style={styles.plus}>+</Text>
            </Text>
          </View>

          <View style={styles.bottomContent}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate("Login")} // Gå til Login-skjermen
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width,
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 100,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoText: {
    color: "#FFF",
    fontSize: 48,
    fontWeight: "bold",
    lineHeight: 52,
  },
  plus: {
    color: "#FFF",
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
});
