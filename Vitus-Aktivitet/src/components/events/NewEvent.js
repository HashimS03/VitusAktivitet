"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ScrollView,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { useTheme } from "../context/ThemeContext"
import DateTimePicker from "@react-native-community/datetimepicker"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { BlurView } from "expo-blur"

const { width } = Dimensions.get("window")

const PREDEFINED_ACTIVITIES = [
  {
    id: 1,
    name: "Planke",
    type: "duration",
    icon: "human",
    description: "Hold plankestilling så lenge som mulig",
    defaultGoal: 60,
    unit: "sekunder",
    color: "#FF6B6B",
  },
  {
    id: 2,
    name: "Push-ups",
    type: "count",
    icon: "arm-flex",
    description: "Gjør så mange push-ups som mulig",
    defaultGoal: 50,
    unit: "repetisjoner",
    color: "#4ECDC4",
  },
  {
    id: 3,
    name: "Løping",
    type: "distance",
    icon: "run",
    description: "Løp den angitte distansen",
    defaultGoal: 5,
    unit: "kilometer",
    color: "#45B7D1",
  },
  {
    id: 4,
    name: "Sykling",
    type: "distance",
    icon: "bike",
    description: "Sykle den angitte distansen",
    defaultGoal: 20,
    unit: "kilometer",
    color: "#FF8C42",
  },
  {
    id: 5,
    name: "Svømming",
    type: "distance",
    icon: "swim",
    description: "Svøm den angitte distansen",
    defaultGoal: 1,
    unit: "kilometer",
    color: "#98DFEA",
  },
  {
    id: 6,
    name: "Yoga",
    type: "duration",
    icon: "yoga",
    description: "Utfør yoga i angitt tid",
    defaultGoal: 30,
    unit: "minutter",
    color: "#7B506F",
  },
  {
    id: 7,
    name: "Vektløfting",
    type: "count",
    icon: "weight-lifter",
    description: "Løft vekter med angitt antall repetisjoner",
    defaultGoal: 100,
    unit: "repetisjoner",
    color: "#1B9AAA",
  },
]

const NewEvent = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme()
  const [eventDetails, setEventDetails] = useState({
    title: "",
    description: "",
    goalValue: 50,
    selectedActivity: null,
    startDate: new Date(),
    endDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    location: "",
    eventType: null,
    participantCount: "",
    teamCount: "",
    membersPerTeam: "",
    isPublic: false,
    tags: [],
  })
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState("date")
  const [currentDateSetting, setCurrentDateSetting] = useState(null)
  const [formProgress, setFormProgress] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [tagInput, setTagInput] = useState("")

  const scrollViewRef = useRef(null)
  const progressAnimation = useRef(new Animated.Value(0)).current
  const stepAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: formProgress,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start()
  }, [formProgress, progressAnimation])

  useEffect(() => {
    Animated.timing(stepAnimation, {
      toValue: currentStep,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [currentStep, stepAnimation])

  const updateEventDetails = (key, value) => {
    setEventDetails((prev) => {
      const updated = { ...prev, [key]: value }
      const filledFields = Object.values(updated).filter((v) => v !== "" && v !== null).length
      const progress = filledFields / Object.keys(updated).length
      setFormProgress(progress)
      return updated
    })
  }

  const handleActivitySelect = (activity) => {
    updateEventDetails("selectedActivity", activity)
    updateEventDetails("title", activity.name)
    updateEventDetails("goalValue", activity.defaultGoal)
    setShowActivityModal(false)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      updateEventDetails(currentDateSetting, selectedDate)
    }
  }

  const showDateTimePicker = (mode, setting) => {
    setShowDatePicker(true)
    setDatePickerMode(mode)
    setCurrentDateSetting(setting)
  }

  const validateForm = () => {
    const requiredFields = ["title", "selectedActivity", "startDate", "endDate", "location", "eventType"]
    const missingFields = requiredFields.filter((field) => !eventDetails[field])

    if (missingFields.length > 0) {
      Alert.alert("Manglende informasjon", `Vennligst fyll ut følgende felt: ${missingFields.join(", ")}`)
      return false
    }

    if (eventDetails.startDate > eventDetails.endDate) {
      Alert.alert("Ugyldig datoer", "Sluttdato må være etter startdato")
      return false
    }

    return true
  }

  const handleConfirm = () => {
    if (validateForm()) {
      setShowConfirmModal(true)
    }
  }

  const createEvent = () => {
    setShowConfirmModal(false) // Add this line to close the modal
    console.log("Creating event:", eventDetails)
    navigation.navigate("ActiveEvent", { eventDetails })
  }

  const renderInput = (label, value, onChangeText, placeholder, multiline = false) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.surface, color: theme.text },
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
      />
    </View>
  )

  const renderDateTimePicker = (label, date, onPress) => (
    <TouchableOpacity style={styles.dateTimeButton} onPress={onPress}>
      <Text style={[styles.dateTimeLabel, { color: theme.text }]}>{label}</Text>
      <View style={[styles.dateTimeValue, { backgroundColor: theme.surface }]}>
        <Text style={[styles.dateTimeText, { color: theme.text }]}>{date.toLocaleString()}</Text>
        <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.primary} />
      </View>
    </TouchableOpacity>
  )

  const renderStep = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Velg aktivitetstype</Text>
            <View style={styles.activityGrid}>
              {PREDEFINED_ACTIVITIES.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor:
                        eventDetails.selectedActivity?.id === activity.id ? activity.color : theme.surface,
                    },
                  ]}
                  onPress={() => handleActivitySelect(activity)}
                >
                  <MaterialCommunityIcons
                    name={activity.icon}
                    size={32}
                    color={eventDetails.selectedActivity?.id === activity.id ? "#FFFFFF" : activity.color}
                  />
                  <Text
                    style={[
                      styles.activityItemText,
                      { color: eventDetails.selectedActivity?.id === activity.id ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {activity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Hendelsesdetaljer</Text>
            {renderInput(
              "Hendelsesnavn",
              eventDetails.title,
              (text) => updateEventDetails("title", text),
              "Skriv inn hendelsesnavn",
            )}
            {renderInput(
              "Beskrivelse",
              eventDetails.description,
              (text) => updateEventDetails("description", text),
              "Skriv inn beskrivelse",
              true,
            )}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                Mål {eventDetails.selectedActivity ? `(${eventDetails.selectedActivity.unit})` : ""}
              </Text>
              <Slider
                style={styles.slider}
                value={eventDetails.goalValue}
                onValueChange={(value) => updateEventDetails("goalValue", value)}
                minimumValue={0}
                maximumValue={eventDetails.selectedActivity?.type === "duration" ? 300 : 100}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primary}
              />
              <Text style={[styles.goalValueText, { color: theme.text }]}>
                {eventDetails.selectedActivity?.type === "duration"
                  ? `${Math.floor(eventDetails.goalValue / 60)} min ${Math.floor(eventDetails.goalValue % 60)} sek`
                  : `${Math.round(eventDetails.goalValue)} ${eventDetails.selectedActivity?.unit || "enheter"}`}
              </Text>
            </View>
          </View>
        )
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Tid og sted</Text>
            {renderInput(
              "Lokasjon",
              eventDetails.location,
              (text) => updateEventDetails("location", text),
              "Skriv inn lokasjon",
            )}
            {renderDateTimePicker("Startdato", eventDetails.startDate, () => showDateTimePicker("date", "startDate"))}
            {renderDateTimePicker("Sluttdato", eventDetails.endDate, () => showDateTimePicker("date", "endDate"))}
          </View>
        )
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Deltakere</Text>
            <View style={styles.eventTypeButtons}>
              {["team", "individual"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.eventTypeButton,
                    { borderColor: theme.border },
                    eventDetails.eventType === type && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => updateEventDetails("eventType", type)}
                >
                  <MaterialCommunityIcons
                    name={type === "team" ? "account-group" : "account"}
                    size={24}
                    color={eventDetails.eventType === type ? theme.background : theme.text}
                  />
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      { color: eventDetails.eventType === type ? theme.background : theme.text },
                    ]}
                  >
                    {type === "team" ? "Lagkonkurranse" : "Individuell"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderInput(
              "Antall deltakere",
              eventDetails.participantCount,
              (text) => updateEventDetails("participantCount", text),
              "Skriv inn antall deltakere",
            )}
            {eventDetails.eventType === "team" && (
              <>
                {renderInput(
                  "Antall lag",
                  eventDetails.teamCount,
                  (text) => updateEventDetails("teamCount", text),
                  "Skriv inn antall lag",
                )}
                {renderInput(
                  "Medlemmer per lag",
                  eventDetails.membersPerTeam,
                  (text) => updateEventDetails("membersPerTeam", text),
                  "Skriv inn antall medlemmer per lag",
                )}
              </>
            )}
          </View>
        )
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Tilleggsinnstillinger</Text>
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { color: theme.text }]}>Offentlig hendelse</Text>
              <Switch
                value={eventDetails.isPublic}
                onValueChange={(value) => updateEventDetails("isPublic", value)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={eventDetails.isPublic ? theme.background : theme.surface}
              />
            </View>
            <View style={styles.tagsContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Tagger</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[styles.tagInput, { backgroundColor: theme.surface, color: theme.text }]}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Legg til tagger"
                  placeholderTextColor={theme.textSecondary}
                />
                <TouchableOpacity
                  style={[styles.addTagButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    if (tagInput.trim()) {
                      updateEventDetails("tags", [...eventDetails.tags, tagInput.trim()])
                      setTagInput("")
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagList}>
                {eventDetails.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.tagText, { color: "#FFFFFF" }]}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        updateEventDetails(
                          "tags",
                          eventDetails.tags.filter((_, i) => i !== index),
                        )
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <LinearGradient
          colors={[theme.primary, theme.background]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ny hendelse</Text>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </LinearGradient>

        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: stepAnimation } } }], {
            useNativeDriver: true,
          })}
        >
          {[0, 1, 2, 3, 4].map((step) => (
            <View key={step} style={[styles.stepWrapper, { width }]}>
              <ScrollView contentContainerStyle={styles.stepScrollContent}>{renderStep(step)}</ScrollView>
            </View>
          ))}
        </Animated.ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              { backgroundColor: theme.primary },
              currentStep === 0 && styles.footerButtonDisabled,
            ]}
            onPress={() => {
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1)
                scrollViewRef.current?.scrollTo({ x: (currentStep - 1) * width, animated: true })
              }
            }}
            disabled={currentStep === 0}
          >
            <Text style={[styles.footerButtonText, { color: theme.background }]}>Forrige</Text>
          </TouchableOpacity>
          {currentStep < 4 ? (
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (currentStep < 4) {
                  setCurrentStep(currentStep + 1)
                  scrollViewRef.current?.scrollTo({ x: (currentStep + 1) * width, animated: true })
                }
              }}
            >
              <Text style={[styles.footerButtonText, { color: theme.background }]}>Neste</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.primary }]} onPress={handleConfirm}>
              <Text style={[styles.footerButtonText, { color: theme.background }]}>Opprett hendelse</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showConfirmModal} animationType="fade" transparent={true}>
        <BlurView intensity={100} style={styles.modalContainer}>
          <View style={[styles.confirmModalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.confirmModalTitle, { color: theme.text }]}>Bekreft hendelse</Text>
            <Text style={[styles.confirmModalText, { color: theme.textSecondary }]}>
              Er du sikker på at du vil opprette denne hendelsen?
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.cancelButton, { backgroundColor: theme.surface }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={[styles.confirmModalButtonText, { color: theme.text }]}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmModalButton,
                  { backgroundColor: theme.primary }, // Changed from styles.confirmButton
                ]}
                onPress={createEvent}
              >
                <Text style={[styles.confirmModalButtonText, { color: theme.background }]}>Bekreft</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={eventDetails[currentDateSetting]}
          mode={datePickerMode}
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 100,
    justifyContent: "flex-end",
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepWrapper: {
    flex: 1,
  },
  stepScrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  activityItemText: {
    marginTop: 8,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  goalValueText: {
    textAlign: "center",
    marginTop: 8,
  },
  dateTimeButton: {
    marginBottom: 16,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  dateTimeValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  dateTimeText: {
    fontSize: 16,
  },
  eventTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  eventTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  eventTypeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tagList: {
    flexGrow: 0,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    marginRight: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  footerButtonDisabled: {
    opacity: 0.5,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModalContent: {
    width: "80%",
    borderRadius: 16,
    padding: 20,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  confirmModalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  confirmModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})

export default NewEvent

