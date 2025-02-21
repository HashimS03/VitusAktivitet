"use client"

import React, { useState, useRef, useCallback } from "react"
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useNavigation } from "@react-navigation/native"

const initialNotifications = [
  {
    id: "1",
    title: "New Challenge Available!",
    description: "Join the latest running challenge.",
    icon: "trophy",
    time: "2h ago",
    unread: true,
  },
  {
    id: "2",
    title: "Leaderboard Update",
    description: "You're now in the top 5! Keep going!",
    icon: "podium",
    time: "5h ago",
    unread: true,
  },
  {
    id: "3",
    title: "Event Reminder",
    description: "Don't forget about your upcoming event!",
    icon: "calendar",
    time: "1d ago",
    unread: false,
  },
  {
    id: "4",
    title: "Achievement Unlocked",
    description: "You've reached a new milestone!",
    icon: "ribbon",
    time: "2d ago",
    unread: false,
  },
]

const NotificationItem = React.memo(({ item, isExpanded, toggleExpand, theme, animatedHeight, unreadAnim }) => {
  const borderLeftWidth = unreadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  })

  const dotOpacity = unreadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

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
          <Text style={[styles.notificationDescription, { color: theme.textSecondary }]}>{item.description}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  )
})

export default function Notifications() {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [expandedId, setExpandedId] = useState(null)

  const animatedHeights = useRef({}).current
  const unreadAnims = useRef({}).current

  // Initialize animated values
  notifications.forEach((notification) => {
    if (!animatedHeights[notification.id]) {
      animatedHeights[notification.id] = new Animated.Value(0)
    }
    if (!unreadAnims[notification.id]) {
      unreadAnims[notification.id] = new Animated.Value(notification.unread ? 1 : 0)
    }
  })

  const toggleExpand = useCallback(
    (id) => {
      // Handle expansion animation
      setExpandedId((prevId) => {
        const newId = prevId === id ? null : id
        Animated.timing(animatedHeights[id], {
          toValue: newId === id ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }).start()
        return newId
      })

      // Handle unread animation and state
      const notification = notifications.find((n) => n.id === id)
      if (notification?.unread) {
        Animated.timing(unreadAnims[id], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start()

        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
      }
    },
    [animatedHeights, unreadAnims, notifications],
  )

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
  )

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
      />
    </SafeAreaView>
  )
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
})

