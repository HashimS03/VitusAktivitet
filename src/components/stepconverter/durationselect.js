import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";

const DurationSelect = ({ navigation, route }) => {
  const { activity } = route.params;
  const [selectedDuration, setSelectedDuration] = useState(21);
  const durations = Array.from({ length: 9 }, (_, i) => 25 - i);

  const handleContinue = () => {
    navigation.navigate("Confirmation", {
      activity,
      duration: selectedDuration,
    });
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
          <View style={[styles.progressFill, { width: "66%" }]} />
        </View>
        <Text style={styles.pageIndicator}>2/3</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Velg hvor <Text style={styles.highlightText}>Lenge</Text>
        </Text>
        <Text style={styles.subtitle}>
          Hvor land tid utførte du din aktivitet
        </Text>

        <ScrollView
          style={styles.durationPicker}
          showsVerticalScrollIndicator={false}
        >
          {durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationOption,
                duration === selectedDuration && styles.selectedDuration,
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === selectedDuration && styles.selectedDurationText,
                ]}
              >
                {duration}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.unitText}>Minutter</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Fortsett</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  highlightText: {
    color: "#00ADB5",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  durationPicker: {
    flex: 1,
  },
  durationOption: {
    paddingVertical: 16,
    alignItems: "center",
  },
  selectedDuration: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#00ADB5",
  },
  durationText: {
    fontSize: 24,
    color: "#666666",
  },
  selectedDurationText: {
    fontSize: 32,
    color: "#00ADB5",
    fontWeight: "600",
  },
  unitText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
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
  continueButton: {
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
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default DurationSelect;
