import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

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
  const { theme, accentColor } = useTheme(); // 🌙 Get Theme & Accent Color

  const handleConfirm = () => {
    // Here you would typically save the activity and update the step count
    navigation.navigate("MainApp", { addedSteps: steps });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
          <View
            style={[styles.progressFill, { backgroundColor: accentColor, width: "100%" }]}
          />
        </View>
        <Text style={[styles.pageIndicator, { color: theme.text }]}>3/3</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Godta <Text style={[styles.highlightText, { color: accentColor }]}>Skritt</Text>
        </Text>

        <View style={styles.confirmationBox}>
          <Text style={[styles.confirmationText, { color: theme.text }]}>
            <Text style={[styles.highlightText, { color: accentColor }]}>{duration}</Text> Minutter med å{" "}
            <Text style={[styles.highlightText, { color: accentColor }]}>{activity}</Text> tilsvarer{"\n"}
            <Text style={[styles.highlightText, { color: accentColor }]}>{steps}</Text> Skritt
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: accentColor }]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Godta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 4,
    marginHorizontal: 16,
  },
  progressFill: {
    height: "100%",
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
    fontWeight: "bold",
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
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default StepConfirmation;
