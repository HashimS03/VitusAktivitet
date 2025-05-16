import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ActivitySelector = ({
  activities,
  selectedActivity,
  onActivitySelect,
  theme,
  isDarkMode
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text
        style={[
          styles.stepTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        Velg aktivitetstype
      </Text>
      <View style={styles.activityGrid}>
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityItem,
              {
                backgroundColor:
                  selectedActivity?.id === activity.id
                    ? activity.color
                    : theme.surface,
                borderColor: isDarkMode ? theme.border : "#E5E5E5",
              },
            ]}
            onPress={() => onActivitySelect(activity)}
          >
            <MaterialCommunityIcons
              name={activity.icon}
              size={32}
              color={
                selectedActivity?.id === activity.id
                  ? "#FFFFFF"
                  : activity.color
              }
            />
            <Text
              style={[
                styles.activityItemText,
                {
                  color:
                    selectedActivity?.id === activity.id
                      ? "#FFFFFF"
                      : isDarkMode
                      ? "#FFFFFF"
                      : "#333333",
                },
              ]}
            >
              {activity.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  activityItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  activityItemText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default React.memo(ActivitySelector);