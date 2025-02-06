import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Video } from "expo-av";

const { width, height } = Dimensions.get("window");
const TEAL_COLOR = "#00B6AA";

export default function StartScreen({ navigation }) {
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
});
