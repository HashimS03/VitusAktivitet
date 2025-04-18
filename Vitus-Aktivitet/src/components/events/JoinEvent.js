"use client";

import React, { useState, useEffect } from "react";
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

export default function JoinEvent({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

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

  // Normalize event information for consistent rendering
  const renderEvent = (event) => {
    // Ensure consistent event ID handling
    const eventId = event.id || event.Id;
    
    if (!eventId) {
      console.error("Event missing ID:", event);
      return null;
    }
    
    // Check if user is already participating
    const isUserParticipating = !!event.participants?.some(
      p => p.userId?.toString() === userId?.toString() || 
           p.user_id?.toString() === userId?.toString()
    );

    return (
      <TouchableOpacity
        key={eventId}
        style={[
          styles.eventCard,
          { backgroundColor: isDarkMode ? "#333" : theme.surface },
        ]}
        onPress={() => handleEventPress(event)}
      >
        <View style={styles.cardContent}>
          <Image
            source={getEventImage(event)}
            style={styles.eventImage}
            resizeMode="contain"
          />
          <View style={styles.eventDetails}>
            <Text
              style={[
                styles.eventTitle,
                { color: isDarkMode ? "#fff" : theme.text },
              ]}
            >
              {event.title}
            </Text>
            <Text
              style={[
                styles.eventDescription,
                { color: isDarkMode ? "#ccc" : theme.textSecondary },
              ]}
            >
              {event.description && event.description.length > 60
                ? `${event.description.substring(0, 60)}...`
                : event.description}
            </Text>
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color={isDarkMode ? "#ccc" : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: isDarkMode ? "#ccc" : theme.textSecondary },
                  ]}
                >
                  {formatDate(event.start_date)} -{" "}
                  {formatDate(event.end_date)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={isDarkMode ? "#ccc" : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: isDarkMode ? "#ccc" : theme.textSecondary },
                  ]}
                >
                  {event.location || "No location"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.joinStatus}>
            {isUserParticipating ? (
              <View
                style={[
                  styles.joinedBadge,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Text
                  style={[styles.joinedBadgeText, { color: theme.primary }]}
                >
                  Joined
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: theme.primary }]}
                onPress={() => handleJoinPress(event)}
              >
                <Text
                  style={[
                    styles.joinButtonText,
                    { color: isDarkMode ? "#000" : "#fff" },
                  ]}
                >
                  Join
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
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
