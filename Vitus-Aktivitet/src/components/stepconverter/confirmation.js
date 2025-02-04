import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";

const STEPS_PER_MINUTE = {
  Gå: 83.33, // About 1750 steps in 21 minutes
  Jogging: 160,
  Løping: 200,
  Sykling: 0, // Non-step activities
  Svømming: 0,
  Styrke: 50,
  Basketball: 120,
  Fotball: 140,
  Padel: 100,
  Planke: 0,
};

const StepConfirmation = ({ navigation, route }) => {
  const { activity, duration } = route.params;
  const steps = Math.round(STEPS_PER_MINUTE[activity] * duration);

  const handleConfirm = () => {
    // Here you would typically save the activity and update the step count
    navigation.navigate("MainApp", { addedSteps: steps });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>
        <Text style={styles.pageIndicator}>3/3</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Godta <Text style={styles.highlightText}>Skritt</Text>
        </Text>

        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationText}>
            <Text style={styles.highlightText}>{duration}</Text> Minutter med å{" "}
            <Text style={styles.highlightText}>{activity}</Text> tilsvarer{"\n"}
            <Text style={styles.highlightText}>{steps}</Text> Skritt
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Godta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5F7F6",
    borderRadius: 4,
    marginHorizontal: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00ADB5",
    borderRadius: 4,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 48,
    textAlign: "center",
  },
  highlightText: {
    color: "#00ADB5",
  },
  confirmationBox: {
    padding: 24,
    alignItems: "center",
  },
  confirmationText: {
    fontSize: 24,
    textAlign: "center",
    lineHeight: 36,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    backgroundColor: "#00ADB5",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default StepConfirmation;
