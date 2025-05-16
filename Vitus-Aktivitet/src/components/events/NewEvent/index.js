import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { EventContext } from "../EventContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

// Import step components
import ActivitySelector from "./ActivitySelector";
import EventDetails from "./EventDetails";
import TimeLocation from "./TimeLocation";
import ParticipantConfig from "./ParticipantConfig";

// Import shared components
import StepNavigator from "./components/StepNavigator";
import ConfirmModal from "./components/ConfirmModal";

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

    try {
      const startDateTime = eventDetails.startDate;
      startDateTime.setHours(eventDetails.startTime.getHours());
      startDateTime.setMinutes(eventDetails.startTime.getMinutes());
      
      let startDateTimeFormat = startDateTime.toISOString();

      const endDateTime = eventDetails.endDate;
      endDateTime.setHours(eventDetails.endTime.getHours());
      endDateTime.setMinutes(eventDetails.endTime.getMinutes());
      
      let endDateTimeFormat = endDateTime.toISOString();

      if (endDateTime <= startDateTime) {
        endDateTime.setHours(endDateTime.getHours() + 1);
        endDateTimeFormat = endDateTime.toISOString();
      }

      const eventData = {
        title: eventDetails.title,
        description: eventDetails.description || "",
        activity: eventDetails.selectedActivity?.name || "",
        goalValue: eventDetails.goalValue || 0,
        currentValue: eventDetails.currentValue || 0,
        start_date: startDateTimeFormat,
        end_date: endDateTimeFormat,
        location: eventDetails.location || "",
        eventType: eventDetails.eventType || "individual",
        total_participants: Number(eventDetails.participantCount) || 0,
        team_count: Number(eventDetails.teamCount) || 0,
        members_per_team: Number(eventDetails.membersPerTeam) || 0,
        selectedActivity: eventDetails.selectedActivity,
        activityUnit: eventDetails.selectedActivity?.unit || "",
        progress: 0,
        participants: [],
        teams: [],
        goal: eventDetails.goalValue,
        auto_join: true,
      };

      const updatedEvent = {
        ...eventDetails,
        ...eventData,
      };

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
        await updateEvent(updatedEvent);
        savedEvent = updatedEvent;
      } else {
        savedEvent = await addEvent(updatedEvent);
      }

      navigation.replace("ActiveEvent", { eventId: savedEvent.Id });
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke lagre hendelsen på serveren.");
      console.error("Error in createEvent:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({
        x: (currentStep + 1) * width,
        animated: true,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({
        x: (currentStep - 1) * width,
        animated: true,
      });
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.contentContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <StepNavigator
            currentStep={currentStep}
            totalSteps={4}
            formProgress={formProgress}
            progressAnimation={progressAnimation}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={handleCancel}
            onSubmit={handleConfirm}
            isEditing={isEditing}
            theme={theme}
            isDarkMode={isDarkMode}
          />

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
            {/* Step 1: Activity Selection */}
            <View style={[styles.stepWrapper, { width }]}>
              <ActivitySelector
                activities={PREDEFINED_ACTIVITIES}
                selectedActivity={eventDetails.selectedActivity}
                onActivitySelect={handleActivitySelect}
                theme={theme}
                isDarkMode={isDarkMode}
              />
            </View>

            {/* Step 2: Event Details */}
            <View style={[styles.stepWrapper, { width }]}>
              <EventDetails
                eventDetails={eventDetails}
                updateEventDetails={updateEventDetails}
                theme={theme}
                isDarkMode={isDarkMode}
              />
            </View>

            {/* Step 3: Time and Location */}
            <View style={[styles.stepWrapper, { width }]}>
              <TimeLocation
                eventDetails={eventDetails}
                updateEventDetails={updateEventDetails}
                theme={theme}
                isDarkMode={isDarkMode}
              />
            </View>

            {/* Step 4: Participant Configuration */}
            <View style={[styles.stepWrapper, { width }]}>
              <ParticipantConfig
                eventDetails={eventDetails}
                updateEventDetails={updateEventDetails}
                theme={theme}
                isDarkMode={isDarkMode}
              />
            </View>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        visible={showCancelModal}
        title="Avbryt oppretting"
        message="Er du sikker på at du vil avbryte? Endringer vil ikke bli lagret."
        confirmText="Avbryt"
        cancelText="Fortsett"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        theme={theme}
        isDarkMode={isDarkMode}
      />

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        visible={showConfirmModal}
        title={isEditing ? "Bekreft endringer" : "Bekreft hendelse"}
        message={
          isEditing
            ? "Er du sikker på at du vil oppdatere denne hendelsen?"
            : "Er du sikker på at du vil opprette denne hendelsen?"
        }
        confirmText="Bekreft"
        cancelText="Avbryt"
        onConfirm={createEvent}
        onCancel={() => setShowConfirmModal(false)}
        theme={theme}
        isDarkMode={isDarkMode}
      />
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
});

export default NewEvent;