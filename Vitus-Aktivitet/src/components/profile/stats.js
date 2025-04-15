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
  Alert,
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
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";
import Achievements from "./achievements";

const TABS = ["STATS", "MILEPÆLER"];

const Stats = () => {
  const { userId } = useContext(UserContext); // Get the logged-in user's ID
  const [activeTab, setActiveTab] = useState("STATS");
  const [totalSteps, setTotalSteps] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [eventsParticipated, setEventsParticipated] = useState(0); // Default to 0 since events are commented out
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(7500);
  const [avatarSelection, setAvatarSelection] = useState(null);
  const [userName, setUserName] = useState(""); // State to store the user's name
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, accentColor } = useTheme();

  useEffect(() => {
    if (route.params?.initialTab && TABS.includes(route.params.initialTab)) {
      setActiveTab(route.params.initialTab);
    }
    if (userId) {
      loadStatsData();
      loadAvatarSelection();
    }
  }, [route.params?.initialTab, userId]);

  const loadStatsData = async () => {
    if (!userId) return;

    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Fetch user data (including avatar and name)
        let userData = { user: { avatar: null, name: "Unknown" } }; // Default fallback
        try {
          const userResponse = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/user`, {
            withCredentials: true,
          });
          userData = userResponse.data;
          console.log("User data fetched successfully:", userData.user);
        } catch (userError) {
          console.error("Failed to fetch user data:", userError);
          if (userError.response && userError.response.status === 500) {
            Alert.alert("Server Error", "Unable to load user data. Using default values.");
          }
        }
        setAvatarSelection(userData.user.avatar ? { type: "photo", value: userData.user.avatar } : null);
        setUserName(userData.user.name || "Unknown"); // Set the user's name

        // Fetch step activity
        let stepActivities = []; // Default fallback
        try {
          const stepResponse = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/step-activity`, {
            withCredentials: true,
          });
          stepActivities = stepResponse.data.data;
          console.log("Step activity fetched successfully:", stepActivities);
        } catch (stepError) {
          console.error("Failed to fetch step activity:", stepError);
          if (stepError.response && stepError.response.status === 500) {
            Alert.alert("Server Error", "Unable to load step activity. Using default values.");
          }
        }
        const totalHistoricalSteps = stepActivities.reduce((sum, activity) => sum + (activity.step_count || 0), 0);
        setTotalSteps(totalHistoricalSteps);

        // Comment out events fetch and use fallback
        // let userEvents = []; // Default fallback
        // try {
        //   const eventsResponse = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/events`, {
        //     withCredentials: true,
        //   });
        //   userEvents = eventsResponse.data;
        //   console.log("Events fetched successfully:", userEvents);
        // } catch (eventsError) {
        //   console.error("Failed to fetch events:", eventsError);
        //   if (eventsError.response && eventsError.response.status === 500) {
        //     Alert.alert("Server Error", "Unable to load events. Using default values.");
        //   }
        // }
        // setEventsParticipated(userEvents.length);
        setEventsParticipated(0); // Temporary fallback since events are commented out

        // Assume daily goal (fetch from user data if stored in DB)
        setDailyGoal(7500); // Default, adjust if stored in [USER] table

        // Calculate daily progress
        const latestActivity = stepActivities[0] || { step_count: 0 };
        const currentSteps = latestActivity.step_count || 0;
        setDailyGoalProgress(Math.min((currentSteps / dailyGoal) * 100, 100));

        // Comment out streaks fetch and use fallback
        // const streakResponse = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/user/streaks`, { withCredentials: true });
        // setBestStreak(streakResponse.data.bestStreak || 0);
        setBestStreak(0); // Temporary fallback until server streak endpoint is fixed

        break;
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error);
        if (error.response && error.response.status === 503 && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000 * attempt)); // Backoff
          continue;
        } else {
          if (error.response && error.response.status === 401) {
            Alert.alert("Authentication Error", "Please log in to view stats.");
          } else if (error.response && error.response.status === 500) {
            Alert.alert("Server Error", "Unable to load stats. Please try again later.");
          } else if (error.response && error.response.status === 503) {
            Alert.alert(
              "Server Problem",
              "The server is temporarily unavailable. Stats will sync when the server is back.",
              [{ text: "OK" }]
            );
          }
          break;
        }
      }
    }
  };

  const loadAvatarSelection = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`${SERVER_CONFIG.getBaseUrl()}/user`, {
        withCredentials: true,
      });
      const userData = response.data.user;
      setAvatarSelection(userData.avatar ? { type: "photo", value: userData.avatar } : null);
      setUserName(userData.name || "Unknown"); // Update name here too for consistency
    } catch (error) {
      console.error("Error loading avatar selection:", error);
      if (error.response && error.response.status === 401) {
        Alert.alert("Authentication Error", "Please log in to load avatar.");
      } else if (error.response && error.response.status === 500) {
        Alert.alert("Server Error", "Unable to load avatar. Please try again later.");
      }
    }
  };

  useEffect(() => {
    const subscription = navigation.addListener("focus", () => {
      if (userId) {
        loadStatsData();
        loadAvatarSelection();
      }
    });
    return subscription;
  }, [navigation, userId]);

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
    return (
      <View style={styles.profileSection}>
        {avatarSelection?.type === "photo" ? (
          <Image
            source={{ uri: avatarSelection.value }}
            style={styles.avatar}
          />
        ) : (
          <Image
            source={require("../../../assets/avatars/memo_35.png")} // Default avatar
            style={styles.avatar}
          />
        )}
        <Text style={[styles.name, { color: theme.text }]}>{userName}</Text>
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
      {/* Events section commented out for now */}
      {/* <View style={styles.eventsSection}>
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
      </View> */}
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
  // Events-related styles commented out
  // eventsSection: {
  //   paddingHorizontal: 16,
  //   marginTop: 16,
  // },
  // eventsHeader: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginBottom: 12,
  // },
  // sectionTitle: {
  //   fontSize: 18,
  //   fontWeight: "600",
  // },
  // seeAllButton: {
  //   padding: 8,
  // },
  // seeAllText: {
  //   fontSize: 14,
  //   fontWeight: "500",
  // },
  // eventCard: {
  //   borderRadius: 20,
  //   padding: 16,
  //   marginBottom: 12,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  // eventContent: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   gap: 12,
  // },
  // eventIcon: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 8,
  // },
  // eventTextContainer: {
  //   flex: 1,
  // },
  // eventTitle: {
  //   fontSize: 16,
  //   fontWeight: "600",
  //   marginBottom: 4,
  // },
  // eventProgress: {
  //   fontSize: 14,
  //   opacity: 0.7,
  // },
  // emptyEventCard: {
  //   borderRadius: 20,
  //   padding: 16,
  //   marginBottom: 12,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  // emptyEventText: {
  //   fontSize: 16,
  //   textAlign: "center",
  // },
});

export default Stats;