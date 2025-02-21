"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  Easing,
  TextInput,
  Modal,
  Switch,
} from "react-native";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Search,
  X,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SEGMENT_OPTIONS = ["Daily", "Weekly", "Monthly", "All Time"];

const Leaderboard = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedSegment, setSelectedSegment] = useState("Daily");
  const [filterOption, setFilterOption] = useState("All");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, isDarkMode, toggleTheme, accentColor } = useTheme();
  const [leaderboardType, setLeaderboardType] = useState("General");
  const [showLeaderboardTypeDropdown, setShowLeaderboardTypeDropdown] =
    useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [hasJoinedLeaderboard, setHasJoinedLeaderboard] = useState(false);
  const [showJoinAlert, setShowJoinAlert] = useState(false);
  const [testMode, setTestMode] = useState(true); // Activate test mode temporarily

  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    if (testMode) {
      setIsFirstTime(true); // Always show for testing
    } else {
      try {
        const hasSeenLeaderboard = await AsyncStorage.getItem(
          "hasSeenLeaderboard"
        );
        if (hasSeenLeaderboard === "true") {
          setIsFirstTime(false);
        }
      } catch (error) {
        console.error("Error checking first time user:", error);
      }
    }
  };

  const handleJoinLeaderboard = () => {
    setShowJoinAlert(true);
  };

  const handleConfirmJoin = async () => {
    try {
      await AsyncStorage.setItem("hasSeenLeaderboard", "true");
      setIsFirstTime(false);
      setHasJoinedLeaderboard(true);
      setShowJoinAlert(false);
    } catch (error) {
      console.error("Error saving leaderboard status:", error);
    }
  };

  const generalLeaderboardData = useMemo(
    () => [
      {
        id: "1",
        name: "Ho Daniel",
        points: 2000,
        department: "IT",
        avatar: require("../../../assets/figure/daniel.png"),
        change: 0,
      },
      {
        id: "2",
        name: "Hashem",
        points: 1500,
        department: "HR",
        avatar: require("../../../assets/figure/hashem.png"),
        change: 2,
      },
      {
        id: "3",
        name: "Sarim",
        points: 1200,
        department: "Finance",
        avatar: require("../../../assets/figure/sarim.png"),
        change: -1,
      },
      {
        id: "4",
        name: "Sjartan",
        points: 950,
        department: "IT",
        avatar: require("../../../assets/figure/avatar1.jpg"),
        change: 3,
      },
      {
        id: "5",
        name: "Ahmed",
        points: 920,
        department: "HR",
        avatar: require("../../../assets/figure/avatar2.jpg"),
        change: -2,
      },
    ],
    []
  );

  const eventLeaderboardData = useMemo(
    () => [
      {
        id: "1",
        name: "Emma",
        points: 1800,
        department: "IT",
        avatar: require("../../../assets/figure/avatar3.jpg"),
        change: 2,
      },
      {
        id: "2",
        name: "Lars",
        points: 1600,
        department: "Finance",
        avatar: require("../../../assets/figure/avatar4.jpeg"),
        change: 1,
      },
      {
        id: "3",
        name: "Sofia",
        points: 1400,
        department: "HR",
        avatar: require("../../../assets/figure/avatar5.jpeg"),
        change: 3,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    const typeFilteredData =
      leaderboardType === "General"
        ? generalLeaderboardData
        : eventLeaderboardData;

    return typeFilteredData
      .filter(
        (item) =>
          (filterOption === "All" || item.department === filterOption) &&
          (searchQuery === "" ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => b.points - a.points);
  }, [
    filterOption,
    searchQuery,
    leaderboardType,
    generalLeaderboardData,
    eventLeaderboardData,
  ]);

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch);
    Animated.timing(searchAnimation, {
      toValue: showSearch ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [showSearch, searchAnimation]);

  const renderLeaderboardItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={[
          styles.leaderboardItem,
          {
            backgroundColor: theme.surface,
            transform: [
              {
                translateX: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.surfaceVariant, theme.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: theme.text }]}>
            {index + 1}
          </Text>
        </View>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, { color: theme.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.departmentText, { color: theme.textSecondary }]}>
            {item.department}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={[styles.pointsText, { color: accentColor }]}>
            {item.points}
          </Text>

          {item.change !== 0 && (
            <View style={styles.changeContainer}>
              {item.change > 0 ? (
                <TrendingUp size={12} color={accentColor} />
              ) : (
                <TrendingDown size={12} color={theme.error} />
              )}
              <Text
                style={[
                  styles.changeText,
                  { color: item.change > 0 ? accentColor : theme.error },
                ]}
              >
                {Math.abs(item.change)}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    ),
    [theme, searchAnimation, accentColor]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        {hasJoinedLeaderboard ? (
          <>
            <BlurView
              intensity={100}
              style={StyleSheet.absoluteFill}
              tint={isDarkMode ? "dark" : "light"}
            />

            <View style={styles.headerContent}>
              <View style={styles.titleWrapper}>
                <TouchableOpacity
                  style={styles.titleContainer}
                  onPress={() => setShowLeaderboardTypeDropdown(true)}
                >
                  <Text
                    style={[
                      styles.title,
                      {
                        color:
                          leaderboardType === "General"
                            ? accentColor
                            : theme.text,
                      },
                    ]}
                  >
                    {leaderboardType === "General" ? "General " : "Event "}
                  </Text>
                  <ChevronDown
                    size={16}
                    color={theme.text}
                    style={styles.titleIcon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    { backgroundColor: theme.surfaceVariant },
                  ]}
                  onPress={toggleSearch}
                >
                  <Search size={20} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    { backgroundColor: theme.surfaceVariant },
                  ]}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Text
                    style={[styles.filterButtonText, { color: theme.text }]}
                  >
                    {filterOption}
                  </Text>
                  <ChevronDown size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>
            <Animated.View
              style={[
                styles.searchContainer,
                {
                  height: searchAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 50],
                  }),
                  opacity: searchAnimation,
                },
              ]}
            >
              <BlurView
                intensity={100}
                style={StyleSheet.absoluteFill}
                tint={isDarkMode ? "dark" : "light"}
              />
              <View
                style={[
                  styles.searchInputContainer,
                  { backgroundColor: theme.surfaceVariant },
                ]}
              >
                <Search size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search users..."
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
            <View style={styles.segmentedControl}>
              {SEGMENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.segmentOption,
                    selectedSegment === option && {
                      backgroundColor: accentColor,
                    },
                  ]}
                  onPress={() => setSelectedSegment(option)}
                >
                  <Text
                    style={[
                      styles.segmentOptionText,
                      {
                        color:
                          selectedSegment === option ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.titleWrapper}></View>
        )}
      </View>
    ),
    [
      theme,
      isDarkMode,
      searchAnimation,
      filterOption,
      selectedSegment,
      searchQuery,
      toggleSearch,
      leaderboardType,
      accentColor,
      hasJoinedLeaderboard,
    ]
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView
          intensity={100}
          style={StyleSheet.absoluteFill}
          tint={isDarkMode ? "dark" : "light"}
        />
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Filter Options
          </Text>
          {["All", "IT", "HR", "Finance"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                filterOption === option && {
                  backgroundColor: `${accentColor}20`,
                },
              ]}
              onPress={() => {
                setFilterOption(option);
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  {
                    color: filterOption === option ? accentColor : theme.text,
                  },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.themeToggleContainer}>
            <Text style={[styles.themeToggleText, { color: theme.text }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.surfaceVariant,
                true: accentColor,
              }}
              thumbColor={isDarkMode ? theme.background : theme.text}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderFirstTimeOverlay = () => (
    <BlurView
      intensity={80}
      style={StyleSheet.absoluteFillObject}
      tint={isDarkMode ? "dark" : "light"}
    >
      <View style={styles.overlayContent}>
        <Text style={[styles.overlayTitle, { color: theme.text }]}>
          Join the Leaderboard
        </Text>
        <Text
          style={[styles.overlayDescription, { color: theme.textSecondary }]}
        >
          Participate in the leaderboard to compare your progress with others!
        </Text>
        <TouchableOpacity
          style={[styles.overlayButton, { backgroundColor: accentColor }]}
          onPress={handleJoinLeaderboard}
        >
          <Text style={styles.overlayButtonText}>Join Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.overlayButton,
            { backgroundColor: theme.surfaceVariant },
          ]}
          onPress={() => setIsFirstTime(false)}
        ></TouchableOpacity>
      </View>
    </BlurView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {renderHeader()}
      <AnimatedFlatList
        data={filteredData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
      {hasJoinedLeaderboard && (
        <Modal
          visible={showLeaderboardTypeDropdown}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLeaderboardTypeDropdown(false)}
        >
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowLeaderboardTypeDropdown(false)}
          >
            <BlurView
              intensity={20}
              style={[styles.dropdownContent]}
              tint={isDarkMode ? "dark" : "light"}
            >
              {["General", "Event"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    leaderboardType === option && {
                      backgroundColor: `${accentColor}20`,
                    },
                  ]}
                  onPress={() => {
                    setLeaderboardType(option);
                    setShowLeaderboardTypeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      {
                        color:
                          leaderboardType === option ? accentColor : theme.text,
                      },
                    ]}
                  >
                    {option} Leaderboard
                  </Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          </TouchableOpacity>
        </Modal>
      )}
      {renderFilterModal()}
      {isFirstTime && renderFirstTimeOverlay()}
      {!isFirstTime && !hasJoinedLeaderboard && (
        <BlurView
          intensity={80}
          style={StyleSheet.absoluteFill}
          tint={isDarkMode ? "dark" : "light"}
        ></BlurView>
      )}
      {showJoinAlert && (
        <View style={styles.alertOverlay}>
          <BlurView
            intensity={80}
            style={StyleSheet.absoluteFill}
            tint={isDarkMode ? "dark" : "light"}
          />
          <View style={styles.alertContainer}>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Join Leaderboard</Text>
              <Text style={styles.alertMessage}>
                Would you like to join the leaderboard and compare your progress
                with others?
              </Text>
              <View style={styles.alertButtons}>
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonLeft]}
                  onPress={() => setShowJoinAlert(false)}
                >
                  <Text
                    style={[styles.alertButtonText, { color: accentColor }]}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
                <View style={styles.alertButtonSeparator} />
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonRight]}
                  onPress={handleConfirmJoin}
                >
                  <Text
                    style={[styles.alertButtonText, { color: accentColor }]}
                  >
                    Join
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  titleWrapper: {
    position: "relative",
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginRight: 8,
  },
  titleIcon: {
    marginTop: 2,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownContent: {
    position: "absolute",
    top: 85,
    left: 20,
    right: 20,
    maxWidth: 250,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    padding: 16,
    borderRadius: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 20,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  segmentedControl: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  segmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  segmentOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
  },
  departmentText: {
    fontSize: 14,
  },
  pointsContainer: {
    alignItems: "flex-end",
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.8,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 16,
  },
  themeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  themeToggleText: {
    fontSize: 16,
  },
  overlayContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  overlayDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  overlayButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  overlayButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  blurredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  blurredText: {
    fontSize: 18,
    marginBottom: 16,
  },
  joinButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  alertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  alertContainer: {
    width: "70%",
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    overflow: "hidden",
  },
  alertContent: {
    width: "100%",
  },
  alertTitle: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    paddingTop: 20,
    paddingBottom: 10,
  },
  alertMessage: {
    textAlign: "center",
    fontSize: 13,
    color: "#666666",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alertButtons: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#CCCCCC",
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertButtonLeft: {
    borderRightWidth: 0.5,
    borderRightColor: "#CCCCCC",
  },
  alertButtonRight: {},
  alertButtonText: {
    fontSize: 17,
    fontWeight: "500",
  },
  alertButtonSeparator: {
    width: 0.5,
    backgroundColor: "#CCCCCC",
  },
});

export default Leaderboard;
