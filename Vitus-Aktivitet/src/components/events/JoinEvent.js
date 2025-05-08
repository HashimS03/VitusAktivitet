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
import { EventContext } from "../events/EventContext"; // Adjust the path

export default function JoinEvent({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { joinEvent } = useContext(EventContext);

  useEffect(() => {
    if (!permission || permission.status !== "granted") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    const eventId = data.split("/event/")[1];
    try {
      const response = await apiClient.post(`/join-event/${eventId}`);
      if (response.data.success) {
        joinEvent(); // Activate polling and immediate fetch
        Alert.alert("Suksess", "Du har blitt med i hendelsen!", [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("EventsMain", { screen: "YourEvents" }),
          },
        ]);
      } else {
        Alert.alert(
          "Feil",
          response.data.message || "Kunne ikke bli med i hendelsen"
        );
        setScanned(false);
      }
    } catch (error) {
      console.error("Error joining event:", error);
      Alert.alert("Feil", "Kunne ikke bli med i hendelsen. Prøv igjen.");
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
