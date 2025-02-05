import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const ActivityItem = ({ icon, title, date, score, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: color }]} />
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityMeta}>
        {date} • {score}
      </Text>
    </View>
  </View>
);

const ActivityTab = () => {
  const activities = [
    {
      icon: "medal",
      title: "Earned Level 9 in Streak Challenge",
      date: "May 1, 2022",
      score: "5/5 Correct",
      color: "#FFD700",
    },
    {
      icon: "circle",
      title: "Completed one Daily Goal",
      date: "May 1, 2022",
      score: "5/10 Correct",
      color: "#E0E0E0",
    },
    {
      icon: "circle",
      title: "Earned Level 1 in Step Challenge",
      date: "May 1, 2022",
      score: "8/10 Correct",
      color: "#CD7F32",
    },
    {
      icon: "medal",
      title: "Earned Level 4 in Plank Challenge",
      date: "May 1, 2022",
      score: "9/10 Correct",
      color: "#C0C0C0",
    },
    {
      icon: "medal",
      title: "Earned Level 7 in Streak Challenge",
      date: "May 1, 2022",
      score: "10/10 Correct",
      color: "#FFD700",
    },
    {
      icon: "medal",
      title: "Earned Level 3 in Plank Challenge",
      date: "May 1, 2022",
      score: "5/7 Correct",
      color: "#C0C0C0",
    },
    {
      icon: "check",
      title: "Completed two Daily Goals",
      date: "May 1, 2022",
      score: "7/7 Correct",
      color: "#4CAF50",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {activities.map((activity, index) => (
        <ActivityItem
          key={index}
          icon={activity.icon}
          title={activity.title}
          date={activity.date}
          score={activity.score}
          color={activity.color}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 14,
    color: "#9e9fa1",
  },
});

export default ActivityTab;
