import React, { useEffect } from "react";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StepCounter({ setStepCount }) {
  useEffect(() => {
    console.log("StepCounter component mounted!");

    const checkPedometerAvailability = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        console.log("Pedometer available:", available);
      } catch (error) {
        console.error("Error checking pedometer availability:", error);
      }
    };

    const updateStepCountInStorage = async (newPhysicalSteps) => {
      try {
        // Hent tidligere lagret data
        const storedSteps = await AsyncStorage.getItem("stepCount");
        const storedPhysicalSteps = await AsyncStorage.getItem(
          "lastPhysicalSteps"
        );

        const currentTotalSteps = storedSteps ? JSON.parse(storedSteps) : 0;
        const lastPhysicalSteps = storedPhysicalSteps
          ? JSON.parse(storedPhysicalSteps)
          : 0;

        // Beregn nye skritt (differansen)
        const newStepsDelta = Math.max(0, newPhysicalSteps - lastPhysicalSteps);
        const updatedTotalSteps = currentTotalSteps + newStepsDelta;

        // Lagre oppdatert total og siste fysiske skritt
        await AsyncStorage.setItem(
          "stepCount",
          JSON.stringify(updatedTotalSteps)
        );
        await AsyncStorage.setItem(
          "lastPhysicalSteps",
          JSON.stringify(newPhysicalSteps)
        );

        setStepCount(updatedTotalSteps); // Oppdater Dashboard
        console.log(
          "Updated stepCount:",
          updatedTotalSteps,
          "New physical steps:",
          newStepsDelta
        );
      } catch (error) {
        console.error("Error updating step count in storage:", error);
      }
    };

    const subscribe = () => {
      try {
        return Pedometer.watchStepCount((result) => {
          console.log("Total steps reported by pedometer:", result.steps);
          updateStepCountInStorage(result.steps); // Send totalen fra pedometeret
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
  }, [setStepCount]);

  return null;
}
