"use client";

import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";

export default function EditAvatar() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { userId } = useContext(UserContext);
  const [selectedMode, setSelectedMode] = useState("avatar");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserAvatar();
    }
  }, [userId]);

  const loadUserAvatar = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }
      console.log("Fetching user avatar for userId:", userId);
      console.log("Request URL:", `${SERVER_CONFIG.getBaseUrl()}/user`);
      const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User avatar response:", response.data);
      if (response.data.success && response.data.user.avatar) {
        setSelectedMode("picture");
        setPhoto(response.data.user.avatar);
        setPhotoBase64(response.data.user.avatar);
        setSelectedAvatar(null);
      }
    } catch (error) {
      console.error("Error loading user avatar:", error);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPhoto(uri);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setPhotoBase64(`data:image/jpeg;base64,${base64}`);
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
        const uri = result.assets[0].uri;
        setPhoto(uri);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setPhotoBase64(`data:image/jpeg;base64,${base64}`);
        setSelectedAvatar(null);
      }
    } else {
      alert("Gallery permission is required to choose a photo.");
    }
    setIsModalVisible(false);
  };

  const handleContinue = async () => {
    if (selectedAvatar || photoBase64) {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found");
        }
        const avatarData = selectedAvatar
          ? avatars.find((avatar) => avatar.id === selectedAvatar).base64
          : photoBase64;
        console.log("Updating avatar with data:", { avatar: avatarData.substring(0, 50) + "..." });
        console.log("Request URL:", `${SERVER_CONFIG.getBaseUrl()}/user`);
        console.log("Request Headers:", { Authorization: `Bearer ${token}` });
        const response = await axios.put(
          `${SERVER_CONFIG.getBaseUrl()}/user`,
          { avatar: avatarData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Avatar update response:", response.data);
        if (response.data.success) {
          alert("Avatar updated successfully!");
          navigation.goBack();
        } else {
          alert("Failed to update avatar.");
        }
      } catch (error) {
        console.error("Error saving avatar:", error);
        alert("Error saving avatar.");
      }
    }
  };

  const avatars = [
    {
      id: 1,
      source: require("../../../assets/avatars/Avatar_Asian.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 2,
      source: require("../../../assets/avatars/Avatar_Athlete.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 3,
      source: require("../../../assets/avatars/Avatar_Dizzy.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 4,
      source: require("../../../assets/avatars/Avatar_Gangster.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 5,
      source: require("../../../assets/avatars/Avatar_Happy.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 6,
      source: require("../../../assets/avatars/Avatar_Love.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 7,
      source: require("../../../assets/avatars/Avatar_Sikh.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 8,
      source: require("../../../assets/avatars/Avatar_Smirk.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 9,
      source: require("../../../assets/avatars/Avatar_Hijabi.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
    {
      id: 10,
      source: require("../../../assets/avatars/Avatar_Silly.png"),
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAECgJ/2h5nAAAAAElFTkSuQmCC",
    },
  ];

  const selectedAvatarObj = avatars.find((avatar) => avatar.id === selectedAvatar);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Rediger Avatar</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          <Text>Velg hvordan du viser </Text>
          <Text style={[styles.highlight, { color: theme.primary }]}>Deg</Text>
        </Text>

        <View style={styles.previewContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={[styles.previewImage, { borderColor: theme.primary }]} />
          ) : selectedAvatarObj ? (
            <Image source={selectedAvatarObj.source} style={[styles.previewImage, { borderColor: theme.primary }]} />
          ) : (
            <View
              style={[
                styles.previewPlaceholder,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDarkMode ? theme.border : theme.primary + "30",
                },
              ]}
            >
              <Text style={[styles.previewPlaceholderText, { color: theme.textSecondary }]}>Velg et bilde</Text>
            </View>
          )}
          <Text style={[styles.previewText, { color: theme.textSecondary }]}>
            Dette er hvordan profilen din vil se ut
          </Text>
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === "avatar" && [styles.toggleButtonActive, { backgroundColor: theme.card }],
            ]}
            onPress={() => setSelectedMode("avatar")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: theme.textSecondary },
                selectedMode === "avatar" && [styles.toggleTextActive, { color: theme.text }],
              ]}
            >
              Avatar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === "picture" && [styles.toggleButtonActive, { backgroundColor: theme.card }],
            ]}
            onPress={() => setSelectedMode("picture")}
          >
            <Text
              style={[
                styles.toggleText,
                { color: theme.textSecondary },
                selectedMode === "picture" && [styles.toggleTextActive, { color: theme.text }],
              ]}
            >
              Bilde
            </Text>
          </TouchableOpacity>
        </View>

        {selectedMode === "avatar" ? (
          <ScrollView contentContainerStyle={styles.avatarGrid} showsVerticalScrollIndicator={false}>
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarContainer,
                  selectedAvatar === avatar.id && [styles.selectedAvatar, { backgroundColor: theme.primary + "20" }],
                ]}
                onPress={() => {
                  setSelectedAvatar(avatar.id);
                  setPhoto(null);
                  setPhotoBase64(null);
                }}
              >
                <Image source={avatar.source} style={styles.avatar} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.cameraContainer}>
            {photo ? (
              <TouchableOpacity style={styles.photoPreviewContainer} onPress={() => setIsModalVisible(true)}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <View style={[styles.changePhotoOverlay, { borderColor: theme.card }]}>
                  <Ionicons name="pencil" size={20} color={theme.card} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: theme.surface }]}
                onPress={() => setIsModalVisible(true)}
              >
                <Camera size={40} color={theme.primary} />
                <Text style={[styles.cameraText, { color: theme.primary }]}>Ta bilde</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: theme.primary + "20" }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.skipButtonText, { color: theme.primary }]}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: theme.border },
            (selectedAvatar || photo) && [styles.continueButtonActive, { backgroundColor: theme.primary }],
          ]}
          onPress={handleContinue}
          disabled={!(selectedAvatar || photo)}
        >
          <Text
            style={[
              styles.continueButtonText,
              { color: theme.textSecondary },
              (selectedAvatar || photo) && [styles.continueButtonTextActive, { color: theme.card }],
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
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Velg en handling</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleTakePhoto}
            >
              <Text style={[styles.modalButtonText, { color: theme.card }]}>Ta bilde</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleChooseFromGallery}
            >
              <Text style={[styles.modalButtonText, { color: theme.card }]}>Velg fra galleri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.primary + "20" }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText, { color: theme.primary }]}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  highlight: {
    fontWeight: "bold",
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
  },
  previewPlaceholderText: {
    fontSize: 14,
    textAlign: "center",
  },
  previewText: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: "italic",
  },
  toggleContainer: {
    flexDirection: "row",
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
  },
  toggleTextActive: {
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
    justifyContent: "center",
    alignItems: "center",
  },
  cameraText: {
    marginTop: 16,
    fontSize: 16,
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
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    borderRadius: 12,
  },
  continueButtonActive: {
    backgroundColor: "#00B6AA",
  },
  continueButtonText: {
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#E5F7F6",
  },
  cancelButtonText: {
    color: "#00B6AA",
  },
});