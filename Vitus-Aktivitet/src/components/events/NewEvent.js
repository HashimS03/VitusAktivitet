"use client"

import { useState } from "react"
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
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { useTheme } from "../context/ThemeContext"
import DateTimePicker from "@react-native-community/datetimepicker"

// Predefinerte aktiviteter
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

const NewEvent = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalValue, setGoalValue] = useState(50)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [showStartDate, setShowStartDate] = useState(false)
  const [showEndDate, setShowEndDate] = useState(false)
  const [showStartTime, setShowStartTime] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [location, setLocation] = useState("")
  const [time, setTime] = useState(null)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [eventType, setEventType] = useState(null)
  const [participantCount, setParticipantCount] = useState("")
  const [showStartPicker, setShowStartPicker] = useState(false) // Added
  const [showEndPicker, setShowEndPicker] = useState(false) // Added

  // Funksjon for å håndtere dato-valg
  const handleDateChange = (event, selectedDate, type) => {
    if (type === "start") {
      setShowStartPicker(false)
      if (selectedDate) setStartDate(selectedDate)
    } else {
      setShowEndPicker(false)
      if (selectedDate) setEndDate(selectedDate)
    }
  }

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDate(false)
    if (selectedDate) {
      setStartDate(selectedDate)
    }
  }

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDate(false)
    if (selectedDate) {
      setEndDate(selectedDate)
    }
  }

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTime(false)
    if (selectedTime) {
      setStartTime(selectedTime)
    }
  }

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTime(false)
    if (selectedTime) {
      setEndTime(selectedTime)
    }
  }

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity)
    setTitle(activity.name)
    setDescription(activity.description)
    setGoalValue(activity.defaultGoal)
    setShowActivityModal(false)
    setShowWarning(false) // Fjerner advarselen når en aktivitet velges
  }

  const handleConfirm = () => {
    const eventData = {
      type: eventType,
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      goalValue,
      activityType: selectedActivity?.type,
      activityUnit: selectedActivity?.unit,
      location,
      participantCount: eventType === "team" ? Number.parseInt(participantCount, 10) : 1,
      status: "active",
      participants: [],
      results: {},
    }

    console.log("Creating event:", eventData)
    if (eventType === "individual") {
      navigation.navigate("ActiveSoloEvent", { eventData })
    } else {
      navigation.navigate("ActiveEvent", { eventData })
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.headerContainer, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ny hendelse</Text>
        </View>

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
              <Text
                style={[styles.eventTypeButtonText, { color: eventType === "team" ? theme.background : theme.text }]}
              >
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
                <Text style={[styles.label, { color: theme.text }]}>Start dato og tid</Text>
                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity
                    style={[styles.dateTimeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => setShowStartDate(true)}
                  >
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.text }]}>{startDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dateTimeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => setShowStartTime(true)}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.text }]}>
                      {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, { color: theme.text }]}>Slutt dato og tid</Text>
                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity
                    style={[styles.dateTimeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => setShowEndDate(true)}
                  >
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.text }]}>{endDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dateTimeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => setShowEndTime(true)}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.dateTimeText, { color: theme.text }]}>
                      {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </TouchableOpacity>
                </View>
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

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: isDarkMode ? "#2A2A2A" : "#FFF2F2" }]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={[styles.buttonText, { color: "#FF0000" }]}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: theme.primary }]}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Opprett hendelse</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Activity Selection Modal - NEW */}
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
        </View>
      </ScrollView>
      <Modal visible={showStartDate || showStartTime || showEndDate || showEndTime} transparent animationType="fade">
        <View style={styles.dateTimePickerModal}>
          <View style={[styles.dateTimePickerContainer, { backgroundColor: theme.surface }]}>
            {showStartDate && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="inline"
                onChange={onStartDateChange}
                textColor={theme.text}
              />
            )}
            {showStartTime && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={onStartTimeChange}
                textColor={theme.text}
              />
            )}
            {showEndDate && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="inline"
                onChange={onEndDateChange}
                textColor={theme.text}
              />
            )}
            {showEndTime && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={onEndTimeChange}
                textColor={theme.text}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  timeContainer: {
    marginBottom: 24,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
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
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  dateContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  dateInput: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
    paddingHorizontal: 20,
    paddingBottom: 34,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  cancelButton: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmButton: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: "#FF0000",
  },
  confirmText: {
    color: "#FFFFFF",
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
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
  modalCloseButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "500",
  },
  goalValueText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
  },
  warningText: {
    color: "red",
    fontWeight: "bold",
  },
  eventTypeContainer: {
    marginBottom: 32,
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
  dateTimeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 32,
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  dateTimePickerModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dateTimePickerContainer: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
})

export default NewEvent

