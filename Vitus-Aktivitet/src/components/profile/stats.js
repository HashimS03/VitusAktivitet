"use client";

import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  ChevronLeft,
  Settings,
  Zap,
  Check,
  TrendingUp,
} from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventContext } from "../events/EventContext";
import Achievements from "./achievements";
import Activity from "./activity";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";

// Define the avatars list (same as in AvatarSelection)
const avatars = [
  { id: 1, source: require("../../../assets/avatars/Avatar_Asian.png") },
  { id: 2, source: require("../../../assets/avatars/Avatar_Athlete.png") },
  { id: 3, source: require("../../../assets/avatars/Avatar_Dizzy.png") },
  { id: 4, source: require("../../../assets/avatars/Avatar_Gangster.png") },
  { id: 5, source: require("../../../assets/avatars/Avatar_Happy.png") },
  { id: 6, source: require("../../../assets/avatars/Avatar_Love.png") },
  { id: 7, source: require("../../../assets/avatars/Avatar_Sikh.png") },
  { id: 8, source: require("../../../assets/avatars/Avatar_Smirk.png") },
];

const TABS = ["STATS", "MILEPÆLER"];

const Stats = () => {
  const [activeTab, setActiveTab] = useState("STATS");
  const [totalSteps, setTotalSteps] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [eventsParticipated, setEventsParticipated] = useState(0);
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(7500);
  const [user, setUser] = useState(null); // State for user data (name, avatar, etc.)
  const [selectedAvatar, setSelectedAvatar] = useState(null); // State for predefined avatar ID
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, accentColor } = useTheme();
  const { activeEvents } = useContext(EventContext);

  useEffect(() => {
    if (route.params?.initialTab && TABS.includes(route.params.initialTab)) {
      setActiveTab(route.params.initialTab);
    }
    loadStatsData();
    loadUserData();
  }, [route.params?.initialTab]);

  const loadStatsData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const stepHistoryKeys = allKeys.filter((key) =>
        key.startsWith("stepHistory_")
      );
      let totalHistoricalSteps = 0;
      for (const key of stepHistoryKeys) {
        const steps = await AsyncStorage.getItem(key);
        totalHistoricalSteps += steps ? parseInt(steps) : 0;
      }
      setTotalSteps(totalHistoricalSteps);

      const currentStreak = await AsyncStorage.getItem("currentStreak");
      const storedBestStreak =
        (await AsyncStorage.getItem("bestStreak")) || currentStreak || "0";
      setBestStreak(parseInt(storedBestStreak) || 0);

      const participatedEvents = JSON.parse(
        (await AsyncStorage.getItem("participatedEvents")) || "[]"
      );
      setEventsParticipated(participatedEvents.length);

      const storedGoal = await AsyncStorage.getItem("dailyGoal");
      const goal = storedGoal ? JSON.parse(storedGoal) : 7500;
      setDailyGoal(goal);

      const stepCount = await AsyncStorage.getItem("stepCount");
      const currentSteps = stepCount ? parseInt(stepCount) : 0;
      setDailyGoalProgress(Math.min((currentSteps / goal) * 100, 100));
    } catch (error) {
      console.error("Error loading stats data:", error);
    }
  };

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found in AsyncStorage");
        return;
      }

      const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        console.log("User data fetched:", response.data.user); // Add this log
        setUser(response.data.user);
        if (response.data.user.avatar_type === "predefined") {
          setSelectedAvatar(parseInt(response.data.user.avatar));
        }
      } else {
        console.error("Failed to fetch user data:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const subscription = navigation.addListener("focus", () => {
      loadStatsData();
      loadUserData();
    });
    return subscription;
  }, [navigation]);

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

  const renderProfileSection = () => {
    const selectedAvatarObj = selectedAvatar
      ? avatars.find((avatar) => avatar.id === selectedAvatar)
      : null;

    return (
      <View style={styles.profileSection}>
        {user?.avatar_type === "photo" && user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            onError={(e) =>
              console.log("Image load error:", e.nativeEvent.error)
            }
          />
        ) : user?.avatar_type === "predefined" && selectedAvatarObj ? (
          <Image source={selectedAvatarObj.source} style={styles.avatar} />
        ) : (
          <Image
            source={require("../../../assets/avatars/memo_35.png")}
            style={styles.avatar}
          />
        )}
        <Text style={[styles.name, { color: theme.text }]}>
          {user?.name || "Navn"}
        </Text>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[styles.tab, { flex: 1 }]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab ? accentColor : theme.textSecondary,
                textAlign: "center",
              },
            ]}
          >
            {tab}
          </Text>
          {activeTab === tab && (
            <View
              style={[styles.tabUnderline, { backgroundColor: accentColor }]}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const statsCards = [
    {
      icon: Zap,
      value: totalSteps.toLocaleString(),
      label: "Total Skritt",
      iconColor: "#FF9500",
      iconBgColor: "#FFF5E6",
      progress: null,
    },
    {
      icon: MaterialCommunityIcons,
      iconName: "fire",
      value: bestStreak,
      label: "Best Streak",
      iconColor: "#007AFF",
      iconBgColor: "#E5F1FF",
      progress: null,
    },
    {
      icon: Check,
      value: eventsParticipated,
      label: "Hendelser Deltatt",
      iconColor: "#34C759",
      iconBgColor: "#E8F7EB",
      progress: null,
    },
    {
      icon: TrendingUp,
      value: `${Math.round(dailyGoalProgress)}%`,
      label: "Daglig Mål",
      iconColor: "#FF3B30",
      iconBgColor: "#FFE5E5",
      progress: dailyGoalProgress,
    },
  ];

  const renderStatsContent = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.statsContainer}>
        {statsCards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.statCard, { backgroundColor: theme.surface }]}
            onPress={() => console.log(`${card.label} pressed`)}
          >
            <View style={styles.cardContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: card.iconBgColor },
                ]}
              >
                {card.icon === MaterialCommunityIcons ? (
                  <card.icon
                    name={card.iconName}
                    size={24}
                    color={card.iconColor}
                  />
                ) : (
                  <card.icon size={24} color={card.iconColor} />
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {card.value}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  {card.label}
                </Text>
              </View>
            </View>
            {card.progress !== null && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: card.iconColor,
                        width: `${card.progress}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.eventsSection}>
        <View style={styles.eventsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Nylige hendelser
          </Text>
          {activeEvents.length > 3 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Events")}
              style={styles.seeAllButton}
            >
              <Text style={[styles.seeAllText, { color: accentColor }]}>
                Se alt
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {activeEvents.length > 0 ? (
          activeEvents.slice(0, 3).map((event, index) => (
            <View
              key={index}
              style={[styles.eventCard, { backgroundColor: theme.surface }]}
            >
              <View style={styles.eventContent}>
                <Image
                  source={require("../../../assets/trophy_icon.png")}
                  style={styles.eventIcon}
                />
                <View style={styles.eventTextContainer}>
                  <Text style={[styles.eventTitle, { color: theme.text }]}>
                    {event.title}
                  </Text>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: accentColor,
                          width: `${(event.progress || 0) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.eventProgress,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Complete {Math.round((event.progress || 0) * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View
            style={[styles.emptyEventCard, { backgroundColor: theme.surface }]}
          >
            <Text
              style={[styles.emptyEventText, { color: theme.textSecondary }]}
            >
              Ingen hendelser opprettet
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "STATS":
        return renderStatsContent();
      case "MILEPÆLER":
        return <Achievements />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {renderHeader()}
      {renderProfileSection()}
      {renderTabs()}
      <View style={styles.contentContainer}>{renderContent()}</View>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 0,
    alignItems: "center",
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
    paddingBottom: 16,
  },
  statCard: {
    width: Dimensions.get("window").width / 2 - 24,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  eventsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllButton: {
    padding: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  eventCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  eventTextContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventProgress: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyEventCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyEventText: {
    fontSize: 16,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 32,
  },
});

export default Stats;
