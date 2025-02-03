import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Pedometer } from "expo-sensors";

export default function StepCounter() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(null);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    console.log("StepCounter component mounted!");

    const checkPedometerAvailability = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(available);
        console.log("Pedometer available:", available);
      } catch (error) {
        console.error("Error checking pedometer availability:", error);
      }
    };

    const subscribe = () => {
      try {
        return Pedometer.watchStepCount((result) => {
          console.log("Steps detected:", result.steps);
          setStepCount(result.steps); // Oppdaterer antall skritt
        });
      } catch (error) {
        console.error("Error subscribing to step counter:", error);
      }
    };

    checkPedometerAvailability();
    const subscription = subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isPedometerAvailable
          ? "Skritteller er tilgjengelig"
          : "Skritteller ikke tilgjengelig"}
      </Text>
      <Text style={styles.count}>Antall skritt: {stepCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  count: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
