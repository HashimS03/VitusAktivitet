import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Users, Bell, Award } from "lucide-react-native";
import * as Progress from "react-native-progress";
import StepCounter from "../stepcounter/stepcounter";
import { useNavigation } from "@react-navigation/native";
import ConfettiCannon from "react-native-confetti-cannon";

const TEAL_COLOR = "#00ADB5";
const SCREEN_WIDTH = Dimensions.get("window").width;
const DAILY_STEP_GOAL = 1000;

export default function Dashboard() {
  const [stepCount, setStepCount] = useState(0);
  const [streak, setStreak] = useState(25);
  const navigation = useNavigation();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (stepCount >= DAILY_STEP_GOAL && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  }, [stepCount]);

  const handleHistoryPress = () => {
    navigation.navigate('History');
  };

  return (
    <SafeAreaView style={styles.container}>
      {showCelebration && (
        <ConfettiCannon
          count={200}
          origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
          fadeOut={true}
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Stats")}
        >
          <Users size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Progress.Circle
          size={240}
          thickness={15}
          progress={stepCount / DAILY_STEP_GOAL}
          color={TEAL_COLOR}
          unfilledColor="#E5F7F6"
          borderWidth={0}
          strokeCap="round"
        />
        <View style={styles.progressContent}>
          <Image
            source={require("../../../assets/løper.png")}
            style={styles.runnerIcon}
          />
          <Text style={styles.stepsText}>{stepCount.toLocaleString()}</Text>
          <Text style={styles.dailyStepsLabel}>DAILY STEPS</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("ActivitySelect")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktive Hendelser</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Events", { screen: "EventsNavigation" })
          }
        >
          <View style={styles.eventCard}>
            <Image
              source={require("../../../assets/event-illustration.png")}
              style={styles.eventImage}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>LØP LØP LØP!</Text>
              <Text style={styles.eventDescription}>
                Beskrivelse som forklarer hva hendelsen gjelder
              </Text>
              <Progress.Bar
                progress={stepCount / DAILY_STEP_GOAL}
                width={null}
                color={TEAL_COLOR}
                unfilledColor="#E5F7F6"
                borderWidth={0}
                height={6}
                borderRadius={3}
              />
              <Text style={styles.progressText}>
                {stepCount} / {DAILY_STEP_GOAL}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statSection}
          onPress={handleHistoryPress}
        >
          <Text style={styles.statTitle}>Historikk</Text>
          <View style={styles.streakBox}>
            <Image
              source={require("../../../assets/flame-teal.png")}
              style={styles.flameIcon}
            />
            <Text style={styles.streakValue}>21</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.statSection}>
          <Text style={styles.statTitle}>Belønninger</Text>
          <View style={styles.rewardBox}>
            <View style={styles.rewardHeader}>
              <Text style={styles.levelText}>Level 2</Text>
              <View style={styles.badgeContainer}>
                <Award size={16} color="#8E97A9" />
              </View>
            </View>
            <Text style={styles.pointsText}>5500/6000</Text>
            <View style={styles.levelProgress}>
              <View style={styles.numberContainer}>
                <View style={styles.currentLevel}>
                  <Text style={styles.currentLevelText}>2</Text>
                </View>
                <View style={styles.nextLevel}>
                  <Text style={styles.nextLevelText}>3</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <StepCounter setStepCount={setStepCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  iconButton: { padding: 12, backgroundColor: "#FFF", borderRadius: 24 },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 260,
    marginVertical: 8,
  },
  progressContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  runnerIcon: { width: 40, height: 40, resizeMode: "contain" },
  stepsText: { fontSize: 36, fontWeight: "bold", color: TEAL_COLOR },
  dailyStepsLabel: { fontSize: 14, color: "#666" },
  addButton: {
    position: "absolute",
    bottom: 356,
    left: "50%",
    transform: [{ translateX: -25 }],
    backgroundColor: "#FFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  addButtonText: { fontSize: 24, color: TEAL_COLOR },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  eventImage: {
    width: 150,
    height: 100,
    resizeMode: "contain",
    marginRight: 12,
  },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  eventDescription: { fontSize: 14, color: "#666", marginBottom: 8 },
  progressText: { fontSize: 12, color: "#666" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 16,
  },
  statSection: {
    flex: 1,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  streakBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flameIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  streakValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00ADB5",
  },
  rewardBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    height: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  badgeContainer: {
    backgroundColor: "#F0F3F9",
    borderRadius: 16,
    padding: 6,
    opacity: 0.8,
  },
  pointsText: {
    fontSize: 11,
    color: "#8E97A9",
    marginBottom: 4,
    opacity: 0.8,
  },
  levelProgress: {
    marginTop: 4,
  },
  numberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -8,
    zIndex: 1,
  },
  currentLevel: {
    backgroundColor: "#FFD700",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  currentLevelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  nextLevel: {
    backgroundColor: "#F0F3F9",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  nextLevelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8E97A9",
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: "#F0F3F9",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: {
    width: "75%",
    height: "100%",
    backgroundColor: "#FFE7BA",
    borderRadius: 8,
  },
});