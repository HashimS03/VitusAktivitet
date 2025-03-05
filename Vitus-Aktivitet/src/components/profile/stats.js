"use client";

import { useState, useEffect, useRef } from "react";
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
} from "react-native";
import {
  ChevronLeft,
  Settings,
  Zap,
  BarChart2,
  Check,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { LineChart } from "react-native-chart-kit";
import Achievements from "./achievements"; // or import the desired redesign
import Activity from "./activity"; // Import the Activity component

const TABS = ["STATS", "GJØREMÅL", "LOGG"];

const Stats = () => {
  const [activeTab, setActiveTab] = useState("STATS");
  const [selectedStat, setSelectedStat] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, accentColor } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const statsData = [
    {
      icon: Zap,
      value: 7568,
      label: "Poeng",
      iconColor: "#FF9500",
      iconBgColor: "#FFF5E6",
      max: 10000,
    },
    {
      icon: BarChart2,
      value: 99,
      label: "Ledertavle",
      iconColor: "#007AFF",
      iconBgColor: "#E5F1FF",
      max: 100,
    },
    {
      icon: Check,
      value: 83,
      label: "Utførte hendelser",
      iconColor: "#34C759",
      iconBgColor: "#E8F7EB",
      max: 100,
    },
    {
      icon: TrendingUp,
      value: 86,
      label: "Daglige mål",
      iconColor: "#FF3B30",
      iconBgColor: "#FFE5E5",
      max: 100,
    },
    {
      icon: Award,
      value: 12,
      label: "Gjøremål",
      iconColor: "#5856D6",
      iconBgColor: "#EAEAFF",
      max: 50,
    },
    {
      icon: Calendar,
      value: 28,
      label: "Aktive dager",
      iconColor: "#FF2D55",
      iconBgColor: "#FFE5ED",
      max: 30,
    },
  ];

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={24} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.navigate("Setting")}
      >
        <Settings size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      <Image
        source={require("../../../assets/avatars/memo_35.png")}
        style={styles.avatar}
      />
      <Text style={[styles.name, { color: theme.text }]}>Navn</Text>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={styles.tab}
        >
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
          {activeTab === tab && (
            <View
              style={[styles.tabUnderline, { backgroundColor: theme.primary }]}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

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
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "STATS":
        return renderStatsContent();
      case "GJØREMÅL":
        return <Achievements />;
      case "LOGG":
        return <Activity />;
      default:
        return null;
    }
  };

  const renderStatDetails = () => {
    if (!selectedStat) return null;

    return (
      <View
        style={[
          styles.statDetailsOverlay,
          { backgroundColor: "rgba(0,0,0,0.5)" },
        ]}
      >
        <View
          style={[
            styles.statDetailsContainer,
            { backgroundColor: theme.surface },
          ]}
        >
          <View style={styles.statDetailsHeader}>
            <Text style={[styles.statDetailsTitle, { color: theme.text }]}>
              {selectedStat.label}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.border }]}
              onPress={() => setSelectedStat(null)}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>
                Lukk
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statDetailsContent}>
            <AnimatedCircularProgress
              size={200}
              width={12}
              fill={(selectedStat.value / selectedStat.max) * 100}
              tintColor={selectedStat.iconColor}
              backgroundColor={`${selectedStat.iconColor}20`}
              rotation={0}
              lineCap="round"
            >
              {() => (
                <View style={styles.progressContent}>
                  <selectedStat.icon
                    size={32}
                    color={selectedStat.iconColor}
                    style={styles.statIcon}
                  />
                  <Text
                    style={[styles.statDetailsValue, { color: theme.text }]}
                  >
                    {selectedStat.value}
                  </Text>
                  <Text
                    style={[
                      styles.statDetailsLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {selectedStat.label}
                  </Text>
                </View>
              )}
            </AnimatedCircularProgress>

            <Text style={styles.achievementText}>
              Du har nådd{" "}
              <Text
                style={[
                  styles.achievementPercent,
                  { color: selectedStat.iconColor },
                ]}
              >
                {((selectedStat.value / selectedStat.max) * 100).toFixed(1)}%
              </Text>{" "}
              av ditt mål!
            </Text>

            <View style={[styles.goalPill, { backgroundColor: theme.border }]}>
              <Text style={[styles.goalText, { color: theme.textSecondary }]}>
                Mål: {selectedStat.max} {selectedStat.label}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {renderHeader()}
      {renderProfileSection()}
      {renderTabs()}
      <View style={styles.contentContainer}>{renderContent()}</View>
      {renderStatDetails()}
    </SafeAreaView>
  );
};

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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  statDetailsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },

  statDetailsContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },

  statDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },

  statDetailsTitle: {
    fontSize: 24,
    fontWeight: "600",
  },

  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  statDetailsContent: {
    alignItems: "center",
    paddingBottom: 24,
  },

  progressContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    marginBottom: 8,
  },

  statDetailsValue: {
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 4,
  },

  statDetailsLabel: {
    fontSize: 16,
    opacity: 0.7,
  },

  achievementText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 32,
    marginBottom: 24,
  },

  achievementPercent: {
    fontWeight: "600",
  },

  goalPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  goalText: {
    fontSize: 16,
    fontWeight: "500",
  },
  scrollContent: {
    paddingBottom: 32,
  },
});

export default Stats;
