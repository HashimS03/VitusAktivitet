"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { Flame, ChevronRight, Filter } from "lucide-react-native"

const { width } = Dimensions.get("window")

const TrophyIcon = ({ size = 24, color }) => {
  const { isDarkMode } = useTheme()
  return (
    <Image
      source="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-21%20at%2014.56.44-K3zivvB92WFFWh9P51i4m2T46PdFxS.png"
      style={{
        width: size,
        height: size,
        tintColor: isDarkMode ? "#FFFFFF" : "#000000",
      }}
      resizeMode="contain"
    />
  )
}

const ActivityItem = ({ icon, title, date, score, theme, onPress }) => (
  <TouchableOpacity style={[styles.activityItem, { backgroundColor: theme.surface }]} onPress={onPress}>
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: icon === "trophy" ? theme.primary + "20" : theme.accent + "20" },
      ]}
    >
      {icon === "trophy" ? <TrophyIcon size={24} color={theme.primary} /> : <Flame size={24} color={theme.accent} />}
    </View>
    <View style={styles.activityInfo}>
      <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.activityDate, { color: theme.textSecondary }]}>{date}</Text>
    </View>
    <View style={styles.scoreContainer}>
      <Text style={[styles.activityScore, { color: theme.primary }]}>{score}</Text>
      <ChevronRight size={20} color={theme.textSecondary} />
    </View>
  </TouchableOpacity>
)

const Activity = () => {
  const { theme } = useTheme()
  const [activeCategory, setActiveCategory] = useState("All")

  const activities = [
    {
      icon: "flame",
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "5/5",
      category: "Challenges",
    },
    {
      icon: "trophy",
      title: "Fullført: Delta i en hendelse",
      date: "May 14, 2025",
      score: "5/10",
      category: "Events",
    },
    {
      icon: "trophy",
      title: "Fullført: Nivå 3 step challenge",
      date: "Juni 1, 2025",
      score: "8/10",
      category: "Challenges",
    },
    {
      icon: "trophy",
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "9/10",
      category: "Challenges",
    },
    {
      icon: "flame",
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "10/10",
      category: "Challenges",
    },
    {
      icon: "flame",
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "10/10",
      category: "Challenges",
    },
    {
      icon: "flame",
      title: "Fullført: Nivå 1 step challenge",
      date: "May 1, 2025",
      score: "10/10",
      category: "Challenges",
    },
  ]

  const handleActivityPress = (activity) => {
    // Handle activity press, e.g., navigate to detail screen
    console.log("Activity pressed:", activity)
  }

  const filteredActivities =
    activeCategory === "All" ? activities : activities.filter((activity) => activity.category === activeCategory)

  const categories = ["All", "Challenges", "Events"]

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              {
                backgroundColor: activeCategory === category ? theme.primary : theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[styles.categoryText, { color: activeCategory === category ? theme.background : theme.text }]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.activitiesContainer}>
        {filteredActivities.map((activity, index) => (
          <ActivityItem
            key={index}
            icon={activity.icon}
            title={activity.title}
            date={activity.date}
            score={activity.score}
            theme={theme}
            onPress={() => handleActivityPress(activity)}
          />
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activitiesContainer: {
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityScore: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },
})

export default Activity

