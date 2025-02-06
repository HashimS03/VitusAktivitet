import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

const ActivityItem = ({ icon, title, date, score }) => (
  <View style={styles.activityItem}>
    <Image source={icon} style={styles.activityIcon} />
    <View style={styles.activityInfo}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityDate}>{date}</Text>
    </View>
    <Text style={styles.activityScore}>{score}</Text>
  </View>
);

const Activity = () => {
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
    <ScrollView style={styles.container}>
      {activities.map((activity, index) => (
        <ActivityItem
          key={index}
          icon={activity.icon}
          title={activity.title}
          date={activity.date}
          score={activity.score}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
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
    color: "#9e9fa1",
  },
  activityScore: {
    fontSize: 14,
    color: "#9e9fa1",
  },
});

export default Activity;
