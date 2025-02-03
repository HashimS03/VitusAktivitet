import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";

const { width } = Dimensions.get("window");
const TEAL_COLOR = "#00B6AA";

export default function GenderSelection({ navigation, onComplete }) {
  const [selectedGender, setSelectedGender] = useState(null);
  const [animation] = useState(new Animated.Value(0));

  const handleSelect = (gender) => {
    setSelectedGender(gender);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleContinue = () => {
    if (selectedGender) {
      onComplete(selectedGender);
      navigation.navigate("DepartmentSelection");
    }
  };

  const maleScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, selectedGender === "male" ? 1.1 : 0.9],
  });

  const femaleScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, selectedGender === "female" ? 1.1 : 0.9],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: "33%" }]} />
          </View>
          <Text style={styles.progressText}>1/3</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Velg Ditt <Text style={styles.highlight}>Kjønn</Text>
        </Text>
        <Text style={styles.subtitle}>La oss bli bedre kjent.</Text>

        <View style={styles.genderContainer}>
          <Animated.View
            style={[styles.genderOption, { transform: [{ scale: maleScale }] }]}
          >
            <TouchableOpacity
              onPress={() => handleSelect("male")}
              style={[
                styles.genderButton,
                selectedGender === "male" && styles.selectedGender,
              ]}
            >
              <Image
                source={require("../../../assets/mann.png")}
                style={styles.genderImage}
              />
              {selectedGender === "male" && (
                <View style={styles.selectionIndicator}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.dotSmall]} />
                  <View style={[styles.dot, styles.dotTiny]} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.genderLabel}>Mann</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.genderOption,
              { transform: [{ scale: femaleScale }] },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleSelect("female")}
              style={[
                styles.genderButton,
                selectedGender === "female" && styles.selectedGender,
              ]}
            >
              <Image
                source={require("../../../assets/kvinne.png")}
                style={styles.genderImage}
              />
              {selectedGender === "female" && (
                <View style={styles.selectionIndicator}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.dotSmall]} />
                  <View style={[styles.dot, styles.dotTiny]} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.genderLabel}>Kvinne</Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate("DepartmentSelection")}
        >
          <Text style={styles.skipButtonText}>Hopp Over</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedGender && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueButtonText,
              selectedGender && styles.continueButtonTextActive,
            ]}
          >
            Fortsett
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5F7F6",
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: TEAL_COLOR,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  highlight: {
    color: TEAL_COLOR,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 60,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  genderOption: {
    alignItems: "center",
  },
  genderButton: {
    width: 120,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  selectedGender: {
    backgroundColor: "#E5F7F6",
    borderRadius: 60,
  },
  genderImage: {
    width: 100,
    height: 200,
    resizeMode: "contain",
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectionIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  dot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: TEAL_COLOR,
    position: "absolute",
  },
  dotSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -30,
    left: 50,
  },
  dotTiny: {
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 40,
    left: -20,
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    paddingBottom: 40,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#E5F7F6",
  },
  skipButtonText: {
    color: TEAL_COLOR,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  continueButtonActive: {
    backgroundColor: TEAL_COLOR,
  },
  continueButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButtonTextActive: {
    color: "#FFF",
  },
});
