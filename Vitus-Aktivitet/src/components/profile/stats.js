"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Easing,
  ScrollView, // Added ScrollView import
} from "react-native"
import { ChevronLeft, Settings, Zap, BarChart2, Check, TrendingUp, Award, Calendar } from "lucide-react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { LineChart } from "react-native-chart-kit"
import Achievements from "./achievements" // or import the desired redesign
import Activity from "./activity" // Import the Activity component

const TABS = ["STATS", "ACHIEVEMENTS", "ACTIVITY"]

const Stats = () => {
  const [activeTab, setActiveTab] = useState("STATS")
  const [selectedStat, setSelectedStat] = useState(null)
  const navigation = useNavigation()
  const route = useRoute()
  const { theme, accentColor } = useTheme()
  const scrollY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab)
    }
  }, [route.params?.initialTab])

  const statsData = [
    { icon: Zap, value: 7568, label: "Poeng", iconColor: "#FF9500", iconBgColor: "#FFF5E6", max: 10000 },
    { icon: BarChart2, value: 2, label: "Leaderboard", iconColor: "#007AFF", iconBgColor: "#E5F1FF", max: 100 },
    { icon: Check, value: 83, label: "Completed Events", iconColor: "#34C759", iconBgColor: "#E8F7EB", max: 100 },
    { icon: TrendingUp, value: 86, label: "Daily goal", iconColor: "#FF3B30", iconBgColor: "#FFE5E5", max: 100 },
    { icon: Award, value: 12, label: "Achievements", iconColor: "#5856D6", iconBgColor: "#EAEAFF", max: 50 },
    { icon: Calendar, value: 28, label: "Active Days", iconColor: "#FF2D55", iconBgColor: "#FFE5ED", max: 30 },
  ]

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("Setting")}>
        <Settings size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  )

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      <Image source={require("../../../assets/figure/aura.jpeg")} style={styles.avatar} />
      <Text style={[styles.name, { color: theme.text }]}>Hashem Sheikh</Text>
    </View>
  )

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
      {TABS.map((tab) => (
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tab}>
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            {tab}
          </Text>
          {activeTab === tab && <View style={[styles.tabUnderline, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderStatsContent = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.statsContainer}>
        {statsData.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.statCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedStat(stat)}
          >
            <AnimatedCircularProgress
              size={80}
              width={8}
              fill={(stat.value / stat.max) * 100}
              tintColor={stat.iconColor}
              backgroundColor={stat.iconBgColor}
              rotation={0}
              lineCap="round"
              duration={1000}
              easing={Easing.out(Easing.ease)}
            >
              {() => <stat.icon size={24} color={stat.iconColor} />}
            </AnimatedCircularProgress>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.chartContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Activity Overview</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={{
            backgroundColor: theme.surface,
            backgroundGradientFrom: theme.surface,
            backgroundGradientTo: theme.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            labelColor: (opacity = 1) => theme.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={[styles.recentActivitiesContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activities</Text>
        <View style={styles.noActivitiesContainer}>
          <Text style={[styles.noActivitiesText, { color: theme.textSecondary }]}>You have no recent activities.</Text>
          <TouchableOpacity style={[styles.startActivityButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.startActivityButtonText, { color: theme.background }]}>Start an Activity</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "STATS":
        return renderStatsContent()
      case "ACHIEVEMENTS":
        return <Achievements />
      case "ACTIVITY":
        return <Activity />
      default:
        return null
    }
  }

  const renderStatDetails = () => {
    if (!selectedStat) return null

    return (
      <View style={[styles.statDetailsContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedStat(null)}>
          <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
        </TouchableOpacity>
        <View style={styles.statDetailsContent}>
          <AnimatedCircularProgress
            size={120}
            width={12}
            fill={(selectedStat.value / selectedStat.max) * 100}
            tintColor={selectedStat.iconColor}
            backgroundColor={selectedStat.iconBgColor}
            rotation={0}
            lineCap="round"
          >
            {(fill) => (
              <View style={styles.statDetailsTextContainer}>
                <selectedStat.icon size={32} color={selectedStat.iconColor} />
                <Text style={[styles.statDetailsValue, { color: theme.text }]}>{selectedStat.value}</Text>
                <Text style={[styles.statDetailsLabel, { color: theme.textSecondary }]}>{selectedStat.label}</Text>
              </View>
            )}
          </AnimatedCircularProgress>
          <Text style={[styles.statDetailsDescription, { color: theme.text }]}>
            You've achieved {((selectedStat.value / selectedStat.max) * 100).toFixed(1)}% of your goal!
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}
      {renderProfileSection()}
      {renderTabs()}
      <View style={styles.contentContainer}>{renderContent()}</View>
      {renderStatDetails()}
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: "relative",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    width: Dimensions.get("window").width / 2 - 24,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTextContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  recentActivitiesContainer: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  noActivitiesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  noActivitiesText: {
    fontSize: 16,
    marginBottom: 16,
  },
  startActivityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startActivityButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statDetailsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statDetailsContent: {
    alignItems: "center",
  },
  statDetailsTextContainer: {
    alignItems: "center",
  },
  statDetailsValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },
  statDetailsLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  statDetailsDescription: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 24,
  },
  scrollContent: {
    paddingBottom: 32,
  },
})

export default Stats

