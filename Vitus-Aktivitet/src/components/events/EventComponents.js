"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { useTheme } from "../context/ThemeContext"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as Progress from "react-native-progress"

// Predefined activities
const PREDEFINED_ACTIVITIES = [
  {
    id: 1,
    name: "Planke",
    type: "duration",
    icon: "human",
    description: "Hold plankestilling så lenge som mulig",
    defaultGoal: 60,
    unit: "sekunder",
  },
  {
    id: 2,
    name: "Push-ups",
    type: "count",
    icon: "arm-flex",
    description: "Gjør så mange push-ups som mulig",
    defaultGoal: 50,
    unit: "repetisjoner",
  },
  {
    id: 3,
    name: "Løping",
    type: "distance",
    icon: "run",
    description: "Løp den angitte distansen",
    defaultGoal: 5,
    unit: "kilometer",
  },
]

const EventComponent = ({ route, navigation }) => {
  const { eventDetails, isNewEvent } = route.params || {}
  const { theme, isDarkMode } = useTheme()
  const [isModalVisible, setModalVisible] = useState(false)
  const [showInviteScreen, setShowInviteScreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentValue, setCurrentValue] = useState(0)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [newProgress, setNewProgress] = useState("")

  // New Event state
  const [title, setTitle] = useState(eventDetails?.title || "")
  const [description, setDescription] = useState(eventDetails?.description || "")
  const [goalValue, setGoalValue] = useState(eventDetails?.goalValue || 50)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [startDate, setStartDate] = useState(eventDetails?.startDate || new Date())
  const [endDate, setEndDate] = useState(eventDetails?.endDate || new Date())
  const [showStartDate, setShowStartDate] = useState(false)
  const [showEndDate, setShowEndDate] = useState(false)
  const [location, setLocation] = useState(eventDetails?.location || "")
  const [eventType, setEventType] = useState(eventDetails?.type || null)
  const [participantCount, setParticipantCount] = useState(eventDetails?.participantCount?.toString() || "")

  useEffect(() => {
    navigation.setOptions({
      title: isNewEvent ? "Ny hendelse" : eventDetails?.title || "Hendelse",
    })
  }, [navigation, isNewEvent, eventDetails])

  const toggleModal = () => setModalVisible(!isModalVisible)

  const handleBackPress = () => navigation.goBack()

  const handleEditEvent = () => {
    toggleModal()
    // Implement edit logic here
  }

  const handleDeleteEvent = () => {
    Alert.alert("Slett hendelse", "Er du sikker på at du vil slette denne hendelsen?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: () => {
          // TODO: Implement delete logic here
          console.log("Deleting event:", eventDetails?.id)
          navigation.navigate("EventsMain", { screen: "YourEvents" })
        },
      },
    ])
  }

  const handleUpdateProgress = () => {
    setShowProgressModal(true)
  }

  const submitProgress = () => {
    const newValue = Number.parseInt(newProgress, 10)
    if (!isNaN(newValue) && newValue >= 0 && newValue <= eventDetails.goalValue) {
      setCurrentValue(newValue)
      setProgress(newValue / eventDetails.goalValue)
      setShowProgressModal(false)
      setNewProgress("")
    } else {
      Alert.alert("Ugyldig verdi", "Vennligst skriv inn en gyldig verdi mellom 0 og målet.")
    }
  }

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity)
    setTitle(activity.name)
    setDescription(activity.description)
    setGoalValue(activity.defaultGoal)
    setShowActivityModal(false)
  }

  const handleConfirm = () => {
    const eventData = {
      type: eventType,
      title,
      description,
      startDate,
      endDate,
      goalValue,
      activityType: selectedActivity?.type,
      activityUnit: selectedActivity?.unit,
      location,
      participantCount: eventType === "team" ? Number.parseInt(participantCount, 10) : 1,
      status: "active",
      participants: [],
      results: {},
    }

    console.log("Creating/Updating event:", eventData)
    navigation.navigate("ActiveEvent", { eventData })
  }

  const renderNewEventForm = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <Image
        source={require("../../../assets/vitusaktivitet_v2_sq.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Velg hendelsestype</Text>
        <View style={styles.eventTypeButtons}>
          <TouchableOpacity
            style={[
              styles.eventTypeButton,
              { borderColor: theme.border },
              eventType === "team" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setEventType("team")}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={eventType === "team" ? theme.background : theme.text}
            />
            <Text style={[styles.eventTypeButtonText, { color: eventType === "team" ? theme.background : theme.text }]}>
              Team hendelse
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.eventTypeButton,
              { borderColor: theme.border },
              eventType === "individual" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setEventType("individual")}
          >
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={eventType === "individual" ? theme.background : theme.text}
            />
            <Text
              style={[
                styles.eventTypeButtonText,
                { color: eventType === "individual" ? theme.background : theme.text },
              ]}
            >
              Individuell hendelse
            </Text>
          </TouchableOpacity>
        </View>

        {eventType && (
          <>
            <Text style={[styles.label, { color: theme.text, marginTop: 24 }]}>Velg Aktivitet</Text>
            <TouchableOpacity
              style={[
                styles.activitySelector,
                { backgroundColor: isDarkMode ? "#2A2A2A" : theme.surface, borderColor: theme.border },
              ]}
              onPress={() => setShowActivityModal(true)}
            >
              <Text style={[styles.activitySelectorText, { color: theme.text }]}>
                {selectedActivity ? selectedActivity.name : "Velg en aktivitet"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.label, { color: theme.text }]}>Hendelsesnavn</Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: isDarkMode ? "#2A2A2A" : theme.surface, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Skriv inn hendelsesnavn"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Beskrivelse</Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: isDarkMode ? "#2A2A2A" : theme.surface, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Skriv inn beskrivelse"
                placeholderTextColor={theme.textSecondary}
                multiline
              />
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              Mål {selectedActivity ? `(${selectedActivity.unit})` : ""}
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={goalValue}
                onValueChange={(value) => setGoalValue(value)}
                minimumValue={0}
                maximumValue={selectedActivity?.type === "duration" ? 300 : 100}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primary}
              />
              <Text style={[styles.goalValueText, { color: theme.text }]}>
                {selectedActivity?.type === "duration"
                  ? `${Math.floor(goalValue / 60)} min ${Math.floor(goalValue % 60)} sek`
                  : `${Math.round(goalValue)} ${selectedActivity?.unit || "enheter"}`}
              </Text>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Lokasjon</Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: isDarkMode ? "#2A2A2A" : theme.surface, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="Skriv inn lokasjon"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.dateTimeSection}>
              <Text style={[styles.label, { color: theme.text }]}>Start dato</Text>
              <TouchableOpacity
                style={[styles.dateTimeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setShowStartDate(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>{startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>Slutt dato</Text>
              <TouchableOpacity
                style={[styles.dateTimeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setShowEndDate(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
                <Text style={[styles.dateTimeText, { color: theme.text }]}>{endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            {eventType === "team" && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>Antall deltakere</Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: isDarkMode ? "#2A2A2A" : theme.surface, borderColor: theme.border },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={participantCount}
                    onChangeText={setParticipantCount}
                    placeholder="Skriv inn antall deltakere"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  )

  const renderActiveEvent = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <Image source={require("../../../assets/event-illustration.png")} style={styles.eventBanner} />

      <View style={[styles.eventInfoContainer, { backgroundColor: isDarkMode ? "#333333" : "#F5F5F5" }]}>
        <Text style={[styles.eventTitle, { color: theme.text }]}>{eventDetails?.title}</Text>
        <View style={styles.eventDetails}>
          <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
          <Text style={[styles.eventDetailText, { color: theme.textSecondary }]}>
            {eventDetails?.startDate?.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.eventDetails}>
          <MaterialCommunityIcons name="map-marker" size={20} color={theme.textSecondary} />
          <Text style={[styles.eventDetailText, { color: theme.textSecondary }]}>{eventDetails?.location}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Din Fremgang</Text>
        <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
          <View style={styles.progressHeader}>
            <MaterialCommunityIcons name="arm-flex" size={24} color={theme.primary} />
            <Text style={[styles.progressTitle, { color: theme.text }]}>{eventDetails?.title}</Text>
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
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {currentValue} av {eventDetails?.goalValue} {eventDetails?.activityUnit}
            </Text>
            <Text style={[styles.progressPercentage, { color: theme.primary }]}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: theme.primary }]}
          onPress={handleUpdateProgress}
        >
          <MaterialCommunityIcons name="plus" size={24} color={theme.background} />
          <Text style={[styles.updateButtonText, { color: theme.background }]}>Oppdater fremgang</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.membersSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {eventDetails?.type === "team" ? "Medlemmer" : "Deltakere"}
        </Text>
        <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
          {eventDetails?.type === "team" ? "1 av 4 medlemmer" : "1 av 50 deltakere"}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersList}>
          <View style={styles.memberAvatar}>
            <Image source={require("../../../assets/member-avatar.png")} style={styles.avatarImage} />
            <Text style={[styles.memberName, { color: theme.textSecondary }]}>Hanne</Text>
          </View>
          {Array.from({ length: eventDetails?.type === "team" ? 3 : 49 }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.emptyAvatar, { backgroundColor: theme.primary + "30" }]}
              onPress={() => setShowInviteScreen(true)}
            >
              <MaterialCommunityIcons name="plus" size={24} color={theme.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.descriptionSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Beskrivelse</Text>
        <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{eventDetails?.description}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowInviteScreen(true)}
        >
          <MaterialCommunityIcons name="account-plus" size={24} color={theme.background} />
          <Text style={[styles.actionButtonText, { color: theme.background }]}>Inviter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Leaderboard", { eventId: eventDetails?.id })}
        >
          <MaterialCommunityIcons name="trophy" size={24} color={theme.background} />
          <Text style={[styles.actionButtonText, { color: theme.background }]}>Resultater</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {isNewEvent ? renderNewEventForm() : renderActiveEvent()}

      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.modalOption} onPress={handleEditEvent}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.text} />
              <Text style={[styles.modalOptionText, { color: theme.text }]}>Rediger hendelse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleDeleteEvent}>
              <MaterialCommunityIcons name="delete" size={24} color="#FF0000" />
              <Text style={[styles.modalOptionText, { color: "#FF0000" }]}>Slett hendelse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
              <Text style={[styles.modalCloseButtonText, { color: theme.primary }]}>Lukk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showProgressModal}
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Oppdater fremgang</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder={`Skriv inn antall ${eventDetails?.activityUnit}`}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={newProgress}
              onChangeText={setNewProgress}
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={submitProgress}
            >
              <Text style={[styles.submitButtonText, { color: theme.background }]}>Oppdater</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProgressModal(false)}>
              <Text style={[styles.modalCloseButtonText, { color: theme.primary }]}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showActivityModal} animationType="slide" transparent={true}>
        <View style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Velg Aktivitet</Text>
            {PREDEFINED_ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[styles.activityOption, { borderBottomColor: theme.border }]}
                onPress={() => handleActivitySelect(activity)}
              >
                <MaterialCommunityIcons name={activity.icon} size={24} color={theme.primary} />
                <View style={styles.activityOptionText}>
                  <Text style={[styles.activityName, { color: theme.text }]}>{activity.name}</Text>
                  <Text style={[styles.activityDescription, { color: theme.textSecondary }]}>
                    {activity.description}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.text} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: theme.surface }]}
              onPress={() => setShowActivityModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: theme.text }]}>Lukk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {(showStartDate || showEndDate) && (
        <DateTimePicker
          value={showStartDate ? startDate : endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (showStartDate) {
              setShowStartDate(false)
              setStartDate(selectedDate || startDate)
            } else {
              setShowEndDate(false)
              setEndDate(selectedDate || endDate)
            }
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  backgroundImage: {
    width: "90%",
    height: 240,
    marginTop: -20,
    alignSelf: "center",
  },
  formContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
    height: 56,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
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
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  eventTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  eventTypeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  eventTypeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  activitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    height: 56,
  },
  activitySelectorText: {
    fontSize: 16,
  },
  activityOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  activityOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "500",
  },
  activityDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  dateTimeInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  goalValueText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
  },
})

export default EventComponent

