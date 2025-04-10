import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { AppState } from "react-native";
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
  Animated,
  Alert,
} from "react-native";
import { Users, Bell, Award, ChevronRight, X } from "lucide-react-native";
import * as Progress from "react-native-progress";
import Svg, { Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import StepCounter from "../stepcounter/stepcounter";
import { useNavigation } from "@react-navigation/native";
import FloatingSymbols from "../../components/BackgroundAnimation/FloatingSymbols";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Trophy } from "lucide-react-native";
import Color from "color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventContext } from "../events/EventContext";
import { trophyData } from "../profile/achievements";
import StepCalculator from "../dashboard/StepCalculator";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const DAILY_STEP_GOAL = 7500;
const PROGRESS_RING_SIZE = 300;
const PROGRESS_RING_THICKNESS = 30;

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
        transform={`rotate(-90 ${PROGRESS_RING_SIZE / 2} ${PROGRESS_RING_SIZE / 2})`}
      />
    </Svg>
  );
};

const EnhancedTutorial = ({
  visible,
  currentStep,
  totalSteps,
  message,
  onNext,
  onBack,
  onSkip,
  highlightPosition,
  theme,
  accentColor,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      pulseAnim.setValue(1);
    }
  }, [visible, currentStep]);

  if (!visible) return null;

  const highlightWidth = highlightPosition.width || 100;
  const highlightHeight = highlightPosition.height || 100;

  const tooltipWidth = 280;
  const tooltipHeight = 150;

  let tooltipLeft = highlightPosition.left + highlightWidth / 2 - tooltipWidth / 2;
  let tooltipTop = highlightPosition.top + highlightHeight + 20;

  if (tooltipLeft < 20) tooltipLeft = 20;
  if (tooltipLeft + tooltipWidth > SCREEN_WIDTH - 20)
    tooltipLeft = SCREEN_WIDTH - tooltipWidth - 20;

  if (tooltipTop + tooltipHeight > SCREEN_HEIGHT - 150) {
    tooltipTop = highlightPosition.top - tooltipHeight - 20;
  }
  if (tooltipTop < 50) tooltipTop = highlightPosition.top + highlightHeight + 20;

  return (
    <View style={styles.tutorialContainer}>
      <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={styles.highlightSvg}>
        <Defs>
          <LinearGradient id="highlightGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.2" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0.15" />
          </LinearGradient>
          <LinearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          fill="rgba(0,0,0,0.75)"
          zIndex={999}
        />
        <Rect
          x={highlightPosition.left - 10}
          y={highlightPosition.top - 10}
          width={highlightWidth + 20}
          height={highlightHeight + 20}
          fill="transparent"
          stroke="transparent"
          strokeWidth={0}
          zIndex={1001}
        />
      </Svg>

      <Animated.View
        style={[
          styles.tutorialTooltip,
          {
            backgroundColor: theme.surface,
            left: tooltipLeft,
            top: tooltipTop,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            elevation: 10,
            zIndex: 1002,
          },
        ]}
      >
        <View style={styles.tooltipHeader}>
          <Text style={[styles.stepIndicator, { color: accentColor }]}>
            {currentStep + 1}/{totalSteps}
          </Text>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <X size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.tutorialMessage, { color: theme.text }]}>
          {message}
        </Text>
        <View style={styles.tooltipFooter}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[
                styles.tutorialButton,
                { backgroundColor: theme.border, marginRight: 8 },
              ]}
              onPress={onBack}
            >
              <Text style={[styles.tutorialButtonText, { color: theme.text }]}>
                Tilbake
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.tutorialButton, { backgroundColor: accentColor }]}
            onPress={onNext}
          >
            <Text style={styles.tutorialButtonText}>
              {currentStep < totalSteps - 1 ? "Neste" : "Fullfør"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const updateStreaks = async (stepCount, dailyGoal, isNewDayReset = false) => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const storedLastDate = await AsyncStorage.getItem("lastCompletionDate");
  const storedStreak = parseInt((await AsyncStorage.getItem("currentStreak")) || "0", 10);
  const storedBestStreak = parseInt((await AsyncStorage.getItem("bestStreak")) || "0", 10);

  let currentStreak = storedStreak;
  let lastCompletionDate = storedLastDate || null;

  const hasReachedGoal = stepCount >= dailyGoal;

  if (
    isNewDayReset &&
    lastCompletionDate &&
    lastCompletionDate !== todayString
  ) {
    const lastDate = new Date(lastCompletionDate);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) currentStreak = 0; // Reset hvis mer enn én dag er hoppet over
  } else if (hasReachedGoal && lastCompletionDate !== todayString) {
    const diffDays = lastCompletionDate
      ? Math.floor((today - new Date(lastCompletionDate)) / (1000 * 60 * 60 * 24))
      : null;
    if (!lastCompletionDate || diffDays === 1) currentStreak += 1; // Øk streak
    else if (diffDays > 1) currentStreak = 1; // Start ny streak
    lastCompletionDate = todayString;
  }

  const bestStreak = Math.max(currentStreak, storedBestStreak);

  await AsyncStorage.setItem("currentStreak", currentStreak.toString());
  await AsyncStorage.setItem("bestStreak", bestStreak.toString());
  if (lastCompletionDate) {
    await AsyncStorage.setItem("lastCompletionDate", lastCompletionDate);
  }

  return { currentStreak, bestStreak };
};

export default function Dashboard() {
  const { userId } = useContext(UserContext);
  const [stepCount, setStepCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(DAILY_STEP_GOAL);
  const [newGoal, setNewGoal] = useState("");
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const { activeEvents } = useContext(EventContext);
  const route = useRoute();
  const scrollViewRef = useRef(null);

  const TOTAL_TUTORIAL_STEPS = 8;

  const [randomTrophy, setRandomTrophy] = useState(null);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [progress, setProgress] = useState({ current: 0, nextGoal: 0 });

  const vitusHappyImages = {
    "#48CAB2": require("../../../assets/Vitus_Happy.png"),
    "#FF6B6B": require("../../../assets/Vitus_Happy_Red.png"),
    "#FFD93D": require("../../../assets/Vitus_Happy_Gold.png"),
    "#4C82FB": require("../../../assets/Vitus_Happy_Blue.png"),
    "#8A4FFF": require("../../../assets/Vitus_Happy_Purple.png"),
  };

  const selectedVitusHappyImage =
    vitusHappyImages[accentColor] || require("../../../assets/Vitus_Happy.png");

  useEffect(() => {
    const selectRandomTrophyAndLoadProgress = async () => {
      const trophyKeys = Object.keys(trophyData);
      const randomIndex = Math.floor(Math.random() * trophyKeys.length);
      const selectedTrophy = trophyData[trophyKeys[randomIndex]];
      setRandomTrophy(selectedTrophy);

      if (!userId) return;
      try {
        const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
          withCredentials: true,
        });
        const latestActivity = response.data.data[0];
        const stepCount = latestActivity ? latestActivity.step_count : 0;
        const currentStreak = parseInt(
          (await AsyncStorage.getItem("currentStreak")) || "0",
          10
        );
        const totalSteps = parseInt(
          (await AsyncStorage.getItem("totalSteps")) || "0",
          10
        );
        const participatedEvents = JSON.parse(
          (await AsyncStorage.getItem("participatedEvents")) || "[]"
        );
        const completedEvents = JSON.parse(
          (await AsyncStorage.getItem("completedEvents")) || "[]"
        );
        const leaderboardRank = parseInt(
          (await AsyncStorage.getItem("leaderboardRank")) || "999",
          10
        );
        const privacyExplored =
          (await AsyncStorage.getItem("privacyExplored")) === "true";

        let level = 0;
        let currentProgress = 0;
        let nextGoal = selectedTrophy.levels[0].goal;

        switch (selectedTrophy.name) {
          case "Step Master":
            currentProgress = stepCount;
            if (stepCount >= 15000) {
              level = 3;
              nextGoal = 15000;
            } else if (stepCount >= 10000) {
              level = 2;
              nextGoal = 15000;
            } else if (stepCount >= 5000) {
              level = 1;
              nextGoal = 10000;
            } else {
              nextGoal = 5000;
            }
            break;
          case "Event Enthusiast":
            currentProgress = participatedEvents.length;
            if (participatedEvents.length >= 10) {
              level = 3;
              nextGoal = 10;
            } else if (participatedEvents.length >= 5) {
              level = 2;
              nextGoal = 10;
            } else if (participatedEvents.length >= 1) {
              level = 1;
              nextGoal = 5;
            } else {
              nextGoal = 1;
            }
            break;
          case "Streak Star":
            currentProgress = currentStreak;
            if (currentStreak >= 15) {
              level = 3;
              nextGoal = 15;
            } else if (currentStreak >= 10) {
              level = 2;
              nextGoal = 15;
            } else if (currentStreak >= 5) {
              level = 1;
              nextGoal = 10;
            } else {
              nextGoal = 5;
            }
            break;
          case "Event Champion":
            currentProgress = completedEvents.length;
            if (completedEvents.length >= 5) {
              level = 3;
              nextGoal = 5;
            } else if (completedEvents.length >= 3) {
              level = 2;
              nextGoal = 5;
            } else if (completedEvents.length >= 1) {
              level = 1;
              nextGoal = 3;
            } else {
              nextGoal = 1;
            }
            break;
          case "Leaderboard Legend":
            currentProgress = leaderboardRank <= 10 ? 11 - leaderboardRank : 0;
            if (leaderboardRank <= 1) {
              level = 3;
              nextGoal = 10;
            } else if (leaderboardRank <= 5) {
              level = 2;
              nextGoal = 5;
            } else if (leaderboardRank <= 10) {
              level = 1;
              nextGoal = 5;
            } else {
              nextGoal = 10;
            }
            break;
          case "Step Titan":
            currentProgress = totalSteps;
            if (totalSteps >= 250000) {
              level = 3;
              nextGoal = 250000;
            } else if (totalSteps >= 100000) {
              level = 2;
              nextGoal = 250000;
            } else if (totalSteps >= 50000) {
              level = 1;
              nextGoal = 100000;
            } else {
              nextGoal = 50000;
            }
            break;
          case "Privacy Sleuth":
            currentProgress = privacyExplored ? 1 : 0;
            if (privacyExplored) {
              level = 1;
              nextGoal = 1;
            } else {
              nextGoal = 1;
            }
            break;
          default:
            level = 0;
        }
        setUnlockedLevel(level);
        setProgress({ current: currentProgress, nextGoal });
      } catch (error) {
        console.error("Error loading trophy progress:", error);
        if (error.response && error.response.status === 500) {
          Alert.alert("Server Error", "Unable to load trophy progress. Please try again later.");
        } else if (error.response && error.response.status === 401) {
          Alert.alert("Authentication Error", "Please log in to sync data.");
        } else if (error.response && error.response.status === 503) {
          Alert.alert(
            "Server Problem",
            "The server is temporarily unavailable. Data is saved locally, and we'll sync when the server is back.",
            [{ text: "OK" }]
          );
        }
      }
    };
    selectRandomTrophyAndLoadProgress();
  }, [userId]);

  const checkAndResetDailySteps = async () => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];
      const lastResetDate = await AsyncStorage.getItem("lastStepResetDate");

      if (lastResetDate !== todayString && userId) {
        const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
          withCredentials: true,
        });
        const latestActivity = response.data.data[0];
        const previousSteps = latestActivity ? latestActivity.step_count : 0;

        if (lastResetDate && previousSteps > 0) {
          await AsyncStorage.setItem(
            `stepHistory_${lastResetDate}`,
            previousSteps.toString()
          );
        }

        await axios.post(
          `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
          { stepCount: 0, distance: null, timestamp: new Date() },
          { withCredentials: true }
        ).catch((error) => {
          if (error.response && error.response.status === 503) {
            queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
              stepCount: 0,
              distance: null,
              timestamp: new Date(),
            });
          } else if (error.response && error.response.status === 401) {
            Alert.alert("Authentication Error", "Please log in to reset steps.");
          }
        });
        setStepCount(0);
        await AsyncStorage.setItem("stepCount", "0");
        await AsyncStorage.setItem("lastStepResetDate", todayString);

        const { currentStreak, bestStreak } = await updateStreaks(
          previousSteps,
          dailyGoal,
          true
        );
        setStreak(currentStreak);
        setBestStreak(bestStreak);

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

        console.log(`✅ Daglig reset utført for: ${todayString}`);
      }
    } catch (error) {
      console.error("❌ Feil ved daglig reset:", error);
      if (error.response && error.response.status === 500) {
        Alert.alert("Server Error", "Unable to reset daily steps. Please try again later.");
      } else if (error.response && error.response.status === 401) {
        Alert.alert("Authentication Error", "Please log in to reset steps.");
      } else if (error.response && error.response.status === 503) {
        Alert.alert(
          "Server Problem",
          "The server is temporarily unavailable. Reset is saved locally, and we'll sync when the server is back.",
          [{ text: "OK" }]
        );
      }
    }
  };

  useEffect(() => {
    checkAndResetDailySteps();
  }, [dailyGoal, userId]);

  useFocusEffect(
    useCallback(() => {
      checkAndResetDailySteps();
    }, [dailyGoal, userId])
  );

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      try {
        const storedGoal = await AsyncStorage.getItem("dailyGoal");
        const initialGoal = storedGoal ? JSON.parse(storedGoal) : DAILY_STEP_GOAL;
        setDailyGoal(initialGoal);

        const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
          withCredentials: true,
        });
        const latestActivity = response.data.data[0];
        const initialSteps = latestActivity ? latestActivity.step_count : 0;
        setStepCount(initialSteps);
        await AsyncStorage.setItem("stepCount", JSON.stringify(initialSteps));

        const { currentStreak, bestStreak } = await updateStreaks(initialSteps, initialGoal);
        setStreak(currentStreak);
        setBestStreak(bestStreak);

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
        console.error("Error loading data:", error);
        if (error.response && error.response.status === 500) {
          Alert.alert("Server Error", "Unable to load data. Please try again later.");
        } else if (error.response && error.response.status === 401) {
          Alert.alert("Authentication Error", "Please log in to load data.");
        } else if (error.response && error.response.status === 503) {
          Alert.alert(
            "Server Problem",
            "The server is temporarily unavailable. Data is saved locally, and we'll sync when the server is back.",
            [{ text: "OK" }]
          );
        }
      }
    };
    loadData();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      const updateSteps = async () => {
        if (!userId) return;
        const maxRetries = 5; // Increased to 5 attempts
        let attempt = 0;

        while (attempt < maxRetries) {
          try {
            const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
              withCredentials: true,
            });
            const latestActivity = response.data.data[0];
            let previousSteps = latestActivity ? latestActivity.step_count : 0;

            if (route.params?.addedSteps && typeof route.params.addedSteps === "number") {
              const newSteps = route.params.addedSteps;
              const newStepCount = previousSteps + newSteps;

              await axios.post(
                `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
                { stepCount: newStepCount, distance: null, timestamp: new Date() },
                { withCredentials: true }
              );
              setStepCount(newStepCount);
              await AsyncStorage.setItem("stepCount", JSON.stringify(newStepCount));
              navigation.setParams({ addedSteps: null });
            }
            break;
          } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed:`, error);
            if (error.response && error.response.status === 503 && attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 3000 * attempt)); // Backoff: 3s, 6s, 9s, 12s, 15s
              continue;
            } else {
              if (error.response && error.response.status === 500) {
                Alert.alert("Server Error", "Unable to update step count. Please try again later.");
              } else if (error.response && error.response.status === 401) {
                Alert.alert("Authentication Error", "Please log in to sync step data.");
              } else if (error.response && error.response.status === 503) {
                queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
                  stepCount: previousSteps + (route.params?.addedSteps || 0),
                  distance: null,
                  timestamp: new Date(),
                });
                Alert.alert(
                  "Server Problem",
                  "The server is temporarily unavailable. Steps are saved locally, and we'll sync when the server is back.",
                  [{ text: "OK" }]
                );
              }
              break;
            }
          }
        }
      };
      updateSteps();
    }, [route.params, dailyGoal, userId])
  );

  const joinEvent = async (eventId) => {
    try {
      const participatedEvents = JSON.parse(
        (await AsyncStorage.getItem("participatedEvents")) || "[]"
      );
      if (!participatedEvents.includes(eventId)) {
        participatedEvents.push(eventId);
        await AsyncStorage.setItem(
          "participatedEvents",
          JSON.stringify(participatedEvents)
        );
      }
      if (
        randomTrophy &&
        ["Event Enthusiast", "Event Champion"].includes(randomTrophy.name)
      ) {
        const currentProgress = participatedEvents.length;
        let level = 0;
        let nextGoal = randomTrophy.levels[0].goal;

        if (randomTrophy.name === "Event Enthusiast") {
          if (currentProgress >= 10) {
            level = 3;
            nextGoal = 10;
          } else if (currentProgress >= 5) {
            level = 2;
            nextGoal = 10;
          } else if (currentProgress >= 1) {
            level = 1;
            nextGoal = 5;
          } else {
            nextGoal = 1;
          }
        } else if (randomTrophy.name === "Event Champion") {
          const completedEvents = JSON.parse(
            (await AsyncStorage.getItem("completedEvents")) || "[]"
          );
          const completedCount = completedEvents.length;
          if (completedCount >= 5) {
            level = 3;
            nextGoal = 5;
          } else if (completedCount >= 3) {
            level = 2;
            nextGoal = 5;
          } else if (completedCount >= 1) {
            level = 1;
            nextGoal = 3;
          } else {
            nextGoal = 1;
          }
        }
        setUnlockedLevel(level);
        setProgress({ current: currentProgress, nextGoal });
      }
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const completeEvent = async (eventId) => {
    try {
      const completedEvents = JSON.parse(
        (await AsyncStorage.getItem("completedEvents")) || "[]"
      );
      if (!completedEvents.includes(eventId)) {
        completedEvents.push(eventId);
        await AsyncStorage.setItem(
          "completedEvents",
          JSON.stringify(completedEvents)
        );
      }
      if (randomTrophy && ["Event Champion"].includes(randomTrophy.name)) {
        const currentProgress = completedEvents.length;
        let level = 0;
        let nextGoal = randomTrophy.levels[0].goal;

        if (randomTrophy.name === "Event Champion") {
          if (currentProgress >= 5) {
            level = 3;
            nextGoal = 5;
          } else if (currentProgress >= 3) {
            level = 2;
            nextGoal = 5;
          } else if (currentProgress >= 1) {
            level = 1;
            nextGoal = 3;
          } else {
            nextGoal = 1;
          }
        }
        setUnlockedLevel(level);
        setProgress({ current: currentProgress, nextGoal });
      }
    } catch (error) {
      console.error("Error completing event:", error);
    }
  };

  useEffect(() => {
    const checkEventCompletion = async () => {
      activeEvents.forEach(async (event) => {
        if (event.progress === 1) {
          await completeEvent(event.id);
        }
      });
    };
    checkEventCompletion();
  }, [activeEvents]);

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    try {
      const hasSeenTutorial = await AsyncStorage.getItem("hasSeenTutorial");
      if (hasSeenTutorial === null) {
        setShowTutorial(true);
      } else {
        setShowTutorial(false);
      }
    } catch (error) {
      console.error("❌ Feil ved sjekking av første gangs bruker:", error);
    }
  };

  const handleNextTutorialStep = async () => {
    if (tutorialStep < TOTAL_TUTORIAL_STEPS - 1) {
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

  const getTutorialMessage = useCallback(() => {
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
      case 2:
        return (
          <>
            <Text>🚶‍♂️Dette er </Text>
            <Text style={{ fontWeight: "bold" }}>skrittelleren</Text>
            <Text> din. Se dagens fremgang.</Text>
          </>
        );
      case 3:
        return (
          <>
            <Text>Endre ditt daglige mål 🎯 ved å trykke på </Text>
            <Text style={{ fontWeight: "bold" }}>skritt-tallet.</Text>
          </>
        );
      case 4:
        return (
          <>
            <Text>Konverter skritt fra aktiviteter ved å trykke på ➕ </Text>
            <Text style={{ fontWeight: "bold" }}>pluss-tegnet.</Text>
          </>
        );
      case 5:
        return (
          <>
            <Text>📅 Dine </Text>
            <Text style={{ fontWeight: "bold" }}>aktive hendelser</Text>
            <Text> vises her. Delta for moro skyld!</Text>
          </>
        );
      case 6:
        return (
          <>
            <Text>🌍 Se din </Text>
            <Text style={{ fontWeight: "bold" }}>Skrittreise </Text>
            <Text> her.</Text>
          </>
        );
      case 7:
        return (
          <>
            <Text>🏆 her finner du </Text>
            <Text style={{ fontWeight: "bold" }}>milepæler</Text>
          </>
        );
      default:
        return "";
    }
  }, [tutorialStep]);

  const getTutorialHighlightPosition = useCallback(() => {
    const positions = [
      { left: 24, top: 16, width: 44, height: 44 }, // Profil
      { left: SCREEN_WIDTH - 60, top: 16, width: 44, height: 44 }, // Varsler
      { left: SCREEN_WIDTH / 2 - 150, top: 105, width: 300, height: 300 }, // Skritteller
      { left: SCREEN_WIDTH / 2 - 150, top: 105, width: 300, height: 300 }, // Skritttall
      { left: SCREEN_WIDTH / 2 - 150, top: 105, width: 300, height: 300 }, // Pluss-knapp
      { left: 16, top: 400, width: SCREEN_WIDTH - 32, height: 120 }, // Aktive hendelser
      { left: 16, top: 320, width: (SCREEN_WIDTH - 10) / 2, height: 50 }, // Skrittreise
      {
        left: SCREEN_WIDTH - 16 - (SCREEN_WIDTH - 10) / 2,
        top: 320,
        width: (SCREEN_WIDTH - 10) / 2,
        height: 50,
      },
    ];
    return positions[tutorialStep] || { left: 0, top: 0, width: 0, height: 0 };
  }, [tutorialStep]);

  const resetAppData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(
        (key) =>
          key.startsWith("stepHistory_") ||
          key === "stepCount" ||
          key === "dailyGoal"
      );
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      if (userId) {
        await axios.post(
          `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
          { stepCount: 0, distance: null, timestamp: new Date() },
          { withCredentials: true }
        ).catch((error) => {
          if (error.response && error.response.status === 503) {
            queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
              stepCount: 0,
              distance: null,
              timestamp: new Date(),
            });
          } else if (error.response && error.response.status === 401) {
            Alert.alert("Authentication Error", "Please log in to reset steps.");
          }
        });
      }
      setStepCount(0);
      setDailyGoal(DAILY_STEP_GOAL);
      setStreak(0);
      setBestStreak(0);
      console.log("App data reset after tutorial completion");
    } catch (error) {
      console.error("❌ Feil ved nullstilling av app-data:", error);
    }
  };

  const handleSetDailyGoal = async () => {
    const goal = Number.parseInt(newGoal, 10);
    if (!isNaN(goal) && goal > 0) {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split("T")[0];
        const lastGoalUpdateDate = await AsyncStorage.getItem("lastGoalUpdateDate");

        if (lastGoalUpdateDate === today.toISOString().split("T")[0]) {
          await AsyncStorage.setItem("pendingDailyGoal", JSON.stringify(goal));
          await AsyncStorage.setItem("pendingGoalDate", tomorrowString);
          Alert.alert(
            "Mål lagret for i morgen",
            `Du kan kun endre målet én gang per dag. Ditt nye mål (${goal} skritt) vil tre i kraft i morgen.`,
            [{ text: "OK" }]
          );
        } else {
          await AsyncStorage.setItem("pendingDailyGoal", JSON.stringify(goal));
          await AsyncStorage.setItem("pendingGoalDate", tomorrowString);
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
        console.error("❌ Feil ved oppdatering av daglig mål:", error);
      }
    } else {
      Alert.alert("Ugyldig mål", "Vennligst skriv inn et gyldig tall større enn 0.");
    }
  };

  const handleCalculatorConfirm = async (steps) => {
    try {
      const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
        withCredentials: true,
      });
      const latestActivity = response.data.data[0];
      let previousSteps = latestActivity ? latestActivity.step_count : 0;
      const newStepCount = previousSteps + steps;

      await axios.post(
        `${SERVER_CONFIG.getBaseUrl()}/step-activity`,
        { stepCount: newStepCount, distance: null, timestamp: new Date() },
        { withCredentials: true }
      );
      setStepCount(newStepCount);
      await AsyncStorage.setItem("stepCount", JSON.stringify(newStepCount));

      const totalSteps = parseInt((await AsyncStorage.getItem("totalSteps")) || "0", 10);
      const newTotalSteps = totalSteps + steps;
      await AsyncStorage.setItem("totalSteps", newTotalSteps.toString());

      const today = new Date().toISOString().split("T")[0];
      const stepHistoryKey = `stepHistory_${today}`;
      await AsyncStorage.setItem(stepHistoryKey, newStepCount.toString());

      const { currentStreak, bestStreak } = await updateStreaks(newStepCount, dailyGoal);
      setStreak(currentStreak);
      setBestStreak(bestStreak);

      if (randomTrophy) {
        let level = 0;
        let currentProgress = 0;
        let nextGoal = randomTrophy.levels[0].goal;

        switch (randomTrophy.name) {
          case "Step Master":
            currentProgress = newStepCount;
            if (newStepCount >= 15000) {
              level = 3;
              nextGoal = 15000;
            } else if (newStepCount >= 10000) {
              level = 2;
              nextGoal = 15000;
            } else if (newStepCount >= 5000) {
              level = 1;
              nextGoal = 10000;
            } else {
              nextGoal = 5000;
            }
            break;
          case "Step Titan":
            currentProgress = newTotalSteps;
            if (newTotalSteps >= 250000) {
              level = 3;
              nextGoal = 250000;
            } else if (newTotalSteps >= 100000) {
              level = 2;
              nextGoal = 250000;
            } else if (newTotalSteps >= 50000) {
              level = 1;
              nextGoal = 100000;
            } else {
              nextGoal = 50000;
            }
            break;
          case "Streak Star":
            currentProgress = currentStreak;
            if (currentProgress >= 15) {
              level = 3;
              nextGoal = 15;
            } else if (currentProgress >= 10) {
              level = 2;
              nextGoal = 15;
            } else if (currentProgress >= 5) {
              level = 1;
              nextGoal = 10;
            } else {
              nextGoal = 5;
            }
            break;
        }
        setUnlockedLevel(level);
        setProgress({ current: currentProgress, nextGoal });
      }

      setShowCalculatorModal(false);
    } catch (error) {
      console.error("❌ Feil ved oppdatering av skritt fra kalkulator:", error);
      if (error.response && error.response.status === 500) {
        Alert.alert("Server Error", "Unable to update steps from calculator. Please try again later.");
      } else if (error.response && error.response.status === 401) {
        Alert.alert("Authentication Error", "Please log in to sync steps.");
      } else if (error.response && error.response.status === 503) {
        queueRequest("POST", `${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
          stepCount: previousSteps + steps,
          distance: null,
          timestamp: new Date(),
        });
        Alert.alert(
          "Server Problem",
          "The server is temporarily unavailable. Steps are saved locally, and we'll sync when the server is back.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        {
          backgroundColor: theme.surface,
          zIndex: tutorialStep === 5 ? 1001 : 0,
        },
      ]}
      onPress={() =>
        navigation.navigate("Events", {
          screen: "ActiveEvent",
          params: { eventId: item.id },
        })
      }
    >
      <Image
        source={require("../../../assets/Vitus_Strong.png")}
        style={styles.eventImage}
      />
      <View style={styles.eventContent}>
        <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
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
        Ingen hendelser opprettet
      </Text>
    </View>
  );

  const getTrophyColor = () => {
    if (unlockedLevel === 0) return theme.textSecondary;
    if (unlockedLevel === 1 && randomTrophy?.name !== "Privacy Sleuth") return "#CD7F32";
    if (unlockedLevel === 2) return "#C0C0C0";
    return "#FFD700";
  };

  const handleHistoryPress = () => {
    navigation.navigate("History");
  };

  const queueRequest = async (method, url, data) => {
    const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
    queue.push({ method, url, data, timestamp: new Date() });
    await AsyncStorage.setItem("requestQueue", JSON.stringify(queue));
  };

  const syncQueue = async () => {
    const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
    for (const request of queue) {
      try {
        await axios[request.method.toLowerCase()](request.url, request.data, { withCredentials: true });
        const updatedQueue = queue.filter((r) => r.timestamp !== request.timestamp);
        await AsyncStorage.setItem("requestQueue", JSON.stringify(updatedQueue));
      } catch (error) {
        console.error("Failed to sync queued request:", error);
        break;
      }
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active") {
        syncQueue();
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FloatingSymbols />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.surface,
                zIndex: tutorialStep === 0 ? 1001 : 0,
              },
            ]}
            onPress={() => navigation.navigate("Stats")}
          >
            <Users size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.surface,
                zIndex: tutorialStep === 1 ? 1001 : 0,
              },
            ]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Bell size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.progressContainer,
            {
              zIndex:
                tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4
                  ? 1001
                  : 0,
            },
          ]}
        >
          <CustomProgressCircle
            progress={Math.min(stepCount / dailyGoal, 1)}
            accentColor={accentColor}
          />
          <View style={styles.progressContent}>
            <Image source={selectedVitusHappyImage} style={styles.runnerIcon} />
            <TouchableOpacity
              style={[
                styles.stepsTouchable,
                { zIndex: tutorialStep === 3 ? 1002 : 0 },
              ]}
              onPress={() => setShowGoalModal(true)}
            >
              <Text style={[styles.stepsText, { color: accentColor }]}>
                {stepCount.toLocaleString()}
              </Text>
              <Text
                style={[styles.dailyStepsLabel, { color: theme.textSecondary }]}
              >
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
              },
            ]}
            onPress={() => setShowCalculatorModal(true)}
          >
            <Text style={[styles.addButtonText, { color: accentColor }]}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        <Modal transparent visible={showGoalModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Sett daglig mål
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Skriv inn ditt daglige mål"
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
                    Avbryt
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: accentColor }]}
                  onPress={handleSetDailyGoal}
                >
                  <Text
                    style={[styles.modalButtonText, { color: theme.surface }]}
                  >
                    Lagre
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          visible={showCalculatorModal}
          animationType="slide"
          onRequestClose={() => setShowCalculatorModal(false)}
        >
          <View style={styles.calculatorModalOverlay}>
            <View
              style={[
                styles.calculatorModalContent,
                { backgroundColor: theme.surface },
              ]}
            >
              <StepCalculator
                onConfirm={handleCalculatorConfirm}
                onCancel={() => setShowCalculatorModal(false)}
                theme={theme}
                accentColor={accentColor}
              />
            </View>
          </View>
        </Modal>

        <View
          style={[styles.section, { zIndex: tutorialStep === 5 ? 1001 : 0 }]}
        >
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
            />
          ) : (
            renderEmptyEventCard()
          )}
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[
              styles.statCard,
              {
                backgroundColor: theme.surface,
                zIndex: tutorialStep === 6 ? 1001 : 0,
              },
            ]}
            onPress={handleHistoryPress}
          >
            <View style={styles.statHeader}>
              <Text style={[styles.statTitle, { color: theme.text }]}>
                Skrittreise
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
          <TouchableOpacity
            style={[
              styles.statCard,
              {
                backgroundColor: theme.surface,
                zIndex: tutorialStep === 7 ? 1001 : 0,
              },
            ]}
            onPress={() =>
              navigation.navigate("Stats", { initialTab: "MILEPÆLER" })
            }
          >
            <View style={styles.statHeader}>
              <Text style={[styles.statTitle, { color: theme.text }]}>
                Milepæler
              </Text>
              <Award size={20} color={theme.textSecondary} />
            </View>
            {randomTrophy && (
              <View style={styles.rewardContent}>
                <View style={styles.trophyProgressHeader}>
                  <Trophy size={20} color={getTrophyColor()} />
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
                <Text
                  style={[styles.progressText, { color: theme.textSecondary }]}
                >
                  {progress.current}/{progress.nextGoal}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <StepCounter setStepCount={setStepCount} />

        <EnhancedTutorial
          visible={showTutorial}
          currentStep={tutorialStep}
          totalSteps={TOTAL_TUTORIAL_STEPS}
          message={getTutorialMessage()}
          onNext={handleNextTutorialStep}
          onBack={handleBackTutorialStep}
          onSkip={handleSkipTutorial}
          highlightPosition={getTutorialHighlightPosition()}
          theme={theme}
          accentColor={accentColor}
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
    height: PROGRESS_RING_SIZE + 20,
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
  tutorialContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  highlightSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 999,
  },
  tutorialTooltip: {
    position: "absolute",
    width: 280,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    zIndex: 1002,
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: "bold",
  },
  skipButton: {
    padding: 4,
  },
  tutorialMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  tooltipFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  tutorialButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tutorialButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
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
  calculatorModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  calculatorModalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 15,
    maxHeight: "80%",
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