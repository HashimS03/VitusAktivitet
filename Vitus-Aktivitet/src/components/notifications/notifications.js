"use client";

import React, { useState, useRef, useCallback, useEffect, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventContext } from "../events/EventContext";

const DAILY_STEP_GOAL = 7500;

const NotificationItem = React.memo(({ item, isExpanded, toggleExpand, theme, animatedHeight, unreadAnim }) => {
  const borderLeftWidth = unreadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const dotOpacity = unreadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.notificationCard,
        {
          backgroundColor: theme.surface,
          borderLeftWidth,
          borderLeftColor: "#007AFF",
        },
      ]}
    >
      <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.touchableContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={24} color={theme.primary} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>{item.time}</Text>
          </View>
          <Animated.View style={[styles.unreadDot, { backgroundColor: theme.primary, opacity: dotOpacity }]} />
        </View>
        <Animated.View
          style={{
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 100],
            }),
            overflow: "hidden",
          }}
        >
          <Text style={[styles.notificationDescription, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function Notifications() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeEvents } = useContext(EventContext);
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const animatedHeights = useRef({}).current;
  const unreadAnims = useRef({}).current;

  // Load notifications from AsyncStorage on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem("notifications");
        const loadedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
        
        loadedNotifications.forEach((n) => {
          if (!animatedHeights[n.id]) animatedHeights[n.id] = new Animated.Value(0);
          if (!unreadAnims[n.id]) unreadAnims[n.id] = new Animated.Value(n.unread ? 1 : 0);
        });

        setNotifications(loadedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };
    loadNotifications();
  }, [animatedHeights, unreadAnims]);

  // Function to add a new notification and save to AsyncStorage
  const addNotification = useCallback(async (title, description, icon) => {
    const id = Math.random().toString(36).substr(2, 9);
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const timestamp = Date.now();
    const newNotification = { id, title, description, icon, time, unread: true, timestamp };

    if (!animatedHeights[id]) animatedHeights[id] = new Animated.Value(0);
    if (!unreadAnims[id]) unreadAnims[id] = new Animated.Value(1);

    try {
      const storedNotifications = await AsyncStorage.getItem("notifications");
      const currentNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
      const updatedNotifications = [newNotification, ...currentNotifications];
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  }, [animatedHeights, unreadAnims]);

  // Function to filter out notifications older than 24 hours and save to AsyncStorage
  const filterExpiredNotifications = useCallback(async () => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    try {
      const storedNotifications = await AsyncStorage.getItem("notifications");
      const currentNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
      const filteredNotifications = currentNotifications.filter((n) => now - n.timestamp < twentyFourHours);
      
      if (filteredNotifications.length !== currentNotifications.length) {
        await AsyncStorage.setItem("notifications", JSON.stringify(filteredNotifications));
        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error("Error filtering notifications:", error);
    }
  }, []);

  // Monitor daily goal completion
  useEffect(() => {
    const checkDailyGoal = async () => {
      const stepCount = parseInt(await AsyncStorage.getItem("stepCount") || "0", 10);
      const dailyGoal = parseInt(await AsyncStorage.getItem("dailyGoal") || DAILY_STEP_GOAL.toString(), 10);
      const todayString = new Date().toISOString().split("T")[0];
      const lastGoalDate = await AsyncStorage.getItem("lastGoalDate") || "";

      if (stepCount >= dailyGoal && lastGoalDate !== todayString) {
        await addNotification(
          "Daily Goal Completed!",
          `You've reached your goal of ${dailyGoal} steps!`,
          "walk"
        );
        await AsyncStorage.setItem("lastGoalDate", todayString);
      }
    };

    const interval = setInterval(() => {
      checkDailyGoal();
      filterExpiredNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [addNotification, filterExpiredNotifications]);

  // Monitor new and completed events
  useEffect(() => {
    const checkEvents = async () => {
      const notifiedEvents = JSON.parse(await AsyncStorage.getItem("notifiedEvents") || "[]");

      activeEvents.forEach((event) => {
        const startKey = `event-start-${event.id}`;
        if (!notifiedEvents.includes(startKey)) {
          addNotification(
            "New Event Started!",
            `Join the ${event.title} event now!`,
            "calendar"
          );
          notifiedEvents.push(startKey);
        }

        const endKey = `event-end-${event.id}`;
        if (event.progress === 1 && !notifiedEvents.includes(endKey)) {
          addNotification(
            "Event Completed!",
            `You've finished ${event.title}!`,
            "trophy"
          );
          notifiedEvents.push(endKey);
        }
      });

      await AsyncStorage.setItem("notifiedEvents", JSON.stringify(notifiedEvents));
    };

    checkEvents();
  }, [activeEvents, addNotification]);

  // Monitor achievements
  useEffect(() => {
    const checkAchievements = async () => {
      const stepCount = parseInt(await AsyncStorage.getItem("stepCount") || "0", 10);
      const currentStreak = parseInt(await AsyncStorage.getItem("currentStreak") || "0", 10);
      const notifiedMilestones = JSON.parse(await AsyncStorage.getItem("yearlyNotifiedMilestones") || "[]");
      const notifiedStreaks = JSON.parse(await AsyncStorage.getItem("yearlyNotifiedStreaks") || "[]");

      const milestones = [5000, 10000, 15000];
      const streakMilestones = [5, 10, 15];

      milestones.forEach((milestone) => {
        if (stepCount >= milestone && !notifiedMilestones.includes(milestone)) {
          addNotification(
            "Achievement Unlocked!",
            `You've reached ${milestone} steps!`,
            "ribbon"
          );
          notifiedMilestones.push(milestone);
        }
      });

      streakMilestones.forEach((milestone) => {
        if (currentStreak >= milestone && !notifiedStreaks.includes(milestone)) {
          addNotification(
            "Streak Milestone!",
            `You've hit a ${milestone}-day streak!`,
            "fire"
          );
          notifiedStreaks.push(milestone);
        }
      });

      await AsyncStorage.setItem("yearlyNotifiedMilestones", JSON.stringify(notifiedMilestones));
      await AsyncStorage.setItem("yearlyNotifiedStreaks", JSON.stringify(notifiedStreaks));
    };

    const interval = setInterval(checkAchievements, 5000);
    return () => clearInterval(interval);
  }, [addNotification]);

  // Clear all notifications and update AsyncStorage
  const clearNotifications = async () => {
    try {
      await AsyncStorage.setItem("notifications", JSON.stringify([]));
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const toggleExpand = useCallback(
    (id) => {
      setExpandedId((prevId) => {
        const newId = prevId === id ? null : id;
        Animated.timing(animatedHeights[id], {
          toValue: newId === id ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
        return newId;
      });

      const notification = notifications.find((n) => n.id === id);
      if (notification?.unread) {
        Animated.timing(unreadAnims[id], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
        setNotifications((prev) => {
          const updated = prev.map((n) => (n.id === id ? { ...n, unread: false } : n));
          AsyncStorage.setItem("notifications", JSON.stringify(updated)).catch((error) =>
            console.error("Error updating unread status:", error)
          );
          return updated;
        });
      }
    },
    [animatedHeights, unreadAnims, notifications],
  );

  const renderNotification = useCallback(
    ({ item }) => (
      <NotificationItem
        item={item}
        isExpanded={expandedId === item.id}
        toggleExpand={toggleExpand}
        theme={theme}
        animatedHeight={animatedHeights[item.id]}
        unreadAnim={unreadAnims[item.id]}
      />
    ),
    [expandedId, toggleExpand, theme, animatedHeights, unreadAnims],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No notifications yet
          </Text>
        }
      />
      {notifications.length > 0 && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: theme.primary }]}
          onPress={clearNotifications}
        >
          <Text style={styles.clearButtonText}>Fjern Varslinger</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 80, // Increased padding to ensure space for fixed button
  },
  notificationCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  touchableContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});