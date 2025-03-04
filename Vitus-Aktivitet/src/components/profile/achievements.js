import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { Trophy } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🎖️ Trophy Data
export const trophyData = {
  "Step Master": {
    id: "1",
    name: "Step Master",
    description: "Excel in daily steps",
    levels: [
      { level: 1, requirement: "5,000 steps in a day", goal: 5000, icon: "🥉" },
      { level: 2, requirement: "10,000 steps in a day", goal: 10000, icon: "🥈" },
      { level: 3, requirement: "15,000 steps in a day", goal: 15000, icon: "🥇" },
    ],
  },
  "Event Enthusiast": {
    id: "2",
    name: "Event Enthusiast",
    description: "Join the action",
    levels: [
      { level: 1, requirement: "Participate in 1 event", goal: 1, icon: "🥉" },
      { level: 2, requirement: "Participate in 5 events", goal: 5, icon: "🥈" },
      { level: 3, requirement: "Participate in 10 events", goal: 10, icon: "🥇" },
    ],
  },
  "Streak Star": {
    id: "3",
    name: "Streak Star",
    description: "Maintain your streaks",
    levels: [
      { level: 1, requirement: "5-day streak", goal: 5, icon: "🥉" },
      { level: 2, requirement: "10-day streak", goal: 10, icon: "🥈" },
      { level: 3, requirement: "15-day streak", goal: 15, icon: "🥇" },
    ],
  },
  "Event Champion": {
    id: "4",
    name: "Event Champion",
    description: "Complete events with flair",
    levels: [
      { level: 1, requirement: "Complete 1 event", goal: 1, icon: "🥉" },
      { level: 2, requirement: "Complete 3 events", goal: 3, icon: "🥈" },
      { level: 3, requirement: "Complete 5 events", goal: 5, icon: "🥇" },
    ],
  },
  "Leaderboard Legend": {
    id: "5",
    name: "Leaderboard Legend",
    description: "Climb the ranks",
    levels: [
      { level: 1, requirement: "Top 10 in an event", goal: 10, icon: "🥉" },
      { level: 2, requirement: "Top 5 in an event", goal: 5, icon: "🥈" },
      { level: 3, requirement: "Top 1 in an event", goal: 1, icon: "🥇" },
    ],
  },
  "Step Titan": {
    id: "6",
    name: "Step Titan",
    description: "Conquer total steps",
    levels: [
      { level: 1, requirement: "50,000 total steps", goal: 50000, icon: "🥉" },
      { level: 2, requirement: "100,000 total steps", goal: 100000, icon: "🥈" },
      { level: 3, requirement: "250,000 total steps", goal: 250000, icon: "🥇" },
    ],
  },
  "Privacy Sleuth": {
    id: "7",
    name: "Privacy Sleuth",
    description: "Uncover the privacy details",
    levels: [
      { level: 1, requirement: "Scroll to the bottom of Privacy Policy", goal: 1, icon: "🥇" },
    ],
  },
};

const trophies = Object.values(trophyData);

// 🏆 Trophy Item Component
const TrophyItem = ({ item, onPress, theme }) => {
  const [unlockedLevel, setUnlockedLevel] = React.useState(0);

  React.useEffect(() => {
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
        switch (item.name) {
          case "Step Master":
            if (stepCount >= 15000) level = 3;
            else if (stepCount >= 10000) level = 2;
            else if (stepCount >= 5000) level = 1;
            break;
          case "Event Enthusiast":
            if (participatedEvents.length >= 10) level = 3;
            else if (participatedEvents.length >= 5) level = 2;
            else if (participatedEvents.length >= 1) level = 1;
            break;
          case "Streak Star":
            if (currentStreak >= 15) level = 3;
            else if (currentStreak >= 10) level = 2;
            else if (currentStreak >= 5) level = 1;
            break;
          case "Event Champion":
            if (completedEvents.length >= 5) level = 3;
            else if (completedEvents.length >= 3) level = 2;
            else if (completedEvents.length >= 1) level = 1;
            break;
          case "Leaderboard Legend":
            if (leaderboardRank <= 1) level = 3;
            else if (leaderboardRank <= 5) level = 2;
            else if (leaderboardRank <= 10) level = 1;
            break;
          case "Step Titan":
            if (totalSteps >= 250000) level = 3;
            else if (totalSteps >= 100000) level = 2;
            else if (totalSteps >= 50000) level = 1;
            break;
          case "Privacy Sleuth":
            if (privacyExplored) level = 1;
            break;
          default:
            level = 0;
        }
        setUnlockedLevel(level);
      } catch (error) {
        console.error("Error loading trophy progress:", error);
      }
    };
    loadProgress();
  }, [item.name]);

  const getTrophyColor = () => {
    if (unlockedLevel === 0) return theme.textSecondary; // Gray for uncompleted
    if (unlockedLevel === 1 && item.name !== "Privacy Sleuth") return "#CD7F32"; // Bronze
    if (unlockedLevel === 2) return "#C0C0C0"; // Silver
    return "#FFD700"; // Gold
  };

  return (
    <TouchableOpacity
      style={[styles.trophyItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={[styles.trophyIconContainer, { backgroundColor: theme.background }]}>
        <Trophy size={24} color={getTrophyColor()} />
      </View>
      <View style={styles.trophyInfo}>
        <Text style={[styles.trophyName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.trophyDescription, { color: theme.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 🏆 Achievements Screen
const Achievements = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <FlatList
        data={trophies}
        renderItem={({ item }) => (
          <TrophyItem
            item={item}
            onPress={() => navigation.navigate("TrophyDetails", { trophy: item })}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  trophyItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  trophyInfo: {
    flex: 1,
  },
  trophyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trophyDescription: {
    fontSize: 14,
  },
});

export default Achievements;