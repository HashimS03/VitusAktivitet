import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Users, Bell } from "lucide-react-native";
import * as Progress from "react-native-progress";
import StepCounter from "../stepcounter/stepcounter"; // Sjekk at path er riktig

const TEAL_COLOR = "#00ADB5";

export default function Dashboard() {
  const [stepCount, setStepCount] = useState(0); // Henter faktisk stegdata

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Users size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Progress.Circle
          size={240}
          thickness={20}
          progress={stepCount / 10000} // Dynamisk progresjon
          color={TEAL_COLOR}
          unfilledColor="#E5F7F6"
          borderWidth={0}
          strokeCap="round"
        />
        <View style={styles.progressContent}>
          <Text style={styles.runningIcon}>🏃</Text>
          <Text style={styles.stepsText}>{stepCount}</Text>
          <Text style={styles.dailyStepsLabel}>DAILY STEPS</Text>
        </View>
      </View>

      {/* StepCounter sender oppdatert stepCount til Dashboard */}
      <StepCounter setStepCount={setStepCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    paddingTop: 8,
  },
  iconButton: { padding: 12, backgroundColor: "#FFF", borderRadius: 24 },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 260,
    marginVertical: 8,
  },
  progressContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  runningIcon: { fontSize: 48, color: TEAL_COLOR },
  stepsText: { fontSize: 28, fontWeight: "bold", color: TEAL_COLOR },
  dailyStepsLabel: { fontSize: 14, color: "#666", marginTop: 8 },
});
