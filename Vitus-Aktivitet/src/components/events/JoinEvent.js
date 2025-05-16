"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "./EventContext"; // Updated path - same directory
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function JoinEvent({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { joinEvent, refreshEvents } = useContext(EventContext); // Use context for event functions
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Failed to load userId:", error);
      }
    };
    
    loadUserId();
  }, []);

  useEffect(() => {
    if (!permission || permission.status !== "granted") {
      requestPermission();
    }
  }, [permission, requestPermission]); // Added requestPermission to dependencies

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    const eventId = data.split("/event/")[1];
    Alert.alert("QR Skannet", `Bli med i hendelse: ${data}`, [
      {
        text: "OK",
        onPress: () => navigation.navigate("ActiveEvent", { eventId }),
      },
    ]);
  };

  const handleJoinPress = async (event) => {
    try {
      const eventId = event.id || event.Id;
      
      if (!eventId) {
        Alert.alert("Error", "Unable to join event: No event ID");
        return;
      }
      
      console.log("Joining event with ID:", eventId);
      const success = await joinEvent(eventId);
      
      if (success) {
        Alert.alert(
          "Success",
          "You've joined the event!",
          [
            {
              text: "View Event",
              onPress: () => navigation.navigate("ActiveEvent", { eventId }),
            },
            {
              text: "OK",
              onPress: () => refreshEvents(),
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to join the event. Please try again.");
      }
    } catch (error) {
      console.error("Error joining event:", error);
      Alert.alert("Error", "Failed to join the event: " + error.message);
    }
  };

  const getEventImage = (event) => {
    // Default image if none provided
    return event.image 
      ? { uri: event.image } 
      : require("../../../assets/Vitus_Happy.png");
  };

  const handleEventPress = (event) => {
    const eventId = event.id || event.Id;
    navigation.navigate("ActiveEvent", { eventId });
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Behandler tilgang...</Text>
      </View>
    );
  }

  if (permission.status !== "granted") {
    return (
      <View style={styles.container}>
        <Text>Ingen tilgang til kamera</Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Gi tilgang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <Image
        source={require("../../../assets/qr-placeholder.png")}
        style={styles.qrPlaceholder}
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      {scanned && (
        <TouchableOpacity
          style={styles.rescanButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.rescanButtonText}>Skann på nytt</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
  },
  rescanButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#00BFA5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
});
