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

const ActiveEvent = ({ route }) => {
  const { eventId } = route.params || {};
  const { activeEvents, pastEvents, updateEvent, deleteEvent } =
    useContext(EventContext); // Hent både activeEvents og pastEvents
  // Finn hendelsen fra enten activeEvents eller pastEvents
  const eventDetails =
    activeEvents.find((event) => event.id === eventId) ||
    pastEvents.find((event) => event.id === eventId);

  const [isModalVisible, setModalVisible] = useState(false);
  const [showInviteScreen, setShowInviteScreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState("");
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();

  // Sjekk om hendelsen er ferdig
  const isEventFinished =
    eventDetails && new Date(eventDetails.end_date) < new Date();

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
    if (!eventDetails.participants || eventDetails.participants.length === 0) {
      return (
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          Ingen deltakere tilgjengelig
        </Text>
      );
    }

    const filledParticipants = 1;
    const totalParticipants = eventDetails.participantCount || 0;
    const emptySlots = Math.max(0, totalParticipants - filledParticipants);

    return (
      <>
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          {filledParticipants} av {totalParticipants} deltakere
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.membersList}
        >
          <View style={styles.participantsContainer}>
            <View style={styles.participantsRow}>
              <View style={styles.memberAvatar}>
                <Image
                  source={require("../../../assets/member-avatar.png")}
                  style={styles.avatarImage}
                />
                <Text
                  style={[styles.memberName, { color: theme.textSecondary }]}
                >
                  {eventDetails.participants[0]?.name || "Du"}
                </Text>
              </View>
              {Array.from({ length: emptySlots }, (_, i) => (
                <TouchableOpacity
                  key={`empty_${i}`}
                  style={[
                    styles.emptyAvatar,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => !isEventFinished && setShowInviteScreen(true)} // Deaktiver invitasjon
                  disabled={isEventFinished}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={24}
                    color={isDarkMode ? theme.surface : theme.background}
                  />
                </TouchableOpacity>
              ))}
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

  if (!eventDetails) {
    return null;
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
});

export default ActiveEvent;
