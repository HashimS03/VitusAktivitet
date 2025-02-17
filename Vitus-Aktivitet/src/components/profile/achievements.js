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

// 🎖️ Trophy Data
export const trophyData = {
  "Step Streaker": {
    id: "1",
    name: "Step Streaker",
    description: "Master your daily steps",
    levels: [
      { level: 1, requirement: "5,000 steps daily for a week", icon: "🥉" },
      { level: 2, requirement: "10,000 steps daily for a month", icon: "🥈" },
      { level: 3, requirement: "15,000 steps daily for 3 months", icon: "🥇" },
    ],
  },
  "Workout Wonder": {
    id: "2",
    name: "Workout Wonder",
    description: "Become a workout champion",
    levels: [
      { level: 1, requirement: "Complete 10 workouts", icon: "🥉" },
      { level: 2, requirement: "Complete 50 workouts", icon: "🥈" },
      { level: 3, requirement: "Complete 100 workouts", icon: "🥇" },
    ],
  },
  "Sleep Master": {
    id: "3",
    name: "Sleep Master",
    description: "Perfect your sleep routine",
    levels: [
      { level: 1, requirement: "7 hours sleep for 7 days", icon: "🥉" },
      { level: 2, requirement: "8 hours sleep for 30 days", icon: "🥈" },
      { level: 3, requirement: "8 hours sleep for 90 days", icon: "🥇" },
    ],
  },
  "Nutrition Tracker": {
    id: "4",
    name: "Nutrition Tracker",
    description: "Track your nutrition journey",
    levels: [
      { level: 1, requirement: "Log meals for 7 days", icon: "🥉" },
      { level: 2, requirement: "Log meals for 30 days", icon: "🥈" },
      { level: 3, requirement: "Log meals for 90 days", icon: "🥇" },
    ],
  },
  "Meditation Guru": {
    id: "5",
    name: "Meditation Guru",
    description: "Achieve meditation mastery",
    levels: [
      { level: 1, requirement: "Meditate for 5 minutes daily for a week", icon: "🥉" },
      { level: 2, requirement: "Meditate for 10 minutes daily for a month", icon: "🥈" },
      { level: 3, requirement: "Meditate for 20 minutes daily for 3 months", icon: "🥇" },
    ],
  },
  "Hydration Hero": {
    id: "6",
    name: "Hydration Hero",
    description: "Stay perfectly hydrated",
    levels: [
      { level: 1, requirement: "Log 6 glasses daily for a week", icon: "🥉" },
      { level: 2, requirement: "Log 8 glasses daily for a month", icon: "🥈" },
      { level: 3, requirement: "Log 10 glasses daily for 3 months", icon: "🥇" },
    ],
  },
};

// Convert to list format
const trophies = Object.values(trophyData);

// 🏆 Trophy Item Component
const TrophyItem = ({ item, onPress, theme }) => (
  <TouchableOpacity
    style={[styles.trophyItem, { backgroundColor: theme.surface }]}
    onPress={onPress}
  >
    <View style={[styles.trophyIconContainer, { backgroundColor: theme.background }]}>
      <Trophy size={24} color={theme.text} />
    </View>
    <View style={styles.trophyInfo}>
      <Text style={[styles.trophyName, { color: theme.text }]}>{item.name}</Text>
      <Text style={[styles.trophyDescription, { color: theme.textSecondary }]}>
        {item.description}
      </Text>
    </View>
  </TouchableOpacity>
);

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
