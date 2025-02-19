import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Trophy } from "lucide-react-native";

const ActivityItem = ({ icon, title, date, score, theme }) => (
  <View
    style={[
      styles.activityItem,
      { backgroundColor: theme.surface, shadowColor: theme.shadow },
    ]}
  >
    <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
      <Trophy size={24} color={theme.text} />
    </View>
    <View style={styles.activityInfo}>
      <Text style={[styles.activityTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.activityDate, { color: theme.textSecondary }]}>
        {date}
      </Text>
    </View>
    <Text style={[styles.activityScore, { color: theme.textSecondary }]}>
      {score}
    </Text>
  </View>
);

const Activity = () => {
  const { theme } = useTheme();

  const activities = [
    {
      icon: require("../../../assets/flame-teal.png"),
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "5/5 Correct",
    },
    {
      icon: require("../../../assets/trophy-gold.png"),
      title: "Fullført: Delta i en hendelse",
      date: "May 14, 2025",
      score: "5/10 Correct",
    },
    {
      icon: require("../../../assets/trophy-gold.png"),
      title: "Fullført: Nivå 3 step challenge",
      date: "juni 1, 2025",
      score: "8/10 Correct",
    },
    {
      icon: require("../../../assets/trophy-gold.png"),
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "9/10 Correct",
    },
    {
      icon: require("../../../assets/flame-teal.png"),
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "10/10 Correct",
    },
    {
      icon: require("../../../assets/flame-teal.png"),
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "10/10 Correct",
    },
    {
      icon: require("../../../assets/flame-teal.png"),
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "10/10 Correct",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {activities.map((activity, index) => (
        <ActivityItem
          key={index}
          icon={activity.icon}
          title={activity.title}
          date={activity.date}
          score={activity.score}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height: 100, // fast høyed
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
  },
  activityScore: {
    fontSize: 14,
  },
});

export default Activity;
