import { useEffect, useState, useContext } from "react";
import { Platform, AppState } from "react-native";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../utils/apiClient";
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
    let syncTimeout = null;

    // Central error handler
    const handleApiError = (error, fallbackMessage) => {
      console.error(fallbackMessage, error);
      
      if (error.response?.status === 401) {
        Alert.alert("Authentication Error", "Please log in to sync step data.");
      } else if (error.response?.status === 503) {
        Alert.alert(
          "Server Problem",
          "The server is temporarily unavailable. Data is saved locally, and we'll sync when the server is back.",
          [{ text: "OK" }]
        );
        // Queue the failed request for later
        if (error.config) {
          const { method, url, data } = error.config;
          queueRequest(method, url, data);
        }
      } else if (error.response?.status === 500) {
        Alert.alert("Server Error", "Unable to save step data. Please try again later.");
      } else {
        Alert.alert("Error", fallbackMessage);
      }
    };

    // Optimized step syncing with debounce
    const syncSteps = (steps) => {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        apiClient.post('/step-activity', {
          stepCount: steps,
          distance: null,
          timestamp: new Date()
        }).catch(err => handleApiError(err, "Failed to sync steps"));
      }, 3000); // Wait 3 seconds between syncs
    };

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
      if (!userId) return; // Ensure user is authenticated
      try {
        // Use apiClient instead of direct axios
        const response = await apiClient.get('/step-activity');
        
        const latestActivity = response.data.data[0];
        if (latestActivity) {
          setStepCount(latestActivity.step_count || 0);
          await AsyncStorage.setItem("stepCount", JSON.stringify(latestActivity.step_count || 0));
        }
        
        const storedAndroidSteps = await AsyncStorage.getItem("androidStepsSinceReboot");
        if (storedAndroidSteps && Platform.OS === "android") {
          androidStepsSinceReboot = JSON.parse(storedAndroidSteps);
        }
        // Ensure totalSteps exists in AsyncStorage
        const storedTotalSteps = await AsyncStorage.getItem("totalSteps");
        if (!storedTotalSteps) {
          await AsyncStorage.setItem("totalSteps", "0");
        }
      } catch (error) {
        handleApiError(error, "Error loading initial step data");
      }
    };

    const updateStepCountInStorage = async (newPhysicalSteps) => {
      if (!userId) return; // Ensure user is authenticated
      try {
        const storedSteps = await AsyncStorage.getItem("stepCount");
        const currentTotalSteps = storedSteps ? JSON.parse(storedSteps) : 0;
        const lastPhysicalSteps = await AsyncStorage.getItem("lastPhysicalSteps")
          ? JSON.parse(await AsyncStorage.getItem("lastPhysicalSteps"))
          : 0;
        const newStepsDelta = Math.max(0, newPhysicalSteps - lastPhysicalSteps);
        const updatedTotalSteps = currentTotalSteps + newStepsDelta;

        // Update totalSteps
        const storedTotalSteps = await AsyncStorage.getItem("totalSteps");
        const currentTotalStepsAllTime = storedTotalSteps ? JSON.parse(storedTotalSteps) : 0;
        const updatedTotalStepsAllTime = currentTotalStepsAllTime + newStepsDelta;
        await AsyncStorage.setItem("totalSteps", JSON.stringify(updatedTotalStepsAllTime));

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
        const maxRetries = 5;
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
              await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
              continue;
            } else {
              if (error.response && error.response.status === 500) {
                Alert.alert("Server Error", "Unable to save step data. Please try again later.");
              } else if (error.response && error.response.status === 401) {
                Alert.alert("Authentication Error", "Please log in to sync step data.");
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
          "Total steps all time:",
          updatedTotalStepsAllTime,
          "History steps for today:",
          updatedHistorySteps
        );
      } catch (error) {
        console.error("Error updating step count in storage:", error);
      }
    };

    const checkAndResetDailySteps = async () => {
      try {
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];
        const lastResetDate = await AsyncStorage.getItem("lastStepResetDate");

        if (lastResetDate !== todayString) {
          const previousSteps = parseInt(
            (await AsyncStorage.getItem("stepCount")) || "0",
            10
          );

          if (lastResetDate && previousSteps > 0) {
            await AsyncStorage.setItem(
              `stepHistory_${lastResetDate}`,
              previousSteps.toString()
            );
          }

          // Update totalSteps before resetting daily steps
          const storedTotalSteps = await AsyncStorage.getItem("totalSteps");
          const currentTotalStepsAllTime = storedTotalSteps ? JSON.parse(storedTotalSteps) : 0;
          const updatedTotalStepsAllTime = currentTotalStepsAllTime + previousSteps;
          await AsyncStorage.setItem("totalSteps", JSON.stringify(updatedTotalStepsAllTime));

          await AsyncStorage.setItem("stepCount", "0");
          await AsyncStorage.setItem("lastStepResetDate", todayString);
          await AsyncStorage.setItem("lastPhysicalSteps", "0");
          setStepCount(0);

          await axios.post(
            `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
            { stepCount: 0, distance: null, timestamp: new Date() },
            { withCredentials: true }
          ).catch((error) => {
            if (error.response && error.response.status === 503) {
              queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
                stepCount: 0,
                distance: null,
                timestamp: new Date(),
              });
            }
          });

          console.log(
            "Daily reset performed. Total steps updated to:",
            updatedTotalStepsAllTime
          );
        }
      } catch (error) {
        console.error("Error in checkAndResetDailySteps:", error);
      }
    };

    const handleAndroidStepUpdate = async (stepData) => {
      if (!userId) return; // Ensure user is authenticated
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
        handleApiError(error, "Error handling Android step update");
      }
    };

    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("App has come to the foreground!");
        syncQueue();
        checkAndResetDailySteps();
      }
      setAppState(nextAppState);
    };

    const queueRequest = async (method, url, data) => {
      const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
      queue.push({ method, url, data, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem("requestQueue", JSON.stringify(queue));
      console.log(`Request queued for later. Queue size: ${queue.length}`);
    };

    const syncQueue = async () => {
      const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
      if (queue.length === 0) return;
      
      console.log(`Attempting to sync ${queue.length} queued requests`);
      
      for (const request of queue) {
        try {
          if (request.url.includes('/step-activity')) {
            // Use apiClient for all requests
            await apiClient[request.method.toLowerCase()](
              '/step-activity', 
              request.data
            );
          }
          
          // Remove the successful request from queue
          const updatedQueue = queue.filter(r => r.timestamp !== request.timestamp);
          await AsyncStorage.setItem("requestQueue", JSON.stringify(updatedQueue));
          console.log(`Successfully synced 1 request. Remaining: ${updatedQueue.length}`);
        } catch (error) {
          console.error("Failed to sync queued request:", error);
          break; // Stop processing if there's an error
        }
      }
    };

    const setupStepCounting = async () => {
      const available = await checkPedometerAvailability();
      if (!available) {
        console.log("Pedometer is not available on this device");
        Alert.alert(
          "Pedometer ikke tilgjengelig",
          "Din enhet støtter ikke skrittelling."
        );
        return;
      }

      await loadInitialData();
      await checkAndResetDailySteps();

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

    // Only set up step counting if the user is authenticated
    if (userId) {
      // This is the critical change - only try to set up when userId is available
      const setupCountingWithDelay = async () => {
        // Add a slight delay to ensure token is properly set in AsyncStorage
        await new Promise(resolve => setTimeout(resolve, 500));
        await setupStepCounting();
      };
      
      setupCountingWithDelay();
    } else {
      console.log("User not authenticated yet - waiting for login");
    }

    return () => {
      if (subscription) subscription.remove();
      if (appStateSubscription) appStateSubscription.remove();
      if (stepUpdateTimeout) clearTimeout(stepUpdateTimeout);
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }, [userId, setStepCount]);

  return null;
}