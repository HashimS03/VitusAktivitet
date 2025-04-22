import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
  Modal,
} from "react-native";
import { ChevronLeft, Camera } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TEAL_COLOR = "#00B6AA";

const avatars = [
  { id: 1, source: require("../../../assets/avatars/Avatar_Asian.png") },
  { id: 2, source: require("../../../assets/avatars/Avatar_Athlete.png") },
  { id: 3, source: require("../../../assets/avatars/Avatar_Dizzy.png") },
  { id: 4, source: require("../../../assets/avatars/Avatar_Gangster.png") },
  { id: 5, source: require("../../../assets/avatars/Avatar_Happy.png") },
  { id: 6, source: require("../../../assets/avatars/Avatar_Love.png") },
  { id: 7, source: require("../../../assets/avatars/Avatar_Sikh.png") },
  { id: 8, source: require("../../../assets/avatars/Avatar_Smirk.png") },
  { id: 9, source: require("../../../assets/avatars/Avatar_Hijabi.png") },
  { id: 10, source: require("../../../assets/avatars/Avatar_Silly.png") },
];

export default function AvatarSelection({ navigation }) {
  const [selectedMode, setSelectedMode] = useState("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [progress] = useState(new Animated.Value(0));
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    const loadSelection = async () => {
      try {
        const selection = await AsyncStorage.getItem("userAvatarSelection");
        if (selection) {
          const parsedSelection = JSON.parse(selection);
          if (parsedSelection.type === "avatar") {
            setSelectedMode("avatar");
            setSelectedAvatar(parsedSelection.value);
            setPhoto(null);
          } else if (parsedSelection.type === "photo") {
            setSelectedMode("picture");
            setPhoto(parsedSelection.value);
            setSelectedAvatar(null);
          }
        }
      } catch (error) {
        console.error("Error loading avatar selection:", error);
      }
    };
    loadSelection();
  }, []);

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
    } else {
      alert("Camera permission is required to take a photo.");
    }
    setIsModalVisible(false);
  };

  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setSelectedAvatar(null);
      }
    } else {
      alert("Gallery permission is required to choose a photo.");
    }
    setIsModalVisible(false);
  };

  const handleContinue = async () => {
    if (selectedAvatar || photo) {
      try {
        const selection = {
          type: selectedAvatar ? "avatar" : "photo",
          value: selectedAvatar ? selectedAvatar : photo,
        };
        console.log("Saving avatar selection to AsyncStorage:", selection);
        await AsyncStorage.setItem(
          "userAvatarSelection",
          JSON.stringify(selection)
        );
        navigation.replace("MainApp");
      } catch (error) {
        console.error("Error saving avatar selection:", error);
      }
    } else {
      console.log("No avatar selected, skipping save");
      navigation.replace("MainApp");
    }
  };

  const selectedAvatarObj = avatars.find(
    (avatar) => avatar.id === selectedAvatar
  );

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

        <View style={styles.previewContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          ) : selectedAvatarObj ? (
            <Image
              source={selectedAvatarObj.source}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewPlaceholderText}>Velg et bilde</Text>
            </View>
          )}
          <Text style={styles.previewText}>
            Dette er hvordan profilen din vil se ut
          </Text>
        </View>

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
              <TouchableOpacity
                style={styles.photoPreviewContainer}
                onPress={() => setIsModalVisible(true)}
              >
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <View style={styles.changePhotoOverlay}>
                  <Ionicons name="pencil" size={20} color="#FFF" />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setIsModalVisible(true)}
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
          onPress={() => navigation.goBack()}
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

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Velg en handling</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.modalButtonText}>Ta bilde</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleChooseFromGallery}
            >
              <Text style={styles.modalButtonText}>Velg fra galleri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                Avbryt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  previewContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: TEAL_COLOR,
    backgroundColor: "#EDEDED",
  },
  previewPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EDEDED",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5F7F6",
  },
  previewPlaceholderText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  previewText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
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
  photoPreviewContainer: {
    position: "relative",
    width: 200,
    height: 200,
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  changePhotoOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: TEAL_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#E5F7F6",
  },
  cancelButtonText: {
    color: TEAL_COLOR,
  },
});
