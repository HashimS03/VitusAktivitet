"use client"

import { useEffect, useState } from "react"
import { Platform, AppState } from "react-native"
import { Pedometer } from "expo-sensors"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function StepCounter({ setStepCount }) {
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    console.log("StepCounter component mounted!")
    let subscription = null
    let lastAndroidStepCount = 0
    let androidStepsSinceReboot = 0
    let appStateSubscription

    // Check if pedometer is available on the device
    const checkPedometerAvailability = async () => {
      try {
        const available = await Pedometer.isAvailableAsync()
        console.log("Pedometer available:", available)
        return available
      } catch (error) {
        console.error("Error checking pedometer availability:", error)
        return false
      }
    }

    // Load initial step count and last recorded Android step count from storage
    const loadInitialData = async () => {
      try {
        const storedSteps = await AsyncStorage.getItem("stepCount")
        const storedAndroidSteps = await AsyncStorage.getItem("androidStepsSinceReboot")

        if (storedSteps) {
          setStepCount(JSON.parse(storedSteps))
        }

        if (storedAndroidSteps && Platform.OS === "android") {
          androidStepsSinceReboot = JSON.parse(storedAndroidSteps)
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }

    // For iOS: Update step count in storage
    const updateStepCountInStorage = async (newPhysicalSteps) => {
      try {
        // Get previously stored data
        const storedSteps = await AsyncStorage.getItem("stepCount")
        const storedPhysicalSteps = await AsyncStorage.getItem("lastPhysicalSteps")

        const currentTotalSteps = storedSteps ? JSON.parse(storedSteps) : 0
        const lastPhysicalSteps = storedPhysicalSteps ? JSON.parse(storedPhysicalSteps) : 0

        // Calculate new physical steps (the difference)
        const newStepsDelta = Math.max(0, newPhysicalSteps - lastPhysicalSteps)
        const updatedTotalSteps = currentTotalSteps + newStepsDelta

        // Store updated total
        await AsyncStorage.setItem("stepCount", JSON.stringify(updatedTotalSteps))
        await AsyncStorage.setItem("lastPhysicalSteps", JSON.stringify(newPhysicalSteps))

        // Store today's steps in history
        const today = new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD
        const stepHistoryKey = `stepHistory_${today}`
        const storedHistorySteps = await AsyncStorage.getItem(stepHistoryKey)
        const currentHistorySteps = storedHistorySteps ? JSON.parse(storedHistorySteps) : 0
        const updatedHistorySteps = currentHistorySteps + newStepsDelta

        await AsyncStorage.setItem(stepHistoryKey, JSON.stringify(updatedHistorySteps))

        setStepCount(updatedTotalSteps) // Update Dashboard
        console.log(
          "Updated stepCount:",
          updatedTotalSteps,
          "New physical steps:",
          newStepsDelta,
          "History steps for today:",
          updatedHistorySteps,
        )
      } catch (error) {
        console.error("Error updating step count in storage:", error)
      }
    }

    // For Android: Handle step updates differently
    const handleAndroidStepUpdate = async (stepData) => {
      try {
        const currentSteps = stepData.steps

        // If this is the first reading or after a reboot
        if (lastAndroidStepCount === 0) {
          lastAndroidStepCount = currentSteps
          await AsyncStorage.setItem("androidLastStepCount", JSON.stringify(currentSteps))
          return // Skip the first reading to establish a baseline
        }

        // Calculate steps since last check
        let stepDelta = 0

        // If current reading is less than last reading, device likely rebooted
        if (currentSteps < lastAndroidStepCount) {
          console.log("Android device likely rebooted, resetting step counter")
          // Save the current steps as our new baseline
          stepDelta = currentSteps
        } else {
          stepDelta = currentSteps - lastAndroidStepCount
        }

        // Update our tracking variables
        lastAndroidStepCount = currentSteps
        androidStepsSinceReboot += stepDelta

        // Save the latest values
        await AsyncStorage.setItem("androidLastStepCount", JSON.stringify(currentSteps))
        await AsyncStorage.setItem("androidStepsSinceReboot", JSON.stringify(androidStepsSinceReboot))

        // Get stored total steps
        const storedSteps = await AsyncStorage.getItem("stepCount")
        const currentTotalSteps = storedSteps ? JSON.parse(storedSteps) : 0

        // Add new steps to total
        const updatedTotalSteps = currentTotalSteps + stepDelta

        // Store updated total
        await AsyncStorage.setItem("stepCount", JSON.stringify(updatedTotalSteps))

        // Update today's history
        const today = new Date().toISOString().split("T")[0]
        const stepHistoryKey = `stepHistory_${today}`
        const storedHistorySteps = await AsyncStorage.getItem(stepHistoryKey)
        const currentHistorySteps = storedHistorySteps ? JSON.parse(storedHistorySteps) : 0
        const updatedHistorySteps = currentHistorySteps + stepDelta

        await AsyncStorage.setItem(stepHistoryKey, JSON.stringify(updatedHistorySteps))

        // Update UI
        setStepCount(updatedTotalSteps)

        console.log(
          "Android updated stepCount:",
          updatedTotalSteps,
          "New steps:",
          stepDelta,
          "History steps for today:",
          updatedHistorySteps,
        )
      } catch (error) {
        console.error("Error handling Android step update:", error)
      }
    }

    // Handle app state changes (foreground/background)
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("App has come to the foreground!")
        // When app comes to foreground, check for new steps
        if (Platform.OS === "android" && subscription) {
          // For Android, we'll get an update when the app comes to foreground
          console.log("Checking for new steps after app resumed")
        }
      }
      setAppState(nextAppState)
    }

    const setupStepCounting = async () => {
      const available = await checkPedometerAvailability()
      if (!available) {
        console.log("Pedometer is not available on this device")
        return
      }

      await loadInitialData()

      // Set up app state change listener
      appStateSubscription = AppState.addEventListener("change", handleAppStateChange)

      try {
        if (Platform.OS === "ios") {
          // iOS: Use watchStepCount for real-time updates
          subscription = Pedometer.watchStepCount((result) => {
            console.log("iOS steps reported by pedometer:", result.steps)
            updateStepCountInStorage(result.steps)
          })
        } else {
          // Android: Use watchStepCount but handle differently
          // Get the last recorded Android step count
          const storedLastCount = await AsyncStorage.getItem("androidLastStepCount")
          if (storedLastCount) {
            lastAndroidStepCount = JSON.parse(storedLastCount)
          }

          subscription = Pedometer.watchStepCount((result) => {
            console.log("Android steps reported by pedometer:", result.steps)
            handleAndroidStepUpdate(result)
          })
        }
      } catch (error) {
        console.error("Error setting up step counter:", error)
      }
    }

    setupStepCounting()

    // Cleanup
    return () => {
      if (subscription) {
        subscription.remove()
      }
      if (appStateSubscription) {
        appStateSubscription.remove()
      }
    }
  }, [setStepCount])

  return null
}

