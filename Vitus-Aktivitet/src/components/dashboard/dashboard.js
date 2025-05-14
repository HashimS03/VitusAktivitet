import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { AppState } from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { Users, Bell, Award, ChevronRight } from "lucide-react-native";
import * as Progress from "react-native-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Trophy } from "lucide-react-native";

// Constants
import { DASHBOARD_CONSTANTS } from '../../constants/dashboard';

// Components
import FloatingSymbols from "../BackgroundAnimation/FloatingSymbols";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";
import { trophyData } from "../profile/achievements";
import StepCounter from "../stepcounter/stepcounter";
import { UserContext } from "../context/UserContext";
import { CustomProgressCircle } from "./components/CustomProgressCircle";
import { EnhancedTutorial } from "./components/EnhancedTutorial";
import { GoalSettingModal } from "./components/GoalSettingModal";
import { StepCalculatorModal } from "./components/StepCalculatorModal";
import { EventCard } from "./components/EventCard";
import { StatCard } from "./components/StatCard";

// Services and Utilities
import { updateStreaks } from "../../utils/helpers";
import { 
  fetchStepActivity, 
  updateStepCount, 
  fetchUserStatistics,
  completeEvent as apiCompleteEvent,
  syncQueue
} from "../../services/apiService";
import { calculateTrophyProgress, getTrophyColor } from "../../utils/trophyUtils";

export default function Dashboard() {
  // Context and navigation
  const { userId } = useContext(UserContext);
  const { activeEvents } = useContext(EventContext);
  const { theme, accentColor } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  
  // State
  const [stepCount, setStepCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(DASHBOARD_CONSTANTS.DAILY_STEP_GOAL);
  const [newGoal, setNewGoal] = useState("");
  
  // UI State
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  
  // Trophy state
  const [randomTrophy, setRandomTrophy] = useState(null);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [progress, setProgress] = useState({ current: 0, nextGoal: 0 });
  
  // Assets
  const vitusHappyImages = {
    "#48CAB2": require("../../../assets/Vitus_Happy.png"),
    "#FF6B6B": require("../../../assets/Vitus_Happy_Red.png"),
    "#FFD93D": require("../../../assets/Vitus_Happy_Gold.png"),
    "#4C82FB": require("../../../assets/Vitus_Happy_Blue.png"),
    "#8A4FFF": require("../../../assets/Vitus_Happy_Purple.png"),
  };
  const selectedVitusHappyImage = vitusHappyImages[accentColor] || require("../../../assets/Vitus_Happy.png");

  // Load random trophy and progress
  useEffect(() => {
    loadRandomTrophyAndProgress();
  }, [userId]);
  
  // Check and reset daily steps
  useEffect(() => {
    checkAndResetDailySteps();
  }, [dailyGoal, userId]);
  
  useFocusEffect(
    useCallback(() => {
      checkAndResetDailySteps();
    }, [dailyGoal, userId])
  );
  
  // Load user data
  useEffect(() => {
    loadUserData();
  }, [userId]);
  
  // Update steps when returning to the screen
  useFocusEffect(
    useCallback(() => {
      updateStepsFromRoute();
    }, [route.params, dailyGoal, userId])
  );

  // Check event completion
  useEffect(() => {
    checkEventCompletion();
  }, [activeEvents]);
  
  // Check if first time user
  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  // Handle app state changes for syncing queue
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        syncQueue();
      }
    };
    
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);
  
  // Load random trophy and progress data
  const loadRandomTrophyAndProgress = async () => {
    try {
      // Select random trophy
      const trophyKeys = Object.keys(trophyData);
      const randomIndex = Math.floor(Math.random() * trophyKeys.length);
      const selectedTrophy = trophyData[trophyKeys[randomIndex]];
      setRandomTrophy(selectedTrophy);

      if (!userId) return;
      
      // Fetch metrics
      const stepsData = await fetchStepActivity();
      const latestActivity = stepsData[0];
      const stepCount = latestActivity ? latestActivity.step_count : 0;
      
      const currentStreak = parseInt(await AsyncStorage.getItem("currentStreak") || "0", 10);
      const totalSteps = parseInt(await AsyncStorage.getItem("totalSteps") || "0", 10);
      const participatedEvents = JSON.parse(await AsyncStorage.getItem("participatedEvents") || "[]");
      const completedEvents = JSON.parse(await AsyncStorage.getItem("completedEvents") || "[]");
      const leaderboardRank = parseInt(await AsyncStorage.getItem("leaderboardRank") || "999", 10);
      const privacyExplored = await AsyncStorage.getItem("privacyExplored") === "true";

      // Calculate trophy level and progress
      const metrics = { 
        stepCount, 
        currentStreak, 
        totalSteps,
        participatedEvents,
        completedEvents,
        leaderboardRank,
        privacyExplored
      };
      
      const { level, currentProgress, nextGoal } = calculateTrophyProgress(selectedTrophy, metrics);

      setUnlockedLevel(level);
      setProgress({ current: currentProgress, nextGoal });
    } catch (error) {
      console.error("Error loading trophy progress:", error);
    }
  };
  
  // Check and reset daily steps
  const checkAndResetDailySteps = async () => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];
      const lastResetDate = await AsyncStorage.getItem("lastStepResetDate");

      if (lastResetDate !== todayString && userId) {
        // Fetch current step data
        const stepsData = await fetchStepActivity();
        const latestActivity = stepsData[0];
        const previousSteps = latestActivity ? latestActivity.step_count : 0;

        // Reset daily steps
        try {
          await updateStepCount(0);
        } catch (error) {
          console.error("Error resetting step count:", error);
        }

        // Update local state
        setStepCount(0);
        await AsyncStorage.setItem("stepCount", "0");
        await AsyncStorage.setItem("lastStepResetDate", todayString);

        // Update streaks
        const { currentStreak, bestStreak } = await updateStreaks(previousSteps, dailyGoal, true);
        setStreak(currentStreak);
        setBestStreak(bestStreak);

        // Handle pending goal changes
        await handlePendingGoalChanges(todayString);
      }
    } catch (error) {
      console.error("❌ Error during daily reset:", error);
    }
  };
  
  // Handle pending goal changes
  const handlePendingGoalChanges = async (todayString) => {
    const pendingGoal = await AsyncStorage.getItem("pendingDailyGoal");
    const pendingGoalDate = await AsyncStorage.getItem("pendingGoalDate");
    
    if (pendingGoal && pendingGoalDate === todayString) {
      const newGoal = parseInt(pendingGoal, 10);
      if (!isNaN(newGoal) && newGoal > 0) {
        await AsyncStorage.setItem("dailyGoal", JSON.stringify(newGoal));
        setDailyGoal(newGoal);
        await AsyncStorage.removeItem("pendingDailyGoal");
        await AsyncStorage.removeItem("pendingGoalDate");
      }
    }
  };
  
  // Load initial user data
  const loadUserData = async () => {
    if (!userId) return;
    
    try {
      // Load daily goal
      const storedGoal = await AsyncStorage.getItem("dailyGoal");
      const initialGoal = storedGoal ? JSON.parse(storedGoal) : DASHBOARD_CONSTANTS.DAILY_STEP_GOAL;
      setDailyGoal(initialGoal);

      // Fetch step data
      const stepsData = await fetchStepActivity();
      const latestActivity = stepsData[0];
      const initialSteps = latestActivity ? latestActivity.step_count : 0;
      
      setStepCount(initialSteps);
      await AsyncStorage.setItem("stepCount", JSON.stringify(initialSteps));

      // Update streak info
      const { currentStreak, bestStreak } = await updateStreaks(initialSteps, initialGoal);
      setStreak(currentStreak);
      setBestStreak(bestStreak);

      // Check tutorial status
      const hasSeenTutorial = await AsyncStorage.getItem("hasSeenTutorial");
      const storedTutorialStep = await AsyncStorage.getItem("tutorialStep");

      if (hasSeenTutorial === null) {
        setShowTutorial(true);
        const currentStep = storedTutorialStep ? JSON.parse(storedTutorialStep) : 0;
        setTutorialStep(currentStep);
      } else {
        setShowTutorial(false);
        setTutorialStep(0);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };
  
  // Update steps from route params
  const updateStepsFromRoute = async () => {
    if (!userId || !route.params?.addedSteps) return;
    
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Fetch current steps
        const stepsData = await fetchStepActivity();
        const latestActivity = stepsData[0];
        let previousSteps = latestActivity ? latestActivity.step_count : 0;
        const newSteps = route.params.addedSteps;
        const newStepCount = previousSteps + newSteps;

        // Update total steps in storage
        const totalSteps = parseInt(await AsyncStorage.getItem("totalSteps") || "0", 10);
        const newTotalSteps = totalSteps + newSteps;
        await AsyncStorage.setItem("totalSteps", newTotalSteps.toString());

        // Update step count on server
        await updateStepCount(newStepCount);
        
        // Update local state
        setStepCount(newStepCount);
        await AsyncStorage.setItem("stepCount", JSON.stringify(newStepCount));
        navigation.setParams({ addedSteps: null });
        break;
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
  };

  // Handle event completion
  const checkEventCompletion = async () => {
    activeEvents.forEach(async (event) => {
      if (event.progress === 1) {
        await completeEvent(event.id);
      }
    });
  };

  // Mark event as completed
  const completeEvent = async (eventId) => {
    try {
      // Try to complete on server
      await apiCompleteEvent(eventId);
      
      // Update local storage
      const completedEvents = JSON.parse(await AsyncStorage.getItem("completedEvents") || "[]");
      
      if (!completedEvents.includes(eventId)) {
        completedEvents.push(eventId);
        await AsyncStorage.setItem("completedEvents", JSON.stringify(completedEvents));
      }
      
      // Update trophy progress if relevant
      if (randomTrophy && ["Event Champion", "Hendleses Konge"].includes(randomTrophy.name)) {
        const metrics = {
          completedEvents
        };
        
        const { level, currentProgress, nextGoal } = calculateTrophyProgress(randomTrophy, metrics);
        setUnlockedLevel(level);
        setProgress({ current: currentProgress, nextGoal });
      }
    } catch (error) {
      console.error("Error completing event:", error);
    }
  };

  // Check first time user
  const checkFirstTimeUser = async () => {
    try {
      const hasSeenTutorial = await AsyncStorage.getItem("hasSeenTutorial");
      setShowTutorial(hasSeenTutorial === null);
    } catch (error) {
      console.error("❌ Error checking first time user:", error);
    }
  };

  // Tutorial handlers
  const handleNextTutorialStep = async () => {
    if (tutorialStep < DASHBOARD_CONSTANTS.TOTAL_TUTORIAL_STEPS - 1) {
      const nextStep = tutorialStep + 1;
      setTutorialStep(nextStep);
      await AsyncStorage.setItem("tutorialStep", JSON.stringify(nextStep));
    } else {
      setShowTutorial(false);
      await AsyncStorage.setItem("hasSeenTutorial", "true");
      await AsyncStorage.removeItem("tutorialStep");
      await resetAppData();
    }
  };

  const handleBackTutorialStep = async () => {
    if (tutorialStep > 0) {
      const prevStep = tutorialStep - 1;
      setTutorialStep(prevStep);
      await AsyncStorage.setItem("tutorialStep", JSON.stringify(prevStep));
    }
  };

  const handleSkipTutorial = async () => {
    setShowTutorial(false);
    await AsyncStorage.setItem("hasSeenTutorial", "true");
    await AsyncStorage.removeItem("tutorialStep");
    await resetAppData();
  };

  // Get tutorial message and highlight position
  const getTutorialMessage = () => {
    switch (tutorialStep) {
      case 0:
        return (
          <>
            <Text>👋 Velkommen! </Text>
            <Text>Trykk på </Text>
            <Text style={{ fontWeight: "bold" }}>profilikonet</Text>
            <Text> for å se dine statistikker.</Text>
          </>
        );
      case 1:
        return (
          <>
            <Text>Her ser du </Text>
            <Text style={{ fontWeight: "bold" }}>varsler</Text>
            <Text>. Trykk på klokken</Text>
            <Text> 🔔 for oppdateringer.</Text>
          </>
        );
      // Add other cases as needed
      default:
        return <Text>Fortsett utforskningen!</Text>;
    }
  };

  const getTutorialHighlightPosition = () => {
    const positions = [
      { left: 24, top: 16, width: 44, height: 44 }, // Profil
      { left: DASHBOARD_CONSTANTS.SCREEN_WIDTH - 60, top: 16, width: 44, height: 44 }, // Varsler
      // Add other positions as needed
    ];
    return positions[tutorialStep] || { left: 0, top: 0, width: 0, height: 0 };
  };

  // Reset app data after tutorial
  const resetAppData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(
        key => key.startsWith("stepHistory_") || key === "stepCount" || key === "dailyGoal"
      );
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      
      if (userId) {
        try {
          await updateStepCount(0);
        } catch (error) {
          console.error("Error resetting step count:", error);
        }
      }
      
      setStepCount(0);
      setDailyGoal(DASHBOARD_CONSTANTS.DAILY_STEP_GOAL);
      setStreak(0);
      setBestStreak(0);
    } catch (error) {
      console.error("❌ Error resetting app data:", error);
    }
  };

  // Handle daily goal setting
  const handleSetDailyGoal = async () => {
    const goal = Number.parseInt(newGoal, 10);
    
    if (!isNaN(goal) && goal > 0) {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split("T")[0];
        const lastGoalUpdateDate = await AsyncStorage.getItem("lastGoalUpdateDate");
        
        // Store pending goal
        await AsyncStorage.setItem("pendingDailyGoal", JSON.stringify(goal));
        await AsyncStorage.setItem("pendingGoalDate", tomorrowString);
        
        // Show alert based on whether goal was already updated today
        if (lastGoalUpdateDate === today.toISOString().split("T")[0]) {
          Alert.alert(
            "Mål lagret for i morgen",
            `Du kan kun endre målet én gang per dag. Ditt nye mål (${goal} skritt) vil tre i kraft i morgen.`,
            [{ text: "OK" }]
          );
        } else {
          await AsyncStorage.setItem("lastGoalUpdateDate", today.toISOString().split("T")[0]);
          Alert.alert(
            "Mål lagret for i morgen",
            `Ditt nye mål (${goal} skritt) vil tre i kraft i morgen.`,
            [{ text: "OK" }]
          );
        }
        
        setShowGoalModal(false);
        setNewGoal("");
      } catch (error) {
        console.error("❌ Error setting daily goal:", error);
      }
    } else {
      Alert.alert("Ugyldig mål", "Vennligst skriv inn et gyldig tall større enn 0.");
    }
  };

  // Handle calculator confirmation
  const handleCalculatorConfirm = async (steps) => {
    try {
      // Get current step count
      const stepsData = await fetchStepActivity();
      const latestActivity = stepsData[0];
      let previousSteps = latestActivity ? latestActivity.step_count : 0;
      const newStepCount = previousSteps + steps;

      // Update step count on server
      await updateStepCount(newStepCount);
      
      // Update local state and storage
      setStepCount(newStepCount);
      await AsyncStorage.setItem("stepCount", JSON.stringify(newStepCount));

      const today = new Date().toISOString().split("T")[0];
      const stepHistoryKey = `stepHistory_${today}`;
      await AsyncStorage.setItem(stepHistoryKey, newStepCount.toString());

      // Update streaks
      const { currentStreak, bestStreak } = await updateStreaks(newStepCount, dailyGoal);
      setStreak(currentStreak);
      setBestStreak(bestStreak);

      // Update trophy progress if needed
      updateTrophyProgressAfterSteps(steps);
      
      setShowCalculatorModal(false);
    } catch (error) {
      console.error("Error updating steps from calculator:", error);
    }
  };
  
  // Update trophy progress after steps added
  const updateTrophyProgressAfterSteps = async (steps) => {
    if (!randomTrophy) return;
    
    try {
      // Fetch user statistics including total steps
      const userStats = await fetchUserStatistics();
      const totalSteps = userStats?.total_steps || 0;
      
      // Get other metrics
      const currentStreak = parseInt(await AsyncStorage.getItem("currentStreak") || "0", 10);
      const currentStepCount = stepCount + steps;
      
      // Calculate new trophy progress
      const metrics = {
        stepCount: currentStepCount,
        currentStreak,
        totalSteps
      };
      
      const { level, currentProgress, nextGoal } = calculateTrophyProgress(randomTrophy, metrics);
      
      setUnlockedLevel(level);
      setProgress({ current: currentProgress, nextGoal });
    } catch (error) {
      console.error("Error updating trophy progress:", error);
    }
  };

  // Navigation handlers
  const handleHistoryPress = () => {
    navigation.navigate("History");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FloatingSymbols />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: theme.surface, zIndex: tutorialStep === 0 ? 1001 : 0 }
            ]}
            onPress={() => navigation.navigate("Stats")}
          >
            <Users size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: theme.surface, zIndex: tutorialStep === 1 ? 1001 : 0 }
            ]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Bell size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Progress Ring */}
        <View
          style={[
            styles.progressContainer,
            {
              zIndex: tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4 ? 1001 : 0,
            }
          ]}
        >
          <CustomProgressCircle
            progress={Math.min(stepCount / dailyGoal, 1)}
            accentColor={accentColor}
            size={DASHBOARD_CONSTANTS.PROGRESS_RING_SIZE}
            thickness={DASHBOARD_CONSTANTS.PROGRESS_RING_THICKNESS}
          />
          
          <View style={styles.progressContent}>
            <Image source={selectedVitusHappyImage} style={styles.runnerIcon} />
            <TouchableOpacity
              style={[styles.stepsTouchable, { zIndex: tutorialStep === 3 ? 1002 : 0 }]}
              onPress={() => setShowGoalModal(true)}
            >
              <Text style={[styles.stepsText, { color: accentColor }]}>
                {stepCount.toLocaleString()}
              </Text>
              <Text style={[styles.dailyStepsLabel, { color: theme.textSecondary }]}>
                Daglig skritt (Mål: {dailyGoal})
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                zIndex: tutorialStep === 4 ? 1002 : 0,
              }
            ]}
            onPress={() => setShowCalculatorModal(true)}
          >
            <Text style={[styles.addButtonText, { color: accentColor }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Active Events Section */}
        <View style={[styles.section, { zIndex: tutorialStep === 5 ? 1001 : 0 }]}>
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
              renderItem={({ item }) => (
                <EventCard 
                  item={item}
                  theme={theme}
                  accentColor={accentColor}
                  onPress={() => navigation.navigate("Events", {
                    screen: "ActiveEvent",
                    params: { eventId: item.id }
                  })}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={[styles.eventCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.eventTitle, { color: theme.textSecondary }]}>
                Ingen hendelser opprettet
              </Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {/* Step Journey */}
          <StatCard
            title="Skrittreise"
            icon={<ChevronRight size={20} color={theme.textSecondary} />}
            theme={theme}
            onPress={handleHistoryPress}
            content={(
              <View style={styles.streakContent}>
                <MaterialCommunityIcons name="fire" size={40} color={accentColor} />
                <Text style={[styles.streakValue, { color: accentColor }]}>
                  {streak}
                </Text>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
                  Dager
                </Text>
              </View>
            )}
          />

          {/* Milestones */}
          <StatCard
            title="Milepæler"
            icon={<Award size={20} color={theme.textSecondary} />}
            theme={theme}
            onPress={() => navigation.navigate("Stats", { initialTab: "MILEPÆLER" })}
            content={
              randomTrophy ? (
                <View style={styles.rewardContent}>
                  <View style={styles.trophyProgressHeader}>
                    <Trophy size={20} color={getTrophyColor(unlockedLevel, randomTrophy.name, theme)} />
                    <Text style={[styles.levelText, { color: theme.text }]}>
                      {randomTrophy.name}
                    </Text>
                  </View>
                  <Progress.Bar
                    progress={progress.current / progress.nextGoal}
                    width={null}
                    color={accentColor}
                    unfilledColor={theme.border}
                    borderWidth={0}
                    height={6}
                    borderRadius={3}
                    style={styles.levelProgress}
                  />
                  <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                    {progress.current}/{progress.nextGoal}
                  </Text>
                </View>
              ) : null
            }
          />
        </View>

        {/* Step Counter Component */}
        <StepCounter setStepCount={setStepCount} />

        {/* Tutorial Component */}
        <EnhancedTutorial
          visible={showTutorial}
          currentStep={tutorialStep}
          totalSteps={DASHBOARD_CONSTANTS.TOTAL_TUTORIAL_STEPS}
          message={getTutorialMessage()}
          onNext={handleNextTutorialStep}
          onBack={handleBackTutorialStep}
          onSkip={handleSkipTutorial}
          highlightPosition={getTutorialHighlightPosition()}
          theme={theme}
          accentColor={accentColor}
        />
      </ScrollView>

      {/* Daily Goal Modal */}
      <GoalSettingModal
        visible={showGoalModal}
        theme={theme}
        accentColor={accentColor}
        newGoal={newGoal}
        setNewGoal={setNewGoal}
        onCancel={() => setShowGoalModal(false)}
        onSave={handleSetDailyGoal}
      />

      {/* Step Calculator Modal */}
      <StepCalculatorModal
        visible={showCalculatorModal}
        theme={theme}
        accentColor={accentColor}
        onConfirm={handleCalculatorConfirm}
        onCancel={() => setShowCalculatorModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  iconButton: {
    padding: 12,
    borderRadius: 24,
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: DASHBOARD_CONSTANTS.PROGRESS_RING_SIZE + 20,
    position: "relative",
    margin: 16,
  },
  progressContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
  },
  runnerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 10,
  },
  stepsText: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  dailyStepsLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  stepsTouchable: {
    alignItems: "center",
    zIndex: 0,
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
    width: DASHBOARD_CONSTANTS.SCREEN_WIDTH * 0.91,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -5,
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
  trophyProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  levelProgress: {
    width: "100%",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
  }
});
