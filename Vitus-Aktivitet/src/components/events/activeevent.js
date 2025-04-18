"use client";

import { useState, useContext, useEffect, useCallback } from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SERVER_CONFIG } from "../../config/serverConfig";

const ActiveEvent = ({ route }) => {
  const { eventId } = route.params || {};
  const { 
    activeEvents, 
    pastEvents, 
    upcomingEvents,
    updateEvent, 
    deleteEvent, 
    joinEvent, 
    leaveEvent, 
    fetchEventParticipants, 
    checkParticipation,
    getEventById
  } = useContext(EventContext);
  
  const [eventDetails, setEventDetails] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [showInviteScreen, setShowInviteScreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState("");
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const [participants, setParticipants] = useState([]);
  const [isParticipating, setIsParticipating] = useState(false);
  const [participantId, setParticipantId] = useState(null);
  const [userTeamId, setUserTeamId] = useState(null);
  const [isEventFinished, setIsEventFinished] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

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
    setMenuVisible(false);
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this past event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEvent(eventId),
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

  const renderTeamMembers = () => {
    if (!eventDetails.teams || eventDetails.teams.length === 0) {
      return (
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          Ingen lag tilgjengelig
        </Text>
      );
    }

    const totalMembers = 1; // Only you are in the first team
    const maxMembers = eventDetails.teamCount * eventDetails.membersPerTeam;

    return (
      <>
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          {totalMembers} av {maxMembers} medlemmer
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.membersList}
        >
          {eventDetails.teams.map((team, teamIndex) => (
            <View
              key={team.id}
              style={[
                styles.teamContainer,
                teamIndex > 0 && { marginLeft: 24 },
              ]}
            >
              <Text style={[styles.teamTitle, { color: theme.text }]}>
                {team.name}
              </Text>
              <View style={styles.teamMembers}>
                {teamIndex === 0 ? (
                  <View style={styles.memberAvatar}>
                    <Image
                      source={require("../../../assets/member-avatar.png")}
                      style={styles.avatarImage}
                    />
                    <Text
                      style={[
                        styles.memberName,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Du
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.emptyAvatar,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={() =>
                      !isEventFinished && setShowInviteScreen(true)
                    } // Deaktiver invitasjon hvis hendelsen er ferdig
                    disabled={isEventFinished}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color={isDarkMode ? theme.surface : theme.background}
                    />
                  </TouchableOpacity>
                )}
                {Array.from(
                  { length: eventDetails.membersPerTeam - 1 },
                  (_, i) => (
                    <TouchableOpacity
                      key={`empty_${team.id}_${i}`}
                      style={[
                        styles.emptyAvatar,
                        {
                          backgroundColor: theme.primary,
                          marginLeft: 16,
                        },
                      ]}
                      onPress={() =>
                        !isEventFinished && setShowInviteScreen(true)
                      } // Deaktiver invitasjon
                      disabled={isEventFinished}
                    >
                      <MaterialCommunityIcons
                        name="plus"
                        size={24}
                        color={isDarkMode ? theme.surface : theme.background}
                      />
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </>
    );
  };

  const renderIndividualParticipants = () => {
    // Get total counts for display
    const filledParticipants = participants.length;
    const totalParticipants = eventDetails.total_participants || 10;
    const emptySlots = Math.max(0, totalParticipants - filledParticipants);
    
    return (
      <>
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          {filledParticipants} of {totalParticipants} participants
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.membersList}
        >
          <View style={styles.participantsContainer}>
            <View style={styles.participantsRow}>
              {/* Render actual participants */}
              {participants.map((participant) => (
                <View key={participant.id} style={styles.memberAvatar}>
                  <Image
                    source={
                      participant.avatar 
                        ? { uri: participant.avatar }
                        : require("../../../assets/member-avatar.png")
                    }
                    style={styles.avatarImage}
                  />
                  <Text style={[styles.memberName, { color: theme.textSecondary }]}>
                    {participant.userId === userId ? "You" : participant.userName}
                  </Text>
                </View>
              ))}
              
              {/* Join button or empty slots */}
              {!isParticipating && emptySlots > 0 ? (
                <TouchableOpacity
                  style={[styles.emptyAvatar, { backgroundColor: theme.primary }]}
                  onPress={() => handleJoinEvent()}
                  disabled={isEventFinished}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={24}
                    color={isDarkMode ? theme.surface : theme.background}
                  />
                </TouchableOpacity>
              ) : (
                // Show empty slots
                Array.from({ length: emptySlots }, (_, i) => (
                  <View
                    key={`empty_${i}`}
                    style={[styles.emptyAvatar, { backgroundColor: theme.border }]}
                  >
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={24}
                      color={theme.textSecondary}
                    />
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </>
    );
  };

  useEffect(() => {
    if (!eventDetails) {
      navigation.goBack();
    } else {
      setCurrentValue(eventDetails.currentValue || 0);
      setProgress(eventDetails.progress || 0);
    }
  }, [eventDetails, navigation]);

  useEffect(() => {
    console.log("Event Details:", eventDetails);
  }, [eventDetails]);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        // Fetch participants for this event
        const eventParticipants = await fetchEventParticipants(eventId);
        setParticipants(eventParticipants);
        
        // Check if current user is participating
        const participation = await checkParticipation(eventId);
        setIsParticipating(participation.isParticipating);
        setParticipantId(participation.participantId);
        setUserTeamId(participation.teamId);
      } catch (error) {
        console.error("Failed to load event data:", error);
      }
    };
    
    loadEventData();
  }, [eventId]);

  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        
        // Get event ID from route params with more consistent fallbacks
        const eventIdParam = route.params?.eventId || 
                            route.params?.eventData?.id || 
                            route.params?.eventData?.Id;
        
        console.log("Navigate to event with ID:", eventIdParam);
        
        if (!eventIdParam) {
          // If we have eventData but no ID, just use the event data directly
          if (route.params?.eventData) {
            const normalizedEvent = {
              ...route.params.eventData,
              id: route.params.eventData.Id || route.params.eventData.id,
              Id: route.params.eventData.Id || route.params.eventData.id // Ensure both id formats exist
            };
            setEventDetails(normalizedEvent);
            setCurrentValue(normalizedEvent.currentValue || 0);
            setProgress(normalizedEvent.progress || 0);
            
            // Check if event is finished
            const isFinished = new Date(normalizedEvent.end_date) < new Date();
            setIsEventFinished(isFinished);
            
            setIsLoading(false);
            return;
          }
          
          setFetchError("No event ID provided");
          setIsLoading(false);
          return;
        }
        
        // First try to get event from EventContext (all events, not just active)
        const eventId = eventIdParam.toString();
        const localEvent = getEventById ? getEventById(eventId) : 
                          [...activeEvents, ...upcomingEvents, ...pastEvents]
                            .find(e => (e.Id?.toString() === eventId || e.id?.toString() === eventId));
        
        // If found locally, use it immediately
        if (localEvent) {
          console.log("Found event in local context:", localEvent.title);
          const normalizedEvent = {
            ...localEvent,
            id: localEvent.Id || localEvent.id,
            Id: localEvent.Id || localEvent.id // Ensure both id formats exist
          };
          
          setEventDetails(normalizedEvent);
          
          // Check if event is finished
          const isFinished = new Date(localEvent.end_date) < new Date();
          setIsEventFinished(isFinished);
          
          // Set progress values
          setCurrentValue(localEvent.currentValue || 0);
          setProgress(localEvent.progress || 0);
          
          // Get userId
          const userId = await AsyncStorage.getItem('userId');
          setUserId(userId);
          
          // Fetch participants
          try {
            const eventParticipants = await fetchEventParticipants(eventId);
            setParticipants(eventParticipants);
            
            // Check if user is participating
            const userIsParticipant = eventParticipants.some(p => 
              p.userId == userId || p.user_id == userId
            );
            
            setIsParticipating(userIsParticipant);
            setIsLoading(false);
            return;
          } catch (participantsError) {
            console.error("Error loading participants:", participantsError);
            // Continue to server fetch if participant loading fails
          }
        }
        
        // If event wasn't found locally, fallback to server fetch
        try {
          const token = await AsyncStorage.getItem('userToken');
          console.log(`Fetching event from ${SERVER_CONFIG.getBaseUrl()}/events/${eventIdParam}`);
          
          const eventResponse = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/events/${eventIdParam}`, {
            withCredentials: true,
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          });
          
          if (eventResponse.data && eventResponse.data.success) {
            const event = eventResponse.data.data;
            console.log("Event fetched directly from server:", event?.title);
            
            // Normalize the event object
            const normalizedEvent = {
              ...event,
              id: event.Id || event.id,
              Id: event.Id || event.id
            };
            
            setEventDetails(normalizedEvent);
            
            // Check if event is finished
            const isFinished = new Date(event.end_date) < new Date();
            setIsEventFinished(isFinished);
            
            // Set progress values
            setCurrentValue(event.currentValue || 0);
            setProgress(event.progress || 0);
            
            // Get userId and check participation
            const userId = await AsyncStorage.getItem('userId');
            setUserId(userId);
            
            // Fetch participants directly
            const eventParticipants = await fetchEventParticipants(eventId);
            setParticipants(eventParticipants);
            
            // Check participation based on participants list
            const userIsParticipant = eventParticipants.some(p => 
              p.userId == userId || p.user_id == userId
            );
            
            setIsParticipating(userIsParticipant);
            setIsLoading(false);
          } else {
            throw new Error("Server couldn't find the event");
          }
        } catch (directFetchError) {
          console.error("Error fetching event directly:", directFetchError.message);
          setFetchError("Kunne ikke laste hendelse fra serveren");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in loadEventDetails:", error);
        setFetchError("Kunne ikke laste hendelse");
        setIsLoading(false);
      }
    };
    
    loadEventDetails();
  }, [route.params, getEventById]);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
        console.log("Loaded userId from AsyncStorage:", storedUserId);
      } catch (error) {
        console.error("Failed to load userId from AsyncStorage:", error);
      }
    };
    
    loadUserId();
  }, []);

  const handleJoinEvent = async (teamId = null) => {
    if (isEventFinished) return;
    
    // Get event ID with consistent fallbacks
    const eventIdToUse = route.params?.eventId || 
                         eventDetails?.id || 
                         eventDetails?.Id;
    
    if (!eventIdToUse) {
      console.error("No event ID available for join/leave action");
      Alert.alert("Error", "Could not determine event ID. Please try again.");
      return;
    }
    
    console.log("Using event ID for join/leave:", eventIdToUse);
    
    if (!isParticipating) {
      // Join the event
      const success = await joinEvent(eventIdToUse, teamId);
      
      if (success) {
        // Refresh participants and participation status
        const eventParticipants = await fetchEventParticipants(eventIdToUse);
        setParticipants(eventParticipants || []);
        
        const participation = await checkParticipation(eventIdToUse);
        setIsParticipating(participation.isParticipating);
        setParticipantId(participation.participantId);
        setUserTeamId(participation.teamId);
        
        Alert.alert("Success", "You have joined the event!");
      } else {
        Alert.alert("Error", "Failed to join the event. Please try again.");
      }
    } else {
      // Leave the event logic
      Alert.alert(
        "Leave Event",
        "Are you sure you want to leave this event?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Leave",
            style: "destructive",
            onPress: async () => {
              const success = await leaveEvent(eventIdToUse);
              
              if (success) {
                // Refresh participants and participation status
                const eventParticipants = await fetchEventParticipants(eventIdToUse);
                setParticipants(eventParticipants || []);
                setIsParticipating(false);
                setParticipantId(null);
                setUserTeamId(null);
                
                Alert.alert("Success", "You have left the event.");
              } else {
                Alert.alert("Error", "Failed to leave the event. Please try again.");
              }
            }
          }
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Laster hendelse...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (fetchError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Feil</Text>
          <View style={{width: 24}} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color={theme.error || "#FF6B6B"} />
          <Text style={[styles.errorText, { color: theme.text }]}>{fetchError}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.retryButtonText, { color: theme.background }]}>Gå tilbake</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!eventDetails) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Feil</Text>
          <View style={{width: 24}} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="help-circle-outline" size={64} color={theme.error || "#FF6B6B"} />
          <Text style={[styles.errorText, { color: theme.text }]}>Hendelsen ble ikke funnet</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.retryButtonText, { color: theme.background }]}>Gå tilbake</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Formater dato og tid
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {eventDetails.title || "Hendelse"}
          </Text>
          <TouchableOpacity onPress={toggleModal} style={styles.menuButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        <Image
          source={require("../../../assets/Vitus_Happy.png")}
          style={styles.eventBanner}
        />

        <View
          style={[
            styles.eventInfoContainer,
            { backgroundColor: isDarkMode ? "#333333" : "#F5F5F5" },
          ]}
        >
          <Text style={[styles.eventTitle, { color: theme.text }]}>
            {eventDetails.title}
          </Text>
          <View style={styles.eventDetails}>
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={theme.textSecondary}
            />
            <Text
              style={[styles.eventDetailText, { color: theme.textSecondary }]}
            >
              {formatDate(eventDetails.start_date)} -{" "}
              {formatDate(eventDetails.end_date)}
            </Text>
          </View>
          <View style={styles.eventDetails}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={theme.textSecondary}
            />
            <Text
              style={[styles.eventDetailText, { color: theme.textSecondary }]}
            >
              {formatTime(eventDetails.start_date)} -{" "}
              {formatTime(eventDetails.end_date)}
            </Text>
          </View>
          <View style={styles.eventDetails}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={theme.textSecondary}
            />
            <Text
              style={[styles.eventDetailText, { color: theme.textSecondary }]}
            >
              {eventDetails.location}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Din Fremgang
          </Text>
          <View
            style={[styles.progressCard, { backgroundColor: theme.surface }]}
          >
            <View style={styles.progressHeader}>
              <MaterialCommunityIcons
                name="arm-flex"
                size={24}
                color={theme.primary}
              />
              <Text style={[styles.progressTitle, { color: theme.text }]}>
                {eventDetails.title}
              </Text>
            </View>
            <Progress.Bar
              progress={progress}
              width={null}
              height={10}
              color={theme.primary}
              unfilledColor={theme.primary + "30"}
              borderWidth={0}
              borderRadius={5}
              style={styles.progressBar}
            />
            <View style={styles.progressInfo}>
              <Text
                style={[styles.progressText, { color: theme.textSecondary }]}
              >
                {currentValue} av {eventDetails.goalValue}{" "}
                {eventDetails.activityUnit}
              </Text>
              <Text
                style={[styles.progressPercentage, { color: theme.primary }]}
              >
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.primary }]}
            onPress={handleUpdateProgress}
            disabled={isEventFinished} // Deaktiver oppdatering av fremgang for ferdige hendelser
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.background}
            />
            <Text
              style={[styles.updateButtonText, { color: theme.background }]}
            >
              Oppdater fremgang
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.membersSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {eventDetails.eventType === "team"
              ? "Lag og Medlemmer"
              : "Deltakere"}
          </Text>
          {eventDetails.eventType === "team"
            ? renderTeamMembers()
            : renderIndividualParticipants()}
        </View>

        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Beskrivelse
          </Text>
          <Text
            style={[styles.descriptionText, { color: theme.textSecondary }]}
          >
            {eventDetails.description}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isEventFinished ? theme.border : theme.primary,
              }, // Grå ut knappen hvis ferdig
            ]}
            onPress={() => !isEventFinished && setShowInviteScreen(true)} // Deaktiver invitasjon
            disabled={isEventFinished}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={24}
              color={theme.background}
            />
            <Text
              style={[styles.actionButtonText, { color: theme.background }]}
            >
              Inviter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() =>
              navigation.navigate("Leaderboard", { eventId: eventDetails.id })
            }
          >
            <MaterialCommunityIcons
              name="trophy"
              size={24}
              color={theme.background}
            />
            <Text
              style={[styles.actionButtonText, { color: theme.background }]}
            >
              Resultater
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleEditEvent}
              disabled={isEventFinished} // Deaktiver redigering for ferdige hendelser
            >
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                color={isEventFinished ? theme.textSecondary : theme.text}
              />
              <Text
                style={[
                  styles.modalOptionText,
                  { color: isEventFinished ? theme.textSecondary : theme.text },
                ]}
              >
                Rediger hendelse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleDeleteEvent}
            >
              <MaterialCommunityIcons name="delete" size={24} color="#FF0000" />
              <Text style={[styles.modalOptionText, { color: "#FF0000" }]}>
                Slett hendelse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={toggleModal}
            >
              <Text
                style={[styles.modalCloseButtonText, { color: theme.primary }]}
              >
                Lukk
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showProgressModal}
        onRequestClose={() => setShowProgressModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Oppdater fremgang
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder={`Skriv inn antall ${eventDetails.activityUnit}`}
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={newProgress}
                onChangeText={setNewProgress}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={submitProgress}
              >
                <Text
                  style={[styles.submitButtonText, { color: theme.background }]}
                >
                  Oppdater
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowProgressModal(false)}
              >
                <Text
                  style={[
                    styles.modalCloseButtonText,
                    { color: theme.primary },
                  ]}
                >
                  Avbryt
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <InviteMembersScreen
        visible={showInviteScreen}
        onClose={() => setShowInviteScreen(false)}
        eventId={eventDetails.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 8,
  },
  eventBanner: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  eventInfoContainer: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 16,
    marginLeft: 8,
  },
  progressSection: {
    padding: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  progressBar: {
    marginVertical: 8,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "600",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  membersSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  membersList: {
    flexDirection: "row",
  },
  participantsContainer: {
    flex: 1,
  },
  participantsRow: {
    flexDirection: "row",
    gap: 16,
  },
  teamContainer: {
    marginRight: 0,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  teamMembers: {
    flexDirection: "row",
  },
  memberAvatar: {
    alignItems: "center",
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
  },
  emptyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionSection: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 16,
  },
  modalCloseButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ActiveEvent;
