"use client";

import { useState, useEffect, useRef, useContext } from "react";
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { EventContext } from "../events/EventContext";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

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
];

const NewEvent = ({ route }) => {
  const { theme, isDarkMode } = useTheme();
  const { addEvent, updateEvent } = useContext(EventContext);
  const { eventDetails: existingEvent, isEditing } = route.params || {};
  const navigation = useNavigation();

  const [eventDetails, setEventDetails] = useState(
    existingEvent
      ? {
          ...existingEvent,
          startDate: new Date(existingEvent.start_date),
          endDate: new Date(existingEvent.end_date),
          startTime: new Date(existingEvent.start_date),
          endTime: new Date(existingEvent.end_date),
          goalMinutes: Math.floor(existingEvent.goalValue / 60),
          goalSeconds: existingEvent.goalValue % 60,
        }
      : {
          //id: Math.random().toString(),
          title: "",
          description: "",
          goalValue: 50,
          currentValue: 0,
          goalMinutes: 0,
          goalSeconds: 0,
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
          participants: [],
          teams: [],
        }
  );

  const [dateTimePickerConfig, setDateTimePickerConfig] = useState({
    visible: false,
    mode: "date",
    currentField: "",
    currentValue: new Date(),
    selectedValue: null,
  });

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const scrollViewRef = useRef(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const stepAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });

    return () => {
      navigation.setOptions({
        gestureEnabled: true,
      });
    };
  }, [navigation]);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: formProgress,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [formProgress, progressAnimation]);

  useEffect(() => {
    Animated.timing(stepAnimation, {
      toValue: currentStep,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [currentStep, stepAnimation]);

  const updateEventDetails = (key, value) => {
    setEventDetails((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "goalMinutes" || key === "goalSeconds") {
        const totalSeconds =
          Number(updated.goalMinutes || 0) * 60 +
          Number(updated.goalSeconds || 0);
        updated.goalValue = totalSeconds;
      }
      const filledFields = Object.values(updated).filter(
        (v) => v !== "" && v !== null
      ).length;
      const progress = filledFields / Object.keys(updated).length;
      setFormProgress(progress);
      return updated;
    });
  };

  const handleActivitySelect = (activity) => {
    updateEventDetails("selectedActivity", activity);
    if (!isEditing) {
      updateEventDetails("title", activity.name);
      const totalSeconds = activity.defaultGoal;
      updateEventDetails("goalMinutes", Math.floor(totalSeconds / 60));
      updateEventDetails("goalSeconds", totalSeconds % 60);
      updateEventDetails("goalValue", totalSeconds);
    }
    setShowActivityModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDateTimeChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setDateTimePickerConfig((prev) => ({ ...prev, visible: false }));
      if (event.type === "set" && selectedDate) {
        const currentField = dateTimePickerConfig.currentField;
        const currentDate = eventDetails[currentField] || new Date();

        const updatedDate = new Date(selectedDate);
        if (dateTimePickerConfig.mode === "date") {
          updatedDate.setHours(currentDate.getHours());
          updatedDate.setMinutes(currentDate.getMinutes());
        } else {
          updatedDate.setFullYear(currentDate.getFullYear());
          updatedDate.setMonth(currentDate.getMonth());
          updatedDate.setDate(currentDate.getDate());
        }

        updateEventDetails(currentField, updatedDate);

        if (dateTimePickerConfig.mode === "time") {
          const timeField =
            currentField === "startDate" ? "startTime" : "endTime";
          updateEventDetails(timeField, updatedDate);
        }
      }
    } else if (Platform.OS === "ios" && selectedDate) {
      setDateTimePickerConfig((prev) => ({
        ...prev,
        selectedValue: selectedDate,
      }));
    }
  };

  const confirmDateTime = () => {
    if (dateTimePickerConfig.selectedValue) {
      const currentField = dateTimePickerConfig.currentField;
      const currentDate = eventDetails[currentField] || new Date();

      const updatedDate = new Date(dateTimePickerConfig.selectedValue);
      if (dateTimePickerConfig.mode === "date") {
        updatedDate.setHours(currentDate.getHours());
        updatedDate.setMinutes(currentDate.getMinutes());
      } else {
        updatedDate.setFullYear(currentDate.getFullYear());
        updatedDate.setMonth(currentDate.getMonth());
        updatedDate.setDate(currentDate.getDate());
      }

      updateEventDetails(currentField, updatedDate);

      if (dateTimePickerConfig.mode === "time") {
        const timeField =
          currentField === "startDate" ? "startTime" : "endTime";
        updateEventDetails(timeField, updatedDate);
      }
    }
    closeDateTimePicker();
  };

  const showDateTimePicker = (mode, field) => {
    setDateTimePickerConfig({
      visible: true,
      mode,
      currentField: field,
      currentValue: eventDetails[field] || new Date(),
      selectedValue: null,
    });
  };

  const closeDateTimePicker = () => {
    setDateTimePickerConfig((prev) => ({
      ...prev,
      visible: false,
      selectedValue: null,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "selectedActivity",
      "startDate",
      "endDate",
      "location",
      "eventType",
    ];
    const missingFields = requiredFields.filter(
      (field) => !eventDetails[field]
    );

    if (missingFields.length > 0) {
      Alert.alert(
        "Manglende informasjon",
        `Vennligst fyll ut følgende felt: ${missingFields.join(", ")}`
      );
      return false;
    }

    if (eventDetails.startDate > eventDetails.endDate) {
      Alert.alert("Ugyldig datoer", "Sluttdato må være etter startdato");
      return false;
    }

    const startDateTime = new Date(eventDetails.startDate);
    startDateTime.setHours(eventDetails.startTime.getHours());
    startDateTime.setMinutes(eventDetails.startTime.getMinutes());

    const endDateTime = new Date(eventDetails.endDate);
    endDateTime.setHours(eventDetails.endTime.getHours());
    endDateTime.setMinutes(eventDetails.endTime.getMinutes());

    if (startDateTime.getTime() === endDateTime.getTime()) {
      Alert.alert(
        "Identiske tider",
        "Er du sikker? Start- og sluttid er identiske.",
        [
          { text: "Avbryt", style: "cancel" },
          {
            text: "Fortsett likevel",
            onPress: () => setShowConfirmModal(true),
          },
        ]
      );
      return false;
    }

    return true;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const createEvent = async () => {
    setShowConfirmModal(false);

    const startDateTime = new Date(eventDetails.startDate);
    startDateTime.setHours(eventDetails.startTime.getHours());
    startDateTime.setMinutes(eventDetails.startTime.getMinutes());
    const startDateTimeUTC = startDateTime.toISOString();

    const endDateTime = new Date(eventDetails.endDate);
    endDateTime.setHours(eventDetails.endTime.getHours());
    endDateTime.setMinutes(eventDetails.endTime.getMinutes());
    let endDateTimeUTC = endDateTime.toISOString();

    if (endDateTime <= startDateTime) {
      endDateTime.setHours(endDateTime.getHours() + 1);
      endDateTimeUTC = endDateTime.toISOString();
    }

    // Format event data to match server expectations
    const eventData = {
      title: eventDetails.title,
      description: eventDetails.description || "",
      activity: eventDetails.selectedActivity?.name || "",
      goalValue: eventDetails.goalValue || 0,
      currentValue: eventDetails.currentValue || 0,
      start_date: startDateTimeUTC,
      end_date: endDateTimeUTC,
      location: eventDetails.location || "",
      eventType: eventDetails.eventType || "individual",
      total_participants: Number(eventDetails.participantCount) || 0,
      team_count: Number(eventDetails.teamCount) || 0,
      members_per_team: Number(eventDetails.membersPerTeam) || 0,
      selectedActivity: eventDetails.selectedActivity,
      activityUnit: eventDetails.selectedActivity?.unit || "",
      progress: 0, // Start with 0 progress
      participants: [], // Filled in later
      teams: [], // Filled in later
      goal: eventDetails.goalValue, // Add goal property for server
    };

    try {
      const updatedEvent = {
        ...eventDetails,
        ...eventData,
      };

      // Fill in participants or teams based on eventType
      if (updatedEvent.eventType === "individual") {
        updatedEvent.participants = Array.from(
          { length: Number.parseInt(updatedEvent.participantCount) || 0 },
          (_, i) => ({
            id: `participant_${i + 1}`,
            name: `Deltaker ${i + 1}`,
          })
        );
      } else if (updatedEvent.eventType === "team") {
        updatedEvent.teams = Array.from(
          { length: Number.parseInt(updatedEvent.teamCount) || 0 },
          (_, i) => ({
            id: `team_${i + 1}`,
            name: `Lag ${i + 1}`,
            members: Array.from(
              { length: Number.parseInt(updatedEvent.membersPerTeam) || 0 },
              (_, j) => ({
                id: `member_${i + 1}_${j + 1}`,
                name: `Medlem ${j + 1}`,
              })
            ),
          })
        );
      }

      let savedEvent;
      
      if (isEditing) {
        // Update existing event
        await updateEvent(updatedEvent);
        savedEvent = updatedEvent;
      } else {
        // Create new event - the addEvent function will save to server and return the event with ID
        savedEvent = await addEvent(updatedEvent);
      }
      
      // Navigate to the event detail screen with the saved event's ID
      navigation.replace("ActiveEvent", { eventId: savedEvent.id });
      
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke lagre hendelsen på serveren.");
      console.error("Error in createEvent:", error);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigation.goBack();
  };

  const renderInput = (
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    keyboardType = "default"
  ) => (
    <View style={styles.inputGroup}>
      <Text
        style={[styles.label, { color: isDarkMode ? "#FFFFFF" : "#333333" }]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.unifiedInput,
          {
            backgroundColor: theme.surface,
            borderColor: isDarkMode ? theme.border : "#E5E5E5",
            color: isDarkMode ? "#FFFFFF" : "#000000",
          },
          multiline && {
            height: 100,
            textAlignVertical: "top",
            paddingTop: 12,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderDateTimePicker = (label, dateField, timeField) => (
    <View style={styles.inputGroup}>
      <Text
        style={[styles.label, { color: isDarkMode ? "#FFFFFF" : "#333333" }]}
      >
        {label}
      </Text>
      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={[
            styles.dateTimeInput,
            {
              backgroundColor: theme.surface,
              borderColor: isDarkMode ? theme.border : "#E5E5E5",
            },
          ]}
          onPress={() => showDateTimePicker("date", dateField)}
        >
          <Text
            style={[
              styles.dateTimeText,
              { color: isDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            {eventDetails[dateField].toLocaleDateString()}
          </Text>
          <MaterialCommunityIcons
            name="calendar"
            size={18}
            color={theme.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.dateTimeInput,
            {
              backgroundColor: theme.surface,
              borderColor: isDarkMode ? theme.border : "#E5E5E5",
            },
          ]}
          onPress={() => showDateTimePicker("time", dateField)}
        >
          <Text
            style={[
              styles.dateTimeText,
              { color: isDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            {eventDetails[timeField].toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <MaterialCommunityIcons
            name="clock-outline"
            size={18}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGoalInput = () => {
    if (!eventDetails.selectedActivity) return null;

    if (eventDetails.selectedActivity.type === "duration") {
      return (
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            Mål ({eventDetails.selectedActivity.unit})
          </Text>
          <View style={styles.dateTimeRow}>
            <TextInput
              style={[
                styles.dateTimeInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDarkMode ? theme.border : "#E5E5E5",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
              ]}
              value={eventDetails.goalMinutes.toString()}
              onChangeText={(text) => updateEventDetails("goalMinutes", text)}
              placeholder="Minutter"
              placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
              keyboardType="numeric"
            />
            <TextInput
              style={[
                styles.dateTimeInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDarkMode ? theme.border : "#E5E5E5",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
              ]}
              value={eventDetails.goalSeconds.toString()}
              onChangeText={(text) => updateEventDetails("goalSeconds", text)}
              placeholder="Sekunder"
              placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
              keyboardType="numeric"
            />
          </View>
        </View>
      );
    } else {
      return renderInput(
        `Mål (${eventDetails.selectedActivity.unit})`,
        eventDetails.goalValue.toString(),
        (text) => updateEventDetails("goalValue", text),
        "0",
        false,
        "numeric"
      );
    }
  };

  const renderStep = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text
              style={[
                styles.stepTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {isEditing ? "Endre aktivitetstype" : "Velg aktivitetstype"}
            </Text>
            <View style={styles.activityGrid}>
              {PREDEFINED_ACTIVITIES.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor:
                        eventDetails.selectedActivity?.id === activity.id
                          ? activity.color
                          : theme.surface,
                      borderColor: isDarkMode ? theme.border : "#E5E5E5",
                    },
                  ]}
                  onPress={() => handleActivitySelect(activity)}
                >
                  <MaterialCommunityIcons
                    name={activity.icon}
                    size={32}
                    color={
                      eventDetails.selectedActivity?.id === activity.id
                        ? "#FFFFFF"
                        : activity.color
                    }
                  />
                  <Text
                    style={[
                      styles.activityItemText,
                      {
                        color:
                          eventDetails.selectedActivity?.id === activity.id
                            ? "#FFFFFF"
                            : isDarkMode
                            ? "#FFFFFF"
                            : "#333333",
                      },
                    ]}
                  >
                    {activity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text
              style={[
                styles.stepTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              Hendelsesdetaljer
            </Text>
            {renderInput(
              "Navn",
              eventDetails.title,
              (text) => updateEventDetails("title", text),
              "Skriv inn navn"
            )}
            {renderInput(
              "Beskrivelse",
              eventDetails.description,
              (text) => updateEventDetails("description", text),
              "Skriv inn beskrivelse",
              true
            )}
            {renderGoalInput()}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text
              style={[
                styles.stepTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              Tid og sted
            </Text>
            {renderInput(
              "Sted",
              eventDetails.location,
              (text) => updateEventDetails("location", text),
              "Skriv inn sted",
              false,
              "default"
            )}
            {renderDateTimePicker("Start", "startDate", "startTime")}
            {renderDateTimePicker("Slutt", "endDate", "endTime")}
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text
              style={[
                styles.stepTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              Deltakere
            </Text>
            <View style={styles.eventTypeButtons}>
              {["team", "individual"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.eventTypeButton,
                    {
                      borderColor: isDarkMode ? theme.border : "#E5E5E5",
                      backgroundColor:
                        eventDetails.eventType === type
                          ? theme.primary
                          : theme.surface,
                    },
                  ]}
                  onPress={() => updateEventDetails("eventType", type)}
                >
                  <MaterialCommunityIcons
                    name={type === "team" ? "account-group" : "account"}
                    size={20}
                    color={
                      eventDetails.eventType === type
                        ? theme.background
                        : isDarkMode
                        ? "#FFFFFF"
                        : "#333333"
                    }
                  />
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      {
                        color:
                          eventDetails.eventType === type
                            ? theme.background
                            : isDarkMode
                            ? "#FFFFFF"
                            : "#333333",
                      },
                    ]}
                  >
                    {type === "team" ? "Lag" : "Individuell"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {eventDetails.eventType === "individual" &&
              renderInput(
                "Antall deltakere",
                eventDetails.participantCount,
                (text) => updateEventDetails("participantCount", text),
                "Skriv inn antall",
                false,
                "numeric"
              )}
            {eventDetails.eventType === "team" && (
              <>
                {renderInput(
                  "Antall lag",
                  eventDetails.teamCount,
                  (text) => updateEventDetails("teamCount", text),
                  "Skriv inn antall lag",
                  false,
                  "numeric"
                )}
                {renderInput(
                  "Medlemmer per lag",
                  eventDetails.membersPerTeam,
                  (text) => updateEventDetails("membersPerTeam", text),
                  "Skriv inn antall medlemmer",
                  false,
                  "numeric"
                )}
              </>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.background,
                borderBottomColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.05)",
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: theme.primary,
                },
              ]}
            />
          </View>

          <Animated.ScrollView
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: stepAnimation } } }],
              {
                useNativeDriver: true,
              }
            )}
          >
            {[0, 1, 2, 3].map((step) => (
              <View key={step} style={[styles.stepWrapper, { width }]}>
                {renderStep(step)}
              </View>
            ))}
          </Animated.ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, { backgroundColor: theme.border }]}
            onPress={() => {
              if (currentStep === 0) {
                handleCancel();
              } else {
                setCurrentStep(currentStep - 1);
                scrollViewRef.current?.scrollTo({
                  x: (currentStep - 1) * width,
                  animated: true,
                });
              }
            }}
          >
            <Text
              style={[
                styles.footerButtonText,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {currentStep === 0 ? "Avbryt" : "Forrige"}
            </Text>
          </TouchableOpacity>
          {currentStep < 3 ? (
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (currentStep < 3) {
                  setCurrentStep(currentStep + 1);
                  scrollViewRef.current?.scrollTo({
                    x: (currentStep + 1) * width,
                    animated: true,
                  });
                }
              }}
            >
              <Text
                style={[styles.footerButtonText, { color: theme.background }]}
              >
                Neste
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.primary }]}
              onPress={handleConfirm}
            >
              <Text
                style={[styles.footerButtonText, { color: theme.background }]}
              >
                {isEditing ? "Oppdater" : "Opprett"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={showCancelModal} animationType="fade" transparent={true}>
        <BlurView intensity={100} style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              Avbryt oppretting
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: isDarkMode ? "#CCCCCC" : "#666666" },
              ]}
            >
              Er du sikker på at du vil avbryte? Endringer vil ikke bli lagret.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: isDarkMode ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  Fortsett
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={confirmCancel}
              >
                <Text
                  style={[styles.modalButtonText, { color: theme.background }]}
                >
                  Avbryt
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      <Modal visible={showConfirmModal} animationType="fade" transparent={true}>
        <BlurView intensity={100} style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {isEditing ? "Bekreft endringer" : "Bekreft hendelse"}
            </Text>
            <Text
              style={[
                styles.modalText,
                { color: isDarkMode ? "#CCCCCC" : "#666666" },
              ]}
            >
              {isEditing
                ? "Er du sikker på at du vil oppdatere denne hendelsen?"
                : "Er du sikker på at du vil opprette denne hendelsen?"}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: isDarkMode ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  Avbryt
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={createEvent}
              >
                <Text
                  style={[styles.modalButtonText, { color: theme.background }]}
                >
                  Bekreft
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {dateTimePickerConfig.visible && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: "rgba(0,0,0,0.5)" },
            ]}
          >
            <View
              style={[
                styles.dateTimePickerContainer,
                { backgroundColor: theme.surface },
              ]}
            >
              <DateTimePicker
                value={dateTimePickerConfig.currentValue}
                mode={dateTimePickerConfig.mode}
                is24Hour={true}
                display="spinner"
                onChange={handleDateTimeChange}
                themeVariant={isDarkMode ? "dark" : "light"}
                textColor={isDarkMode ? "#FFFFFF" : "#000000"}
                style={styles.dateTimePicker}
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={[
                    styles.closeDateTimeButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={confirmDateTime}
                >
                  <Text
                    style={[
                      styles.closeDateTimeButtonText,
                      { color: theme.background },
                    ]}
                  >
                    Bekreft
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    flexDirection: "column",
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepWrapper: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  activityItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  activityItemText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  unifiedInput: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateTimeInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    marginRight: 6,
  },
  dateTimeText: {
    fontSize: 14,
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateTimePickerContainer: {
    width: 320,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dateTimePicker: {
    width: 320,
    height: 215,
  },
  closeDateTimeButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  closeDateTimeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: "transparent",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
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
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  modalButtonText: {
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  eventTypeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default NewEvent;
