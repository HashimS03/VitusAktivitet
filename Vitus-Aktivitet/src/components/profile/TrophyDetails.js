import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ChevronLeft, Trophy } from "lucide-react-native";
import { trophyData } from "./achievements";

const TrophyDetails = ({ route, navigation }) => {
  const { trophy } = route.params;
  const { theme } = useTheme();
  const [unlockedLevel, setUnlockedLevel] = useState(0);

  const trophyInfo = trophyData[trophy.name];

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
        <View style={styles.headerContainer}>
          <View style={[styles.trophyIconContainer, { backgroundColor: theme.surface }]}>
            <Trophy size={32} color={theme.text} />
          </View>
          <Text style={[styles.trophyName, { color: theme.text }]}>{trophy.name}</Text>
          <Text style={[styles.trophyDescription, { color: theme.textSecondary }]}>
            {trophy.description}
          </Text>
        </View>

        <View style={styles.levelsContainer}>
          {trophyInfo.levels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.levelCard, { backgroundColor: theme.surface }]}
              onPress={() => setUnlockedLevel(index)}
              disabled={index > unlockedLevel}
            >
              <View style={styles.levelHeader}>
                <Text style={styles.levelIcon}>{level.icon}</Text>
                <Text style={[styles.levelTitle, { color: theme.text }]}>
                  Level {level.level}
                </Text>
              </View>
              <Text
                style={[
                  styles.requirement,
                  { color: index <= unlockedLevel ? theme.textSecondary : theme.textTertiary },
                ]}
              >
                {index <= unlockedLevel ? level.requirement : "Unlock previous level to reveal"}
              </Text>
              {index <= unlockedLevel && (
                <Text
                  style={[
                    styles.status,
                    {
                      color: index === unlockedLevel ? theme.accent : theme.success,
                    },
                  ]}
                >
                  {index === unlockedLevel ? "In Progress" : "Completed"}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  trophyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trophyDescription: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  levelsContainer: {
    padding: 16,
  },
  levelCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  levelIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  requirement: {
    fontSize: 14,
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default TrophyDetails;