import { useEffect, useState, useContext } from "react";
import { Platform, AppState } from "react-native";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { Alert } from "react-native";
import { SERVER_CONFIG } from "../../config/serverConfig";

export default function StepCounter({ setStepCount }) {
  const { userId } = useContext(UserContext);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    console.log("StepCounter component mounted! UserId:", userId);
    let subscription = null;
    let lastAndroidStepCount = 0;
    let androidStepsSinceReboot = 0;
    let appStateSubscription;
    let stepUpdateTimeout = null;

    const checkPedometerAvailability = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        console.log("Pedometer available:", available);
        return available;
      } catch (error) {
        console.error("Error checking pedometer availability:", error);
        return false;
      }
    };

    const loadInitialData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
          withCredentials: true,
        });
        const latestActivity = response.data.data[0];
        if (latestActivity) {
          setStepCount(latestActivity.step_count || 0);
          await AsyncStorage.setItem("stepCount", JSON.stringify(latestActivity.step_count || 0));
        }
        const storedAndroidSteps = await AsyncStorage.getItem("androidStepsSinceReboot");
        if (storedAndroidSteps && Platform.OS === "android") {
          androidStepsSinceReboot = JSON.parse(storedAndroidSteps);
        }
      } catch (error) {
        console.error("Error loading initial step data:", error);
        if (error.response && error.response.status === 500) {
          Alert.alert("Server Error", "Unable to load step data. Please try again later.");
        } else if (error.response && error.response.status === 503) {
          Alert.alert(
            "Server Problem",
            "The server is temporarily unavailable. Data is saved locally, and we'll sync when the server is back.",
            [{ text: "OK" }]
          );
        }
      }
    };

    const updateStepCountInStorage = async (newPhysicalSteps) => {
      if (!userId) return;
      try {
        const storedSteps = await AsyncStorage.getItem("stepCount");
        const currentTotalSteps = storedSteps ? JSON.parse(storedSteps) : 0;
        const lastPhysicalSteps = await AsyncStorage.getItem("lastPhysicalSteps")
          ? JSON.parse(await AsyncStorage.getItem("lastPhysicalSteps"))
          : 0;
        const newStepsDelta = Math.max(0, newPhysicalSteps - lastPhysicalSteps);
        const updatedTotalSteps = currentTotalSteps + newStepsDelta;

        await AsyncStorage.setItem("stepCount", JSON.stringify(updatedTotalSteps));
        await AsyncStorage.setItem("lastPhysicalSteps", JSON.stringify(newPhysicalSteps));

        const today = new Date().toISOString().split("T")[0];
        const stepHistoryKey = `stepHistory_${today}`;
        const storedHistorySteps = await AsyncStorage.getItem(stepHistoryKey)
          ? JSON.parse(await AsyncStorage.getItem(stepHistoryKey))
          : 0;
        const updatedHistorySteps = storedHistorySteps + newStepsDelta;
        await AsyncStorage.setItem(stepHistoryKey, JSON.stringify(updatedHistorySteps));

        // Sync with backend with retry
        const maxRetries = 3;
        let attempt = 0;
        while (attempt < maxRetries) {
          try {
            await axios.post(
              `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
              {
                stepCount: updatedTotalSteps,
                distance: null,
                timestamp: new Date(),
              },
              { withCredentials: true }
            );
            break;
          } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed:`, error);
            if (error.response && error.response.status === 503 && attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
              continue;
            } else {
              if (error.response && error.response.status === 500) {
                Alert.alert("Server Error", "Unable to save step data. Please try again later.");
              } else if (error.response && error.response.status === 503) {
                queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
                  stepCount: updatedTotalSteps,
                  distance: null,
                  timestamp: new Date(),
                });
              }
              break;
            }
          }
        }

        setStepCount(updatedTotalSteps);
        console.log(
          "Updated stepCount:",
          updatedTotalSteps,
          "New physical steps:",
          newStepsDelta,
          "History steps for today:",
          updatedHistorySteps
        );
      } catch (error) {
        console.error("Error updating step count in storage:", error);
      }
    };

    const handleAndroidStepUpdate = async (stepData) => {
      if (!userId) return;
      try {
        const currentSteps = stepData.steps;

        if (lastAndroidStepCount === 0) {
          lastAndroidStepCount = currentSteps;
          await AsyncStorage.setItem("androidLastStepCount", JSON.stringify(currentSteps));
          return;
        }

        let stepDelta = 0;
        if (currentSteps < lastAndroidStepCount) {
          console.log("Android device likely rebooted, resetting step counter");
          stepDelta = currentSteps;
        } else {
          stepDelta = currentSteps - lastAndroidStepCount;
        }

        lastAndroidStepCount = currentSteps;
        androidStepsSinceReboot += stepDelta;

        await AsyncStorage.setItem("androidLastStepCount", JSON.stringify(currentSteps));
        await AsyncStorage.setItem("androidStepsSinceReboot", JSON.stringify(androidStepsSinceReboot));

        if (stepUpdateTimeout) clearTimeout(stepUpdateTimeout);
        stepUpdateTimeout = setTimeout(async () => {
          const storedSteps = await AsyncStorage.getItem("stepCount");
          const currentTotalSteps = storedSteps ? JSON.parse(storedSteps) : 0;
          const updatedTotalSteps = currentTotalSteps + stepDelta;

          await updateStepCountInStorage(updatedTotalSteps);
        }, 15000); // Update every 15 seconds
      } catch (error) {
        console.error("Error handling Android step update:", error);
        if (error.response && error.response.status === 500) {
          Alert.alert("Server Error", "Unable to save step data. Please try again later.");
        } else if (error.response && error.response.status === 503) {
          const storedSteps = await AsyncStorage.getItem("stepCount");
          const currentTotalSteps = storedSteps ? JSON.parse(storedSteps) : 0;
          queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
            stepCount: currentTotalSteps + (stepData.steps - lastAndroidStepCount),
            distance: null,
            timestamp: new Date(),
          });
        }
      }
    };

    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("App has come to the foreground!");
        syncQueue();
      }
      setAppState(nextAppState);
    };

    const queueRequest = async (method, url, data) => {
      const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
      queue.push({ method, url, data, timestamp: new Date() });
      await AsyncStorage.setItem("requestQueue", JSON.stringify(queue));
    };

    const syncQueue = async () => {
      const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
      for (const request of queue) {
        try {
          await axios[request.method.toLowerCase()](request.url, request.data, { withCredentials: true });
          const updatedQueue = queue.filter((r) => r.timestamp !== request.timestamp);
          await AsyncStorage.setItem("requestQueue", JSON.stringify(updatedQueue));
        } catch (error) {
          console.error("Failed to sync queued request:", error);
          break;
        }
      }
    };

    const setupStepCounting = async () => {
      const available = await checkPedometerAvailability();
      if (!available) {
        console.log("Pedometer is not available on this device");
        return;
      }

      await loadInitialData();

      appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

      try {
        if (Platform.OS === "ios") {
          subscription = Pedometer.watchStepCount((result) => {
            console.log("iOS steps reported by pedometer:", result.steps);
            updateStepCountInStorage(result.steps);
          });
        } else {
          const storedLastCount = await AsyncStorage.getItem("androidLastStepCount");
          if (storedLastCount) {
            lastAndroidStepCount = JSON.parse(storedLastCount);
          }

          subscription = Pedometer.watchStepCount((result) => {
            console.log("Android steps reported by pedometer:", result.steps);
            handleAndroidStepUpdate(result);
          });
        }
      } catch (error) {
        console.error("Error setting up step counter:", error);
      }
    };

    if (userId) setupStepCounting();

    return () => {
      if (subscription) subscription.remove();
      if (appStateSubscription) appStateSubscription.remove();
      if (stepUpdateTimeout) clearTimeout(stepUpdateTimeout);
    };
  }, [userId, setStepCount]);

  return null;
}