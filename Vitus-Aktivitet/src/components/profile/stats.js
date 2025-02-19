"use client";

import { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import Achievements from "./achievements";
import Activity from "./activity";
import { FlatList } from "react-native"; // Import FlatList

const TABS = ["STATS", "ACHIEVEMENTS", "ACTIVITY"];

const Stats = () => {
  const [activeTab, setActiveTab] = useState("STATS");
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, accentColor } = useTheme();

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

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
  const renderStatsContent = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
    >
      {statsData.map((stat, index) => (
        <View
          key={index}
          style={[styles.statCard, { backgroundColor: theme.surface }]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: stat.iconBgColor },
            ]}
          >
            <stat.icon size={28} color={stat.iconColor} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Settings size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={require("../../../assets/figure/aura.jpeg")}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: theme.text }]}>Hashem Sheikh</Text>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: accentColor },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? accentColor : theme.textSecondary,
                },
              ]}
            >
              {tab}
            </Text>
            <View
              style={[
                styles.tabUnderline,
                {
                  backgroundColor:
                    activeTab === tab ? accentColor : "transparent",
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contentContainer}>
        {activeTab === "STATS" && renderStatsContent()}
        {activeTab === "ACHIEVEMENTS" && <Achievements />}
        {activeTab === "ACTIVITY" && <Activity />}
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contentContainer: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    marginBottom: 24,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  tabText: {
    fontSize: 14,
  },
  tabUnderline: {
    height: 2,
    width: "80%",
    marginTop: 8,
    borderRadius: 1,
    alignSelf: "center",
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15, // Mer luft
    borderRadius: 16,
    marginBottom: 16, // Litt mer spacing mellom kortene
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1, // Gir mer definisjon
    borderColor: "#E5E5E5", // Lett kantlinje
  },
  iconContainer: {
    width: 55, // Større ikonholder
    height: 55,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24, // Gjør tallene mer markante
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
  },
});

export default Stats;
