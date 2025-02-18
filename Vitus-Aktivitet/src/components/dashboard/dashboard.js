"use client";

import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { Users, Bell, Award } from "lucide-react-native";
import * as Progress from "react-native-progress";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import StepCounter from "../stepcounter/stepcounter";
import { useNavigation } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";
import FloatingSymbols from "../../components/BackgroundAnimation/FloatingSymbols";
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Color from 'color';
import { ChevronRight } from "lucide-react-native";


const SCREEN_WIDTH = Dimensions.get("window").width;
const DAILY_STEP_GOAL = 1000;
const PROGRESS_RING_SIZE = 300;
const PROGRESS_RING_THICKNESS = 30;

// Custom Progress Circle with Gradient
const CustomProgressCircle = ({ progress, accentColor }) => {
  const radius = (PROGRESS_RING_SIZE - PROGRESS_RING_THICKNESS) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  // Create a semi-transparent version of the accent color for the background ring
  const transparentAccentColor = Color(accentColor).alpha(0.2).toString();

  return (
    <Svg height={PROGRESS_RING_SIZE} width={PROGRESS_RING_SIZE}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={accentColor} stopOpacity="1" />
          <Stop offset="1" stopColor={accentColor} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      
      {/* Background Ring (Semi-Transparent) */}
      <Circle
        cx={PROGRESS_RING_SIZE / 2}
        cy={PROGRESS_RING_SIZE / 2}
        r={radius}
        stroke={transparentAccentColor}  // ✅ Semi-transparent accent color
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

export default function Dashboard() {
  const [stepCount, setStepCount] = useState(0);
  const [streak, setStreak] = useState(25);
  const navigation = useNavigation();
  const [showCelebration, setShowCelebration] = useState(false);
  const { theme, accentColor } = useTheme();

  useEffect(() => {
    if (stepCount >= DAILY_STEP_GOAL && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  }, [stepCount, showCelebration]);

  const handleHistoryPress = () => {
    navigation.navigate("History");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
              progress={Math.min(stepCount / DAILY_STEP_GOAL, 1)}
              accentColor={accentColor}
            />
            <View style={styles.progressContent}>
              <Image
                source={require("../../../assets/løper.png")}
                style={styles.runnerIcon}
              />
              <Text style={[styles.stepsText, { color: accentColor }]}>{stepCount.toLocaleString()}</Text>
              <Text style={[styles.dailyStepsLabel, { color: theme.textSecondary }]}>DAILY STEPS</Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => navigation.navigate("ActivitySelect")}
            >
              <Text style={[styles.addButtonText, { color: accentColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Events")}>
              <Text style={[styles.seeAllText, { color: accentColor }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("EventDetail")}
            style={[styles.eventCard, { backgroundColor: theme.surface }]}
          >
            <Image source={require("../../../assets/event-illustration.png")} style={styles.eventImage} />
            <View style={styles.eventContent}>
              <Text style={[styles.eventTitle, { color: theme.text }]}>Summer Run Challenge</Text>
              <Text style={[styles.eventDescription, { color: theme.textSecondary }]}>Complete 100km this month</Text>
              <Progress.Bar
                progress={0.65}
                width={null}
                color={accentColor}
                unfilledColor={theme.border}
                borderWidth={0}
                height={6}
                borderRadius={3}
              />
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>65 km / 100 km</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.surface }]} onPress={handleHistoryPress}>
            <View style={styles.statHeader}>
              <Text style={[styles.statTitle, { color: theme.text }]}>Streak</Text>
              <ChevronRight size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.streakContent}>
              <MaterialCommunityIcons name="fire" size={40} color={accentColor} />
              <Text style={[styles.streakValue, { color: accentColor }]}>{streak}</Text>
              <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>days</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={styles.statHeader}>
              <Text style={[styles.statTitle, { color: theme.text }]}>Rewards</Text>
              <Award size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.rewardContent}>
              <Text style={[styles.levelText, { color: theme.text }]}>Level 2</Text>
              <Text style={[styles.pointsText, { color: theme.textSecondary }]}>5500/6000 XP</Text>
              <View style={styles.levelProgress}>
                <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressBar, { backgroundColor: accentColor, width: "75%" }]} />
                </View>
              </View>
            </View>
          </View>
        </View>
        

        <StepCounter setStepCount={setStepCount} />
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
    marginTop: -20,
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
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
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
});