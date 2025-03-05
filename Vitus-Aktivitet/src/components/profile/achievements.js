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
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient for gradients

// 🎖️ Trophy Data
export const trophyData = {
  "Skritt Mester": {
    id: "1",
    name: "Skritt Mester",
    description: "Kom videre med daglige skritt",
    levels: [
      { level: 1, requirement: "5,000 skritt på en dag", goal: 5000, icon: "🥉" },
      { level: 2, requirement: "10,000 skritt på en dag", goal: 10000, icon: "🥈" },
      { level: 3, requirement: "15,000 skritt på en dag", goal: 15000, icon: "🥇" },
    ],
  },
  "Hendelses Soldat": {
    id: "2",
    name: "Hendelses Soldat",
    description: "Bli med på aktiviteter",
    levels: [
      { level: 1, requirement: "Deltatt på 1 hendelse", goal: 1, icon: "🥉" },
      { level: 2, requirement: "Deltatt på 5 hendelse", goal: 5, icon: "🥈" },
      { level: 3, requirement: "Deltatt på 10 hendelse", goal: 10, icon: "🥇" },
    ],
  },
  "Streak": {
    id: "3",
    name: "Streak",
    description: "Hold streaken gående",
    levels: [
      { level: 1, requirement: "5-dagers streak", goal: 5, icon: "🥉" },
      { level: 2, requirement: "10-dagers streak", goal: 10, icon: "🥈" },
      { level: 3, requirement: "15-dagers streak", goal: 15, icon: "🥇" },
    ],
  },
  "Hendleses Konge": {
    id: "4",
    name: "Hendleses Konge",
    description: "Gjennomfør hendelser best",
    levels: [
      { level: 1, requirement: "Fullfør 1 hendelse", goal: 1, icon: "🥉" },
      { level: 2, requirement: "Fullfør 3 hendelser", goal: 3, icon: "🥈" },
      { level: 3, requirement: "Fullfør 5 hendelser", goal: 5, icon: "🥇" },
    ],
  },
  "Ledertavle Legende": {
    id: "5",
    name: "Ledertavle Legende",
    description: "Klatre til topps",
    levels: [
      { level: 1, requirement: "Top 10 i en hendelse", goal: 10, icon: "🥉" },
      { level: 2, requirement: "Top 5 i en hendelse", goal: 5, icon: "🥈" },
      { level: 3, requirement: "Top 1 i en hendelse", goal: 1, icon: "🥇" },
    ],
  },
  "Skritt Titan": {
    id: "6",
    name: "Skritt Titan",
    description: "Hersk over skrittene",
    levels: [
      { level: 1, requirement: "50,000 totalt skritt", goal: 50000, icon: "🥉" },
      { level: 2, requirement: "100,000 totalt skritt", goal: 100000, icon: "🥈" },
      { level: 3, requirement: "250,000 totalt skritt", goal: 250000, icon: "🥇" },
    ],
  },
  "Personverns Detektiv": {
    id: "7",
    name: "Personverns Detektiv",
    description: "Utforsk personvernet",
    levels: [
      { level: 1, requirement: "Gå til bunnen av personvernet", goal: 1, icon: "🥇" },
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
          case "Skritt Mester":
            if (stepCount >= 15000) level = 3;
            else if (stepCount >= 10000) level = 2;
            else if (stepCount >= 5000) level = 1;
            break;
          case "Hendelses Soldat":
            if (participatedEvents.length >= 10) level = 3;
            else if (participatedEvents.length >= 5) level = 2;
            else if (participatedEvents.length >= 1) level = 1;
            break;
          case "Streak":
            if (currentStreak >= 15) level = 3;
            else if (currentStreak >= 10) level = 2;
            else if (currentStreak >= 5) level = 1;
            break;
          case "Hendleses Konge":
            if (completedEvents.length >= 5) level = 3;
            else if (completedEvents.length >= 3) level = 2;
            else if (completedEvents.length >= 1) level = 1;
            break;
          case "Ledertavle Legende":
            if (leaderboardRank <= 1) level = 3;
            else if (leaderboardRank <= 5) level = 2;
            else if (leaderboardRank <= 10) level = 1;
            break;
          case "Skritt Titan":
            if (totalSteps >= 250000) level = 3;
            else if (totalSteps >= 100000) level = 2;
            else if (totalSteps >= 50000) level = 1;
            break;
          case "Personverns Detektiv":
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
    return theme.textSecondary; // Keep the Trophy icon grey at all times
  };

  const getGradientColors = () => {
    if (unlockedLevel === 0) return ["#4A4A4A", "#333333"]; // Grey gradient for uncompleted (matching dark theme)
    if (unlockedLevel === 1 && item.name !== "Personverns Detektiv") return ["#CD7F32", "#8B4513"]; // Bronze gradient
    if (unlockedLevel === 2) return ["#C0C0C0", "#808080"]; // Silver gradient
    return ["#FFD700", "#DAA520"]; // Gold gradient
  };

  return (
    <TouchableOpacity
      style={[styles.trophyItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={[styles.trophyIconContainer]}
      >
        <Trophy size={24} color={getTrophyColor()} />
      </LinearGradient>
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