import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { ChevronLeft, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

const TEAL_COLOR = "#00B6AA";

const avatars = [
  { id: 1, source: require("../../../assets/avatars/memo_34.png") },
  { id: 2, source: require("../../../assets/avatars/memo_9.png") },
  { id: 3, source: require("../../../assets/avatars/memo_2.png") },
  { id: 4, source: require("../../../assets/avatars/memo_10.png") },
  { id: 5, source: require("../../../assets/avatars/memo_20.png") },
  { id: 6, source: require("../../../assets/avatars/memo_1.png") },
  { id: 7, source: require("../../../assets/avatars/memo_32.png") },
  { id: 8, source: require("../../../assets/avatars/memo_7.png") },
  { id: 9, source: require("../../../assets/avatars/memo_33.png") },
  { id: 10, source: require("../../../assets/avatars/memo_16.png") },
  { id: 11, source: require("../../../assets/avatars/memo_31.png") },
  { id: 12, source: require("../../../assets/avatars/memo_5.png") },
  { id: 13, source: require("../../../assets/avatars/memo_35.png") },
  { id: 14, source: require("../../../assets/avatars/memo_28.png") },
  { id: 15, source: require("../../../assets/avatars/memo_8.png") },
];

export default function AvatarSelection({ navigation }) {
  const [selectedMode, setSelectedMode] = useState("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setSelectedAvatar(null);
      }
    }
  };

  const handleContinue = () => {
    if (selectedAvatar || photo) {
      navigation.replace("MainApp");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>3/3</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Velg hvordan du viser <Text style={styles.highlight}>Deg</Text>
        </Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === "avatar" && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedMode("avatar")}
          >
            <Text
              style={[
                styles.toggleText,
                selectedMode === "avatar" && styles.toggleTextActive,
              ]}
            >
              Avatar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === "picture" && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedMode("picture")}
          >
            <Text
              style={[
                styles.toggleText,
                selectedMode === "picture" && styles.toggleTextActive,
              ]}
            >
              Picture
            </Text>
          </TouchableOpacity>
        </View>

        {selectedMode === "avatar" ? (
          <ScrollView
            contentContainerStyle={styles.avatarGrid}
            showsVerticalScrollIndicator={false}
          >
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarContainer,
                  selectedAvatar === avatar.id && styles.selectedAvatar,
                ]}
                onPress={() => {
                  setSelectedAvatar(avatar.id);
                  setPhoto(null);
                }}
              >
                <Image source={avatar.source} style={styles.avatar} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.cameraContainer}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            ) : (
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleTakePhoto}
              >
                <Camera size={40} color={TEAL_COLOR} />
                <Text style={styles.cameraText}>Ta bilde</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace("MainApp")}
        >
          <Text style={styles.skipButtonText}>Hopp Over</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedAvatar || photo) && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueButtonText,
              (selectedAvatar || photo) && styles.continueButtonTextActive,
            ]}
          >
            Fortsett
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5F7F6",
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: TEAL_COLOR,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  highlight: {
    color: TEAL_COLOR,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 100,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#FFF",
  },
  toggleText: {
    fontSize: 16,
    color: "#666",
  },
  toggleTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  avatarContainer: {
    width: "30%",
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 16,
    padding: 8,
  },
  selectedAvatar: {
    backgroundColor: "#E5F7F6",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraText: {
    marginTop: 16,
    fontSize: 16,
    color: TEAL_COLOR,
    fontWeight: "600",
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    paddingBottom: 40,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#E5F7F6",
  },
  skipButtonText: {
    color: TEAL_COLOR,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  continueButtonActive: {
    backgroundColor: TEAL_COLOR,
  },
  continueButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButtonTextActive: {
    color: "#FFF",
  },
});
