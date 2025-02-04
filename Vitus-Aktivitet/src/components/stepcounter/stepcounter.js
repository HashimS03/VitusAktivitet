import React, { useEffect } from "react";
import { Pedometer } from "expo-sensors";

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

    const subscribe = () => {
      try {
        return Pedometer.watchStepCount((result) => {
          console.log("Steps detected:", result.steps);
          setStepCount(result.steps); // Oppdaterer Dashboard sitt stepCount
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

  return null; // Denne komponenten trenger ikke å returnere UI-elementer.
}
