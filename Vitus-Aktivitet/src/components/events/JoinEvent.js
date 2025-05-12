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
import apiClient from "../../utils/apiClient";
import { EventContext } from "../events/EventContext";
import { useUserContext } from "../context/UserContext";

export default function JoinEvent({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { joinEvent, loadEvents } = useContext(EventContext);
  const { token } = useUserContext(); // Get token from UserContext

  useEffect(() => {
    if (!permission || permission.status !== "granted") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);

    // Validate and extract eventId
    const eventIdMatch = data.match(/\/event\/([^\/]+)/);
    if (!eventIdMatch || !eventIdMatch[1]) {
      console.error("Invalid QR code URL format:", data);
      Alert.alert("Feil", "Ugyldig QR-kode format. Forventet /event/[ID].");
      setScanned(false);
      return;
    }

    const eventId = eventIdMatch[1].trim();
    console.log("Parsed eventId:", eventId);

    try {
      // Check authentication token
      if (!token) {
        Alert.alert("Feil", "Du må logge inn for å bli med i hendelsen.");
        navigation.navigate("Login");
        return;
      }

      // Attempt to join the event
      const response = await apiClient.post(`/join-event/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Join event response:", response.data);

      if (response.data.success) {
        const eventData = response.data.event || {};
        console.log(
          `Joined event ${eventId} with dates - Start: ${eventData.start_date}, End: ${eventData.end_date}`
        );

        // Prepare full event data with normalized dates and goalValue
        const fullEventData = {
          Id: eventId,
          start_date: eventData.start_date || new Date().toISOString(),
          end_date: eventData.end_date || new Date().toISOString(),
          title: eventData.title || "Ukjent tittel",
          isTeamEvent: eventData.isTeamEvent || false,
          goalValue: eventData.goal || 0, // Include goalValue from server response
          participants: (eventData.participants || []).map((p) => ({
            user_id: p.user_id ? String(p.user_id).trim() : null,
            name: p.name || "Ukjent",
            team_id: p.team_id || null,
            individual_progress: p.individual_progress || 0,
            team_progress: p.team_progress || 0,
          })),
          isLocalOnly: false,
        };

        // Update EventContext and refresh events
        joinEvent(fullEventData);
        await loadEvents();
        Alert.alert("Suksess", "Du har blitt med i hendelsen!", [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("EventsMain", { screen: "YourEvents" }),
          },
        ]);
      } else {
        console.error("Join event failed:", response.data.message);
        Alert.alert(
          "Feil",
          response.data.message || "Kunne ikke bli med i hendelsen"
        );
        setScanned(false);
      }
    } catch (error) {
      console.error("Error joining event:", error.response?.data || error.message);
      Alert.alert(
        "Feil",
        error.response?.data?.message || "Kunne ikke bli med i hendelsen. Prøv igjen."
      );
      setScanned(false);
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