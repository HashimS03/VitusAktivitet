"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { Users, Bell, Award, ChevronRight } from "lucide-react-native";
import * as Progress from "react-native-progress";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import StepCounter from "../stepcounter/stepcounter";
import { useNavigation } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";
import FloatingSymbols from "../../components/BackgroundAnimation/FloatingSymbols";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Color from "color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventContext } from "../events/EventContext"; // Import EventContext

const SCREEN_WIDTH = Dimensions.get("window").width;
const DAILY_STEP_GOAL = 7500; // Standard mål, men kan endres og lagres
const PROGRESS_RING_SIZE = 300;
const PROGRESS_RING_THICKNESS = 30;

// Custom Progress Circle with Gradient
const CustomProgressCircle = ({ progress, accentColor }) => {
  const radius = (PROGRESS_RING_SIZE - PROGRESS_RING_THICKNESS) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const transparentAccentColor = Color(accentColor).alpha(0.2).toString();

  return (
    <Svg height={PROGRESS_RING_SIZE} width={PROGRESS_RING_SIZE}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={accentColor} stopOpacity="1" />
          <Stop offset="1" stopColor={accentColor} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>

      <Circle
        cx={PROGRESS_RING_SIZE / 2}
        cy={PROGRESS_RING_SIZE / 2}
        r={radius}
        stroke={transparentAccentColor}
        strokeWidth={PROGRESS_RING_THICKNESS}
        fill="none"
      />
      <Circle
        cx={PROGRESS_RING_SIZE / 2}
        cy={PROGRESS_RING_SIZE / 2}
        r={radius}
        stroke="url(#grad)"
        strokeWidth={PROGRESS_RING_THICKNESS}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${PROGRESS_RING_SIZE / 2} ${
          PROGRESS_RING_SIZE / 2
        })`}
      />
    </Svg>
  );
};

const TutorialTooltip = ({ visible, message, onNext, position }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.tooltipOverlay}>
        <View style={[styles.tooltip, position]}>
          <Text style={styles.tooltipText}>{message}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function Dashboard() {
  const [stepCount, setStepCount] = useState(0);
  const [streak, setStreak] = useState(25);
  const navigation = useNavigation();
  const [showCelebration, setShowCelebration] = useState(false);
  const { theme, accentColor } = useTheme();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(DAILY_STEP_GOAL); // Dynamisk daglig mål
  const [newGoal, setNewGoal] = useState("");

  const { activeEvents } = useContext(EventContext); // Get active events from context

  const route = useRoute();

  // Reset kun skritt-relaterte data ved appstart
  useEffect(() => {
    const resetStepData = async () => {
      try {
        console.log("🔄 Resetter skritt-relaterte data i AsyncStorage...");
        // Fjern kun skritt-relaterte nøkkelverdier
        const allKeys = await AsyncStorage.getAllKeys();
        const stepKeys = allKeys.filter(
          (key) => key.startsWith("stepHistory_") || key === "stepCount"
        );
        if (stepKeys.length > 0) {
          await AsyncStorage.multiRemove(stepKeys);
        }
        setStepCount(0); // Tilbakestiller stepCount til 0
        console.log("✅ Skritt-data er nullstilt!");
      } catch (error) {
        console.error("❌ Feil ved nullstilling av skritt-data:", error);
      }
    };

    resetStepData();
  }, []); // Kjører kun én gang ved appstart

  // Last inn både skritt og daglig mål ved oppstart (beholder dailyGoal)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Last inn lagret daglig mål (beholder eksisterende verdi hvis den finnes)
        const storedGoal = await AsyncStorage.getItem("dailyGoal");
        const initialGoal = storedGoal
          ? JSON.parse(storedGoal)
          : DAILY_STEP_GOAL;
        setDailyGoal(initialGoal);
        console.log("Loaded initial dailyGoal:", initialGoal);

        // Last inn lagrede skritt (starter på 0 etter reset)
        const storedSteps = await AsyncStorage.getItem("stepCount");
        const initialSteps = storedSteps ? JSON.parse(storedSteps) : 0;
        setStepCount(initialSteps);
        console.log("Loaded initial stepCount:", initialSteps);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Dashboard (MainApp) har fått fokus!");
      console.log("📡 route.params nå:", route.params);

      const updateSteps = async () => {
        try {
          const storedSteps = await AsyncStorage.getItem("stepCount");
          const previousSteps = storedSteps ? JSON.parse(storedSteps) : 0;

          if (route.params?.addedSteps) {
            console.log("🔥 Mottatt addedSteps:", route.params.addedSteps);

            const newStepCount = previousSteps + route.params.addedSteps;
            console.log("📊 Oppdatert stepCount:", newStepCount);

            // Lagre oppdatert total i stepCount
            await AsyncStorage.setItem(
              "stepCount",
              JSON.stringify(newStepCount)
            );
            setStepCount(newStepCount);

            // Oppdater historikken med totale skritt (synkronisert med stepCount)
            const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
            const stepHistoryKey = `stepHistory_${today}`;

            // Sett historikken til å matche den nye totale stepCount
            await AsyncStorage.setItem(
              stepHistoryKey,
              JSON.stringify(newStepCount)
            );
            console.log(
              "📜 Updated history steps for today to total:",
              newStepCount
            );

            navigation.setParams({ addedSteps: null }); // Nullstill params
          }
        } catch (error) {
          console.error("❌ Feil ved oppdatering av stepCount:", error);
        }
      };

      updateSteps();
    }, [route.params])
  );

  useEffect(() => {
    checkFirstTimeUser();
    console.log("🚀 Appen kjører!");
  }, []);

  useEffect(() => {
    if (stepCount >= dailyGoal && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  }, [stepCount, dailyGoal, showCelebration]);

  const checkFirstTimeUser = async () => {
    try {
      console.log("🔍 Sjekker hasSeenTutorial i AsyncStorage...");
      const hasSeenTutorial = await AsyncStorage.getItem("hasSeenTutorial");
      console.log("💾 Lest fra AsyncStorage:", hasSeenTutorial);
      if (hasSeenTutorial === null) {
        setShowTutorial(true);
        console.log("🎉 Førstegangsbruker! Viser tutorial...");
      } else {
        setShowTutorial(false); // Forhindrer at tutorial vises på nytt etter reset
      }
    } catch (error) {
      console.error("❌ Feil ved sjekking av første gangs bruker:", error);
    }
  };

  const handleNextTutorialStep = async () => {
    if (tutorialStep < 6) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      try {
        await AsyncStorage.setItem("hasSeenTutorial", "true");
        console.log("Tutorial fullført! hasSeenTutorial er nå satt til 'true'");
      } catch (error) {
        console.error("Feil ved lagring av tutorial status:", error);
      }
    }
  };

  const getTutorialMessage = useCallback(() => {
    switch (tutorialStep) {
      case 0:
        return "Welcome! This is your profile. Tap here to view your stats.";
      case 1:
        return "Here you'll see your notifications.";
      case 2:
        return "This section shows your active events.";
      case 3:
        return "Track your daily steps and progress here!";
      case 4:
        return "Here you can convert activities into steps!";
      case 5:
        return "Check your step count history and highest streak!";
      case 6:
        return "Check out your achievements and progress toward your next goal!";
      default:
        return "";
    }
  }, [tutorialStep]);

  const getTutorialPosition = useCallback(() => {
    switch (tutorialStep) {
      case 0:
        return { top: 110, left: 40 }; // Adjusted for profile
      case 1:
        return { top: 110, right: 40 }; // Adjusted for notifications
      case 2:
        return { top: 400, left: 135 }; // Adjusted for active events
      case 3:
        return { top: 240, left: 25 }; // Adjusted for step tracking
      case 4:
        return { top: 310, left: 205 }; // Adjusted for the plus icon
      case 5:
        return { top: 540, left: 30 }; // Adjusted for History (Streak section)
      case 6:
        return { top: 515, left: 130 }; // Adjusted for Achievements (Level 2 section)
      default:
        return {};
    }
  }, [tutorialStep]);

  const handleHistoryPress = () => {
    navigation.navigate("History");
  };

  const handleSetDailyGoal = async () => {
    const goal = parseInt(newGoal, 10);
    if (!isNaN(goal) && goal > 0) {
      try {
        await AsyncStorage.setItem("dailyGoal", JSON.stringify(goal));
        setDailyGoal(goal);
        setShowGoalModal(false);
        setNewGoal("");
        console.log("Daily goal updated and saved:", goal);
      } catch (error) {
        console.error("Error saving daily goal:", error);
      }
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: theme.surface }]}
      onPress={() =>
        navigation.navigate("Events", {
          screen: "ActiveEvent",
          params: { eventId: item.id },
        })
      }
    >
      <Image
        source={require("../../../assets/trophy_icon.png")}
        style={styles.eventImage}
      />
      <View style={styles.eventContent}>
        <Text
          style={[styles.eventTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.eventDescription, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.description}
        </Text>
        <Progress.Bar
          progress={item.progress || 0}
          width={null}
          color={accentColor}
          unfilledColor={theme.border}
          borderWidth={0}
          height={6}
          borderRadius={3}
        />
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {item.currentValue || 0} {item.activityUnit} / {item.goalValue || 100}{" "}
          {item.activityUnit}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyEventCard = () => (
    <View style={[styles.eventCard, { backgroundColor: theme.surface }]}>
      <Text style={[styles.eventTitle, { color: theme.textSecondary }]}>
        No Events Created
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FloatingSymbols />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showCelebration && (
          <ConfettiCannon
            count={200}
            origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
            fadeOut={true}
          />
        )}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate("Stats")}
          >
            <Users size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Bell size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressWrapper}>
          <View style={styles.progressContainer}>
            <CustomProgressCircle
              progress={Math.min(stepCount / dailyGoal, 1)}
              accentColor={accentColor}
            />
            <View style={styles.progressContent}>
              <Image
                source={require("../../../assets/løper.png")}
                style={styles.runnerIcon}
              />
              <TouchableOpacity onPress={() => setShowGoalModal(true)}>
                <Text style={[styles.stepsText, { color: accentColor }]}>
                  {stepCount.toLocaleString()}
                </Text>
              </TouchableOpacity>
              <Text
                style={[styles.dailyStepsLabel, { color: theme.textSecondary }]}
              >
                Daglig skritt (Mål: {dailyGoal})
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => navigation.navigate("ActivitySelect")}
            >
              <Text style={[styles.addButtonText, { color: accentColor }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal transparent visible={showGoalModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Set Daily Goal
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Enter your daily goal"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={newGoal}
                onChangeText={setNewGoal}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.border },
                  ]}
                  onPress={() => setShowGoalModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: accentColor }]}
                  onPress={handleSetDailyGoal}
                >
                  <Text
                    style={[styles.modalButtonText, { color: theme.surface }]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Aktive hendelser
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Events")}>
              <Text style={[styles.seeAllText, { color: accentColor }]}>
                Se alt
              </Text>
            </TouchableOpacity>
          </View>
          {activeEvents.length > 0 ? (
            <FlatList
              data={activeEvents}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 0, marginBottom: 0 }}
            />
          ) : (
            renderEmptyEventCard()
          )}
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.surface }]}
            onPress={handleHistoryPress}
          >
            <View style={styles.statHeader}>
              <Text style={[styles.statTitle, { color: theme.text }]}>
                Historie
              </Text>
              <ChevronRight size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.streakContent}>
              <MaterialCommunityIcons
                name="fire"
                size={40}
                color={accentColor}
              />
              <Text style={[styles.streakValue, { color: accentColor }]}>
                {streak}
              </Text>
              <Text
                style={[styles.streakLabel, { color: theme.textSecondary }]}
              >
                Dager 
              </Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.cardContent}
              onPress={() => {
                navigation.navigate("Stats", { initialTab: "ACHIEVEMENTS" });
              }}
            >
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: theme.text }]}>
                  Gjøremål
                </Text>
                <Award size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.rewardContent}>
                <Text style={[styles.levelText, { color: theme.text }]}>
                  Step Streaker
                </Text>
                <Text
                  style={[styles.pointsText, { color: theme.textSecondary }]}
                >
                  1000/5000 Steps
                </Text>
                <View style={styles.levelProgress}>
                  <View
                    style={[
                      styles.progressBarContainer,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: accentColor, width: "20%" },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <StepCounter setStepCount={setStepCount} />

        <TutorialTooltip
          visible={showTutorial}
          message={getTutorialMessage()}
          onNext={handleNextTutorialStep}
          position={getTutorialPosition()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 12,
    borderRadius: 24,
    marginLeft: 8,
  },
  progressWrapper: {
    paddingVertical: 0,
    marginTop: -30,
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: PROGRESS_RING_SIZE + 20,
    position: "relative",
    margin: 16,
  },
  progressContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  runnerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 8,
  },
  stepsText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  dailyStepsLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 14,
  },
  eventList: {
    paddingBottom: 16,
    borderColor: "red", // Debugging
    borderWidth: 2,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 16,
    width: SCREEN_WIDTH * 0.91,
  },
  eventImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    borderRadius: 8,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 8,
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -5,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginLeft: 8,
  },
  streakLabel: {
    fontSize: 14,
    marginLeft: 4,
  },
  rewardContent: {
    alignItems: "flex-start",
  },
  levelText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    marginBottom: 8,
  },
  levelProgress: {
    width: "100%",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 2,
  },
  addButtonText: {
    fontSize: 24,
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltip: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    maxWidth: 250,
    position: "absolute",
  },
  tooltipText: {
    fontSize: 16,
    marginBottom: 12,
  },
  nextButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  nextButtonText: {
    color: "#50C3AA",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
