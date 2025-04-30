import React, { useEffect, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import apiClient from '../../utils/apiClient';

// 🎖️ Trophy Data
export const trophyData = {
  "Skritt Mester": {
    id: "1",
    name: "Skritt Mester",
    description: "Kom videre med daglige skritt",
    levels: [
      {
        level: 1,
        requirement: "5,000 skritt på en dag",
        goal: 5000,
        icon: "🥉",
      },
      {
        level: 2,
        requirement: "10,000 skritt på en dag",
        goal: 10000,
        icon: "🥈",
      },
      {
        level: 3,
        requirement: "15,000 skritt på en dag",
        goal: 15000,
        icon: "🥇",
      },
    ],
  },
  "Elsker hendelser": {
    id: "2",
    name: "Elsker hendelser",
    description: "Bli med på aktiviteter",
    levels: [
      { level: 1, requirement: "Deltatt på 1 hendelse", goal: 1, icon: "🥉" },
      { level: 2, requirement: "Deltatt på 5 hendelse", goal: 5, icon: "🥈" },
      { level: 3, requirement: "Deltatt på 10 hendelse", goal: 10, icon: "🥇" },
    ],
  },
  Streak: {
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
      {
        level: 1,
        requirement: "50,000 totalt skritt",
        goal: 50000,
        icon: "🥉",
      },
      {
        level: 2,
        requirement: "100,000 totalt skritt",
        goal: 100000,
        icon: "🥈",
      },
      {
        level: 3,
        requirement: "250,000 totalt skritt",
        goal: 250000,
        icon: "🥇",
      },
    ],
  },
  "Personverns Detektiv": {
    id: "7",
    name: "Personverns Detektiv",
    description: "Utforsk personvernet",
    levels: [
      {
        level: 1,
        requirement: "Gå til bunnen av personvernet",
        goal: 1,
        icon: "🥇",
      },
    ],
  },
};

const trophies = Object.values(trophyData);

// 🏆 Trophy Item Component
const TrophyItem = ({ item, onPress, theme }) => {
  const [unlockedLevel, setUnlockedLevel] = useState(0);

  useEffect(() => {
    const fetchTrophyProgress = async () => {
      try {
        const response = await apiClient.get('/trophy-progress');
        const result = response.data;
        if (result.success) {
          const trophyProgress = result.data.find(
            (progress) => progress.trophyId === item.id
          );
          if (trophyProgress) {
            setUnlockedLevel(trophyProgress.unlockedLevel);
          }
        } else {
          console.error("Failed to fetch trophy progress:", result.message);
        }
      } catch (error) {
        console.error("Error fetching trophy progress:", error);
      }
    };

    fetchTrophyProgress();
  }, [item.id]);

  const getTrophyColor = () => {
    return theme.textSecondary; // Keep the Trophy icon grey at all times
  };

  const getGradientColors = () => {
    if (unlockedLevel === 0) return ["#4A4A4A", "#333333"]; // Grey gradient for uncompleted
    if (unlockedLevel === 1 && item.name !== "Personverns Detektiv")
      return ["#CD7F32", "#8B4513"]; // Bronze gradient
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
        <Text style={[styles.trophyName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.trophyDescription, { color: theme.textSecondary }]}
        >
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <FlatList
        data={trophies}
        renderItem={({ item }) => (
          <TrophyItem
            item={item}
            onPress={() =>
              navigation.navigate("TrophyDetails", { trophy: item })
            }
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