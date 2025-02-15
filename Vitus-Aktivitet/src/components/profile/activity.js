import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme

const ActivityItem = ({ icon, title, date, score, theme }) => (
  <View style={[styles.activityItem, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
    <Image source={icon} style={styles.activityIcon} />
    <View style={styles.activityInfo}>
      <Text style={[styles.activityTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.activityDate, { color: theme.textSecondary }]}>{date}</Text>
    </View>
    <Text style={[styles.activityScore, { color: theme.textSecondary }]}>{score}</Text>
  </View>
);

const Activity = () => {
  const { theme } = useTheme(); // Get theme values

  const activities = [
    {
      icon: require("../../../assets/flame-teal.png"),
      title: "Earned Level 9 in Streak Challenge",
      date: "May 1, 2022",
      score: "5/5 Correct",
    },
    {
      icon: require("../../../assets/trophy-gold.png"),
      title: "Completed one Daily Goal",
      date: "May 1, 2022",
      score: "5/10 Correct",
    },
    {
      icon: require("../../../assets/trophy-gold.png"),
      title: "Earned Level 1 in Step Challenge",
      date: "May 1, 2022",
      score: "8/10 Correct",
    },
    {
      icon: require("../../../assets/trophy-gold.png"),
      title: "Earned Level 4 in Plank Challenge",
      date: "May 1, 2022",
      score: "9/10 Correct",
    },
    {
      icon: require("../../../assets/flame-teal.png"),
      title: "Earned Level 7 in Streak Challenge",
      date: "May 1, 2022",
      score: "10/10 Correct",
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
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
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
