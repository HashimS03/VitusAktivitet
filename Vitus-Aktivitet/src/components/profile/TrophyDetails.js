"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import { ChevronLeft, Trophy } from "lucide-react-native"
import { trophyData } from "./achievements"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const MEDAL_COLORS = {
  bronze: ["#CD7F32", "#8B4513"],
  silver: ["#C0C0C0", "#808080"],
  gold: ["#FFD700", "#DAA520"],
}

const TrophyDetails = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { trophy } = route.params
  const { theme } = useTheme()
  const [unlockedLevel, setUnlockedLevel] = useState(1)
  const [animation] = useState(new Animated.Value(0))

  const trophyInfo = trophyData[trophy.name]

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [animation])

  const headerTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  })

  const contentOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const getMedalColors = (level) => {
    if (level === 1) return MEDAL_COLORS.bronze
    if (level === 2) return MEDAL_COLORS.silver
    return MEDAL_COLORS.gold
  }

  const getMedalIcon = (level) => {
    if (level === 1) return "medal-outline"
    if (level === 2) return "medal"
    return "medal"
  }

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
        <Animated.View
          style={[
            styles.headerContainer,
            {
              transform: [{ translateY: headerTranslate }],
            },
          ]}
        >
          <LinearGradient colors={[theme.primary, theme.accent]} style={styles.trophyIconContainer}>
            <Trophy size={48} color={theme.text} />
          </LinearGradient>
          <Text style={[styles.trophyName, { color: theme.text }]}>{trophy.name}</Text>
          <Text style={[styles.trophyDescription, { color: theme.textSecondary }]}>{trophy.description}</Text>
        </Animated.View>

        <Animated.View style={[styles.levelsContainer, { opacity: contentOpacity }]}>
          {trophyInfo.levels.map((level, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.levelCard,
                { backgroundColor: theme.surface },
                index < unlockedLevel && styles.unlockedCard,
              ]}
              onPress={() => setUnlockedLevel(Math.max(unlockedLevel, index + 1))}
              disabled={index >= unlockedLevel}
            >
              <View style={styles.levelHeader}>
                <LinearGradient colors={getMedalColors(level.level)} style={styles.medalIconContainer}>
                  <MaterialCommunityIcons name={getMedalIcon(level.level)} size={24} color={theme.background} />
                </LinearGradient>
                <View style={styles.levelTitleContainer}>
                  <Text style={[styles.levelTitle, { color: theme.text }]}>Level {level.level}</Text>
                  <Text style={[styles.medalType, { color: theme.textSecondary }]}>
                    {level.level === 1 ? "Bronze" : level.level === 2 ? "Silver" : "Gold"}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.requirement,
                  { color: index < unlockedLevel ? theme.textSecondary : theme.textTertiary },
                ]}
              >
                {index < unlockedLevel ? level.requirement : "Unlock previous level to reveal"}
              </Text>
              {index < unlockedLevel && (
                <View
                  style={[
                    styles.statusContainer,
                    {
                      backgroundColor: index === unlockedLevel - 1 ? theme.accent + "40" : theme.success + "40",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.status,
                      {
                        color: index === unlockedLevel - 1 ? theme.accent : theme.success,
                      },
                    ]}
                  >
                    {index === unlockedLevel - 1 ? "In Progress" : "Completed"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

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
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trophyName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trophyDescription: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  levelsContainer: {
    padding: 16,
  },
  levelCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockedCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  medalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  levelTitleContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  medalType: {
    fontSize: 14,
    marginTop: 4,
  },
  requirement: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  statusContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
  },
})

export default TrophyDetails

