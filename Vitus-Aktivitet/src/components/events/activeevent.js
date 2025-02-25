"use client";

import React, { useState, useContext, useEffect } from "react";
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
import { EventContext } from "../events/EventContext"; // Import EventContext

const ActiveEvent = ({ route }) => {
  const { eventId } = route.params || {};
  const { activeEvents, updateEvent, deleteEvent } = useContext(EventContext); // Use EventContext
  const eventDetails = activeEvents.find((event) => event.id === eventId); // Find the event based on eventId

  const [isModalVisible, setModalVisible] = useState(false);
  const [showInviteScreen, setShowInviteScreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState("");
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();

  // Set navigation options for smooth transitions
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

  // Toggle the options modal
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Navigate back to the YourEvents screen
  const handleBackPress = () =>
    navigation.navigate("EventsMain", { screen: "YourEvents" });

  // Navigate to the NewEvent screen to edit the event
  const handleEditEvent = () => {
    toggleModal();
    navigation.navigate("NewEvent", { eventDetails });
  };

  // Delete the event after confirmation
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
            deleteEvent(eventId); // Delete the event from the context
            navigation.navigate("EventsMain", { screen: "YourEvents" });
          },
        },
      ]
    );
  };

  // Show the progress update modal
  const handleUpdateProgress = () => {
    setShowProgressModal(true);
  };

  // Submit the updated progress value
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
    } else {
      Alert.alert(
        "Ugyldig verdi",
        "Vennligst skriv inn en gyldig verdi mellom 0 og målet."
      );
    }
  };

  // Render team members for team events
  const renderTeamMembers = () => {
    const totalTeams = eventDetails.teamCount;
    const membersPerTeam = eventDetails.membersPerTeam;
    const filledMembers = 1;

    return (
      <>
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          {filledMembers} av {totalTeams * membersPerTeam} medlemmer
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.membersList}
        >
          {Array.from({ length: totalTeams }, (_, teamIndex) => (
            <View key={teamIndex} style={styles.teamContainer}>
              <Text style={[styles.teamTitle, { color: theme.text }]}>
                Team {teamIndex + 1}
              </Text>
              <View style={styles.teamMembers}>
                {teamIndex === 0 && (
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
                      Hanne
                    </Text>
                  </View>
                )}
                {Array.from(
                  {
                    length:
                      teamIndex === 0 ? membersPerTeam - 1 : membersPerTeam,
                  },
                  (_, memberIndex) => (
                    <TouchableOpacity
                      key={memberIndex}
                      style={[
                        styles.emptyAvatar,
                        { backgroundColor: theme.primary + "30" },
                      ]}
                      onPress={() => setShowInviteScreen(true)}
                    >
                      <MaterialCommunityIcons
                        name="plus"
                        size={24}
                        color={theme.primary}
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

  // Render individual participants for individual events
  const renderIndividualParticipants = () => {
    const totalParticipants =
      Number.parseInt(eventDetails?.participantCount) || 1;
    const filledParticipants = 1;
    const emptySlots = totalParticipants - filledParticipants;

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
                  Hanne
                </Text>
              </View>
              {Array.from({ length: emptySlots }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.emptyAvatar,
                    { backgroundColor: theme.primary + "30" },
                  ]}
                  onPress={() => setShowInviteScreen(true)}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={24}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {eventDetails?.title || "Hendelse"}
          </Text>
          <TouchableOpacity onPress={toggleModal} style={styles.menuButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Event Banner */}
        <Image
          source={require("../../../assets/event-illustration.png")}
          style={styles.eventBanner}
        />

        {/* Event Info */}
        <View
          style={[
            styles.eventInfoContainer,
            { backgroundColor: isDarkMode ? "#333333" : "#F5F5F5" },
          ]}
        >
          <Text style={[styles.eventTitle, { color: theme.text }]}>
            {eventDetails?.title || "Hvem er sterkest? Push ups konkurranse"}
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
              {new Date(eventDetails?.startDate).toLocaleDateString()} •{" "}
              {new Date(eventDetails?.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
              {eventDetails?.location || "Alf bjeckes vei 28 • Oslo"}
            </Text>
          </View>
        </View>

        {/* Progress Section */}
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
                {eventDetails?.title || "Push-ups"}
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
                {currentValue} av {eventDetails?.goalValue || 100}{" "}
                {eventDetails?.activityUnit || "repetisjoner"}
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

        {/* Members Section */}
        <View style={styles.membersSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {eventDetails?.type === "team" ? "Lag og Medlemmer" : "Deltakere"}
          </Text>
          {eventDetails?.type === "team"
            ? renderTeamMembers()
            : renderIndividualParticipants()}
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Beskrivelse
          </Text>
          <Text
            style={[styles.descriptionText, { color: theme.textSecondary }]}
          >
            {eventDetails?.description ||
              "La oss se hvem som kan gjøre flest push-ups! Kom og bli med på denne morsomme konkurransen og test din styrke."}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowInviteScreen(true)}
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
              navigation.navigate("Leaderboard", { eventId: eventDetails?.id })
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

      {/* Options Modal */}
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
            >
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                color={theme.text}
              />
              <Text style={[styles.modalOptionText, { color: theme.text }]}>
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

      {/* Progress Update Modal */}
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
                placeholder={`Skriv inn antall ${
                  eventDetails?.activityUnit || "repetisjoner"
                }`}
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

      {/* Invite Members Screen */}
      <InviteMembersScreen
        visible={showInviteScreen}
        onClose={() => setShowInviteScreen(false)}
        eventId={eventDetails?.id || "123"}
      />
    </SafeAreaView>
  );
};

// Styles
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
    resizeMode: "cover",
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
    flexWrap: "wrap",
  },
  teamContainer: {
    marginRight: 16,
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
    marginRight: 16,
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
    marginRight: 16,
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