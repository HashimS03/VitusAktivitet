"use client";

import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import InviteMembersScreen from "./InviteMembersScreen";
import { useTheme } from "../context/ThemeContext";
import * as Progress from "react-native-progress";
import { EventContext } from "../events/EventContext";
import apiClient from "../../utils/apiClient";

const ActiveEvent = ({ route }) => {
  const { eventId } = route.params || {};
  const { activeEvents, pastEvents, updateEvent, deleteEvent, fetchEvent } =
    useContext(EventContext);
  const eventDetails =
    activeEvents.find((event) => event.id === eventId) ||
    pastEvents.find((event) => event.id === eventId);

  const [isModalVisible, setModalVisible] = useState(false);
  const [showInviteScreen, setShowInviteScreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState("");
  const [participantsData, setParticipantsData] = useState([]);
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();

  const isEventFinished =
    eventDetails && new Date(eventDetails.end_date) < new Date();

  // Fetch participant details
  const fetchParticipants = async () => {
    if (!eventDetails?.id) return;
    try {
      const response = await apiClient.get(`/participants/${eventDetails.id}`);
      setParticipantsData(response.data.participants);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      Alert.alert("Error", "Failed to fetch participants. Please try again.");
    }
  };

  // Poll for event updates
  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(async () => {
      try {
        const updatedEvent = await fetchEvent(eventId);
        updateEvent(updatedEvent);
        fetchParticipants();
      } catch (error) {
        console.error("Failed to poll event updates:", error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [eventId, fetchEvent, updateEvent]);

  useEffect(() => {
    navigation.setOptions({
      transitionSpec: {
        open: { animation: "timing", config: { duration: 300 } },
        close: { animation: "timing", config: { duration: 300 } },
      },
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
      }),
    });
  }, [navigation]);

  const toggleModal = () => setModalVisible(!isModalVisible);

  const handleBackPress = () =>
    navigation.navigate("EventsMain", { screen: "YourEvents" });

  const handleEditEvent = () => {
    toggleModal();
    navigation.navigate("NewEvent", { eventDetails, isEditing: true });
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      "Slett hendelse",
      "Er du sikker på at du vil slette denne hendelsen?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett",
          style: "destructive",
          onPress: () => {
            deleteEvent(eventId);
            navigation.navigate("EventsMain", { screen: "YourEvents" });
          },
        },
      ]
    );
  };

  const handleUpdateProgress = () => {
    setShowProgressModal(true);
  };

  const submitProgress = () => {
    const newValue = Number.parseInt(newProgress, 10);
    if (
      !isNaN(newValue) &&
      newValue >= 0 &&
      newValue <= eventDetails.goalValue
    ) {
      setCurrentValue(newValue);
      setProgress(newValue / eventDetails.goalValue);
      setShowProgressModal(false);
      setNewProgress("");

      updateEvent({
        ...eventDetails,
        currentValue: newValue,
        progress: newValue / eventDetails.goalValue,
      });
    } else {
      Alert.alert(
        "Ugyldig verdi",
        "Vennligst skriv inn en gyldig verdi mellom 0 og målet."
      );
    }
  };

  useEffect(() => {
    if (!eventDetails) {
      navigation.goBack();
    } else {
      setCurrentValue(eventDetails.currentValue || 0);
      setProgress(eventDetails.progress || 0);
    }
  }, [eventDetails, navigation]);

  if (!eventDetails) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("no", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("no", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* ...existing JSX code... */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // ...existing styles...
});

export default ActiveEvent;
