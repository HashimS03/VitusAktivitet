import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import {
  ChevronLeft,
  Settings,
  Zap,
  BarChart2,
  Check,
  TrendingUp,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";


const TABS = ["STATS", "ACHIEVEMENTS", "ACTIVITY"];

const Stats = () => {
  const [activeTab, setActiveTab] = useState("STATS");
  const navigation = useNavigation();

  const statsData = [
    {
      icon: Zap,
      value: "7 568",
      label: "Poeng",
      iconColor: "#FF9500",
      iconBgColor: "#FFF5E6",
    },
    {
      icon: BarChart2,
      value: "#2",
      label: "Leaderboard",
      iconColor: "#007AFF",
      iconBgColor: "#E5F1FF",
    },
    {
      icon: Check,
      value: "83%",
      label: "Completed Events",
      iconColor: "#34C759",
      iconBgColor: "#E8F7EB",
    },
    {
      icon: TrendingUp,
      value: "86%",
      label: "Daily goal",
      iconColor: "#FF3B30",
      iconBgColor: "#FFE5E5",
    },
  ];

  const races = [
    {
      title: "LØP LØP LØP!",
      progress: 28,
      image: require("../../../assets/event-illustration.png"),
    },
    {
      title: "Ta Meg Igjen",
      progress: 35,
      image: require("../../../assets/event-illustration.png"),
    },
    {
      title: "Første Mann Til Mølla",
      progress: 40,
      image: require("../../../assets/event-illustration.png"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Settings size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsSection}>
          <Image
            source={require("../../../assets/figure/aura.jpeg")}
            style={styles.avatar}
          />
          <Text style={styles.name}>Hashem Sheikh</Text>
        </View>

        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: stat.iconBgColor },
                ]}
              >
                <stat.icon size={24} color={stat.iconColor} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Races Section with White Container */}
        <View style={styles.racesContainer}>
          <Text style={styles.sectionTitle}>Latest Races</Text>
          {races.map((race, index) => (
            <View key={index} style={styles.raceItem}>
              <Image source={race.image} style={styles.raceImage} />
              <View style={styles.raceContent}>
                <Text style={styles.raceTitle}>{race.title}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${race.progress}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.progressText}>{race.progress}% Complete</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5F1FF",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#00ADB5",
  },
  tabText: {
    fontSize: 14,
    color: "#9e9fa1",
  },
  activeTabText: {
    color: "#00ADB5",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#9e9fa1",
  },
  /* White Container for Latest Races */
  racesContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  raceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  raceImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  raceContent: {
    flex: 1,
    marginRight: 12,
  },
  raceTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: "#9e9fa1",
    width: 80,
  },
});

export default Stats;
