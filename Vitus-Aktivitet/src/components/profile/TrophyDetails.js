"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft, Trophy } from "lucide-react-native";
import { trophyData } from "./achievements";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { EventContext } from "../events/EventContext";
import * as Progress from "react-native-progress";

const { width } = Dimensions.get("window");

const MEDAL_COLORS = {
  bronze: ["#CD7F32", "#8B4513"],
  silver: ["#C0C0C0", "#808080"],
  gold: ["#FFD700", "#DAA520"],
};

const TrophyDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { trophy } = route.params;
  const { theme } = useTheme();
  const { activeEvents } = useContext(EventContext);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [progress, setProgress] = useState({ current: 0, nextGoal: 0 });
  const [animation] = useState(new Animated.Value(0));

  const trophyInfo = trophyData[trophy.name];

  // Load progress and determine unlocked level
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const stepCount = parseInt(await AsyncStorage.getItem("stepCount") || "0", 10);
        const currentStreak = parseInt(await AsyncStorage.getItem("currentStreak") || "0", 10);
        const totalSteps = parseInt(await AsyncStorage.getItem("totalSteps") || "0", 10);
        const participatedEvents = JSON.parse(await AsyncStorage.getItem("participatedEvents") || "[]");
        const completedEvents = JSON.parse(await AsyncStorage.getItem("completedEvents") || "[]");
        const leaderboardRank = parseInt(await AsyncStorage.getItem("leaderboardRank") || "999", 10);
        const privacyExplored = (await AsyncStorage.getItem("privacyExplored")) === "true";

        let level = 0;
        let currentProgress = 0;
        let nextGoal = trophyInfo.levels[0].goal;

        switch (trophy.name) {
          case "Step Master":
            currentProgress = stepCount;
            if (stepCount >= 15000) {
              level = 3;
              nextGoal = 15000; // Max goal reached
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
            currentProgress = leaderboardRank <= 10 ? 11 - leaderboardRank : 0; // Inverse rank for progress
            if (leaderboardRank <= 1) {
              level = 3;
              nextGoal = 10; // Top 1 is max
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
        console.error("Error loading progress:", error);
      }
    };

    loadProgress();

    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(loadProgress, 5000);
    return () => clearInterval(interval);
  }, [animation, trophy.name]);

  const headerTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const contentOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const getMedalColors = (level) => {
    if (level === 1 && trophy.name !== "Privacy Sleuth") return MEDAL_COLORS.bronze;
    if (level === 2) return MEDAL_COLORS.silver;
    if (level === 1 && trophy.name === "Privacy Sleuth") return MEDAL_COLORS.gold;
    return MEDAL_COLORS.gold;
  };

  const getMedalIcon = (level) => {
    if (level === 1 && trophy.name !== "Privacy Sleuth") return "medal-outline";
    return "medal";
  };

  const getTrophyColor = () => {
    if (unlockedLevel === 0) return theme.textSecondary;
    if (unlockedLevel === 1 && trophy.name !== "Privacy Sleuth") return "#CD7F32";
    if (unlockedLevel === 2) return "#C0C0C0";
    return "#FFD700";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ChevronLeft color={theme.text} size={24} />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.headerContainer,
            {
              transform: [{ translateY: headerTranslate }],
            },
          ]}
        >
          <LinearGradient colors={[theme.primary, theme.accent]} style={styles.trophyIconContainer}>
            <Trophy size={48} color={getTrophyColor()} />
          </LinearGradient>
          <Text style={[styles.trophyName, { color: theme.text }]}>{trophy.name}</Text>
          <Text style={[styles.trophyDescription, { color: theme.textSecondary }]}>
            {trophy.description}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.levelsContainer, { opacity: contentOpacity }]}>
          {trophyInfo.levels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.levelCard,
                { backgroundColor: theme.surface },
                index < unlockedLevel && styles.unlockedCard,
              ]}
              disabled={true}
            >
              <View style={styles.levelHeader}>
                <LinearGradient colors={getMedalColors(level.level)} style={styles.medalIconContainer}>
                  <MaterialCommunityIcons name={getMedalIcon(level.level)} size={24} color={theme.background} />
                </LinearGradient>
                <View style={styles.levelTitleContainer}>
                  <Text style={[styles.levelTitle, { color: theme.text }]}>Level {level.level}</Text>
                  <Text style={[styles.medalType, { color: theme.textSecondary }]}>
                    {level.level === 1 && trophy.name !== "Privacy Sleuth" ? "Bronsje" : 
                     level.level === 2 ? "Sølv" : "Gull"}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.requirement,
                  { color: index < unlockedLevel ? theme.textSecondary : theme.textTertiary },
                ]}
              >
                {level.requirement}
              </Text>
              <Progress.Bar
                progress={Math.min(progress.current / level.goal, 1)}
                width={null}
                color={theme.accent}
                unfilledColor={theme.border}
                borderWidth={0}
                height={8}
                borderRadius={4}
                style={styles.progressBar}
              />
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {progress.current}/{level.goal}
              </Text>
              {index < unlockedLevel && (
                <View
                  style={[
                    styles.statusContainer,
                    {
                      backgroundColor: index === unlockedLevel - 1 ? theme.accent + "40" : theme.success + "40",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.status,
                      {
                        color: index === unlockedLevel - 1 ? theme.accent : theme.success,
                      },
                    ]}
                  >
                    {index === unlockedLevel - 1 ? "In Progress" : "Completed"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  trophyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trophyName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trophyDescription: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  levelsContainer: {
    padding: 16,
  },
  levelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockedCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  medalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  levelTitleContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  medalType: {
    fontSize: 14,
    marginTop: 4,
  },
  requirement: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    textAlign: "right",
  },
  statusContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default TrophyDetails;