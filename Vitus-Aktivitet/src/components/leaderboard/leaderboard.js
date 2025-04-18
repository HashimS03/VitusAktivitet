"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useContext,
} from "react";
import { Platform } from "react-native";
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
  Alert,
} from "react-native";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Search,
  X,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SEGMENT_OPTIONS = ["Daglig", "Ukentlig", "Månedlig", "All Tid"];

const Leaderboard = ({ route }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedSegment, setSelectedSegment] = useState("Daily");
  const [filterOption, setFilterOption] = useState("Alle");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, isDarkMode, toggleTheme, accentColor } = useTheme();
  const { activeEvents, pastEvents, deleteEvent } = useContext(EventContext);
  const [leaderboardType, setLeaderboardType] = useState("General");
  const [selectedEvent, setSelectedEvent] = useState(
    route.params?.eventId
      ? activeEvents.find((event) => event.id === route.params.eventId) ||
          pastEvents.find((event) => event.id === route.params.eventId)
      : null
  );
  const [showLeaderboardTypeDropdown, setShowLeaderboardTypeDropdown] =
    useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [hasJoinedLeaderboard, setHasJoinedLeaderboard] = useState(false);
  const [showJoinAlert, setShowJoinAlert] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [generalLeaderboardData, setGeneralLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchAnimation = useRef(new Animated.Value(0)).current;

  // Hent leaderboard-data fra API
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(
          "Fetching leaderboard data from:",
          `${SERVER_CONFIG.getBaseUrl()}/leaderboard`
        ); // Logg URL-en
        const response = await axios.get(
          `${SERVER_CONFIG.getBaseUrl()}/leaderboard`,
          { withCredentials: true }
        );
        console.log("Leaderboard API response:", response.data); // Logg responsen
        if (response.data.success) {
          setGeneralLeaderboardData(response.data.data);
        } else {
          setError(response.data.message || "Kunne ikke hente ledertavle.");
        }
      } catch (error) {
        console.error(
          "Leaderboard fetch error:",
          error.response?.data || error.message
        );
        setError("Kunne ikke hente ledertavle. Prøv igjen senere.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
    const intervalId = setInterval(fetchLeaderboardData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Sjekk om brukeren er førstegangsbruker
  useEffect(() => {
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = async () => {
    if (testMode) {
      setIsFirstTime(true);
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

  const eventLeaderboardData = useMemo(() => {
    const allEvents = [...activeEvents, ...pastEvents];
    const leaderboardData = {};
    allEvents.forEach((event) => {
      const isEventFinished = new Date(event.end_date) < new Date();
      leaderboardData[event.id] = [
        {
          id: "1",
          name: "User 1",
          points: isEventFinished
            ? event.currentValue || 0
            : event.currentValue || 0,
          department: "Participant",
          avatar: require("../../../assets/figure/avatar3.jpg"),
          change: 0,
        },
        {
          id: "2",
          name: "User 2",
          points: isEventFinished
            ? Math.floor((event.currentValue || 0) * 0.8)
            : Math.floor((event.currentValue || 0) * 0.8),
          department: "Participant",
          avatar: require("../../../assets/figure/avatar4.jpeg"),
          change: 1,
        },
      ];
    });
    return leaderboardData;
  }, [activeEvents, pastEvents]);

  const filteredData = useMemo(() => {
    if (leaderboardType === "General") {
      return generalLeaderboardData
        .filter(
          (item) =>
            (filterOption === "Alle" || item.department === filterOption) &&
            (searchQuery === "" ||
              item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => b.points - a.points);
    } else if (selectedEvent) {
      return (eventLeaderboardData[selectedEvent.id] || [])
        .filter(
          (item) =>
            (filterOption === "Alle" || item.department === filterOption) &&
            (searchQuery === "" ||
              item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => b.points - a.points);
    } else {
      return [
        { type: "header", title: "Aktive hendelser" },
        ...activeEvents.map((event) => ({ type: "event", ...event })),
        { type: "header", title: "Utgåtte hendelser" },
        ...pastEvents.map((event) => ({ type: "event", ...event })),
      ];
    }
  }, [
    filterOption,
    searchQuery,
    leaderboardType,
    selectedEvent,
    generalLeaderboardData,
    eventLeaderboardData,
    activeEvents,
    pastEvents,
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
            backgroundColor: theme.surface || "#424242",
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
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: theme.text || "#FFFFFF" }]}>
            {index + 1}
          </Text>
        </View>
        <Image
          source={
            item.avatar
              ? { uri: item.avatar }
              : require("../../../assets/figure/avatar1.jpg")
          }
          style={styles.avatar}
        />
        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, { color: theme.text || "#FFFFFF" }]}>
            {item.name}
          </Text>
          <Text
            style={[
              styles.departmentText,
              { color: theme.textSecondary || "#B0B0B0" },
            ]}
          >
            {item.department}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text
            style={[styles.pointsText, { color: accentColor || "#00C2A8" }]}
          >
            {item.points}
          </Text>
          {item.change !== 0 && (
            <View style={styles.changeContainer}>
              {item.change > 0 ? (
                <TrendingUp size={12} color={accentColor || "#00C2A8"} />
              ) : (
                <TrendingDown size={12} color={theme.error || "#EF5350"} />
              )}
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      item.change > 0
                        ? accentColor || "#00C2A8"
                        : theme.error || "#EF5350",
                  },
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

  const renderEventItem = useCallback(
    ({ item }) => {
      const isEventFinished = new Date(item.end_date) < new Date();

      const renderRightActions = (progress, dragX) => {
        const trans = dragX.interpolate({
          inputRange: [0, 80],
          outputRange: [0, 80],
          extrapolate: "clamp",
        });
        return (
          <TouchableOpacity
            style={[
              styles.swipeButton,
              { backgroundColor: theme.error || "#EF5350" },
            ]}
            onPress={() => {
              Alert.alert(
                "Slett hendelse",
                "Er du sikker på at du vil slette denne hendelsen?",
                [
                  { text: "Avbryt", style: "cancel" },
                  {
                    text: "Slett",
                    style: "destructive",
                    onPress: () => deleteEvent(item.id),
                  },
                ]
              );
            }}
          >
            <Text style={styles.swipeButtonText}>Slett</Text>
          </TouchableOpacity>
        );
      };

      return (
        <Swipeable
          renderRightActions={isEventFinished ? renderRightActions : null}
          friction={2}
          rightThreshold={40}
          overshootRight={false}
          enabled={isEventFinished}
        >
          <TouchableOpacity
            style={[
              styles.eventItem,
              { backgroundColor: theme.surface || "#424242" },
            ]}
            onPress={() => setSelectedEvent(item)}
          >
            <Image
              source={require("../../../assets/trophy_icon.png")}
              style={styles.eventImage}
            />
            <View style={styles.eventInfo}>
              <Text
                style={[styles.eventName, { color: theme.text || "#FFFFFF" }]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.eventDate,
                  { color: theme.textSecondary || "#B0B0B0" },
                ]}
              >
                Mål: {item.goalValue} {item.selectedActivity?.unit || "km"}
              </Text>
              {isEventFinished && (
                <Text
                  style={[
                    styles.eventStatus,
                    { color: theme.error || "#EF5350" },
                  ]}
                >
                  (Utgått)
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [theme, deleteEvent]
  );

  const renderHeaderItem = ({ item }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text || "#FFFFFF" }]}>
        {item.title}
      </Text>
      {item.title === "Utgåtte hendelser" && pastEvents.length > 0 && (
        <TouchableOpacity
          style={[
            styles.clearButton,
            { backgroundColor: accentColor || "#00C2A8" },
          ]}
          onPress={() => {
            Alert.alert(
              "Fjern alle utgåtte resultater",
              "Er du sikker på at du vil fjerne alle utgåtte resultater?",
              [
                { text: "Avbryt", style: "cancel" },
                {
                  text: "Fjern",
                  style: "destructive",
                  onPress: () =>
                    pastEvents.forEach((event) => deleteEvent(event.id)),
                },
              ]
            );
          }}
        >
          <Text
            style={[
              styles.clearButtonText,
              { color: theme.background || "#FFFFFF" },
            ]}
          >
            Fjern alle
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item, index }) => {
    if (item.type === "header") {
      return renderHeaderItem({ item });
    } else if (item.type === "event") {
      return renderEventItem({ item });
    } else {
      return renderLeaderboardItem({ item, index });
    }
  };

  const renderEventSection = () => {
    if (!selectedEvent) {
      return (
        <AnimatedFlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id ? item.id : `${item.type}-${index}`
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <Text
              style={[
                styles.emptyText,
                { color: theme.textSecondary || "#B0B0B0" },
              ]}
            >
              Ingen hendelser tilgjengelig.
            </Text>
          }
        />
      );
    }

    const selectedLeaderboardData =
      eventLeaderboardData[selectedEvent.id] || [];
    const filteredLeaderboardData = selectedLeaderboardData
      .filter(
        (item) =>
          (filterOption === "Alle" || item.department === filterOption) &&
          (searchQuery === "" ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => b.points - a.points);

    return (
      <FlatList
        data={filteredLeaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text
            style={[
              styles.emptyText,
              { color: theme.textSecondary || "#B0B0B0" },
            ]}
          >
            Ingen resultater tilgjengelig for denne hendelsen.
          </Text>
        }
      />
    );
  };

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        {hasJoinedLeaderboard ? (
          <>
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                style={StyleSheet.absoluteFill}
                tint={isDarkMode ? "dark" : "light"}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: theme.background || "#1E1E1E" },
                ]}
              />
            )}
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
                            ? accentColor || "#00C2A8"
                            : theme.text || "#FFFFFF",
                      },
                    ]}
                  >
                    {leaderboardType === "General"
                      ? "Felles"
                      : selectedEvent
                      ? selectedEvent.title
                      : "Hendelser"}
                  </Text>
                  <ChevronDown
                    size={16}
                    color={theme.text || "#FFFFFF"}
                    style={styles.titleIcon}
                  />
                </TouchableOpacity>
                {leaderboardType === "Event" && selectedEvent && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedEvent(null)}
                  >
                    <Text
                      style={[
                        styles.backButtonText,
                        { color: accentColor || "#00C2A8" },
                      ]}
                    >
                      Tilbake til Hendelser
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    { backgroundColor: theme.surfaceVariant },
                  ]}
                  onPress={toggleSearch}
                >
                  <Search size={20} color={theme.text || "#FFFFFF"} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    { backgroundColor: theme.surfaceVariant },
                  ]}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: theme.text || "#FFFFFF" },
                    ]}
                  >
                    {filterOption}
                  </Text>
                  <ChevronDown size={20} color={theme.text || "#FFFFFF"} />
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
              {Platform.OS === "ios" ? (
                <BlurView
                  intensity={100}
                  style={StyleSheet.absoluteFill}
                  tint={isDarkMode ? "dark" : "light"}
                />
              ) : (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: theme.background || "#1E1E1E" },
                  ]}
                />
              )}
              <View
                style={[
                  styles.searchInputContainer,
                  { backgroundColor: theme.surfaceVariant },
                ]}
              >
                <Search size={20} color={theme.textSecondary || "#B0B0B0"} />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: theme.text || "#FFFFFF" },
                  ]}
                  placeholder="Søk..."
                  placeholderTextColor={theme.textSecondary || "#B0B0B0"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={20} color={theme.textSecondary || "#B0B0B0"} />
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
                      backgroundColor: accentColor || "#00C2A8",
                    },
                  ]}
                  onPress={() => setSelectedSegment(option)}
                >
                  <Text
                    style={[
                      styles.segmentOptionText,
                      {
                        color:
                          selectedSegment === option
                            ? "#FFFFFF"
                            : theme.text || "#FFFFFF",
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
      selectedEvent,
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
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={100}
            style={StyleSheet.absoluteFill}
            tint={isDarkMode ? "dark" : "light"}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isDarkMode ? "#000000" : "#FFFFFF" },
            ]}
          />
        )}
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.surface || "#2D2D2D" },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.text || "#FFFFFF" }]}>
            Filtervalg
          </Text>
          {["Alle", "IT", "HR", "Finans"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                filterOption === option && {
                  backgroundColor: `${(accentColor || "#00C2A8").replace(
                    "#",
                    ""
                  )}20`,
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
                    color:
                      filterOption === option
                        ? accentColor || "#00C2A8"
                        : theme.text || "#FFFFFF",
                  },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const renderFirstTimeOverlay = () => (
    <View style={StyleSheet.absoluteFillObject}>
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={80}
          style={StyleSheet.absoluteFill}
          tint={isDarkMode ? "dark" : "light"}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF" },
          ]}
        />
      )}
      <View style={styles.overlayContent}>
        <Text style={[styles.overlayTitle, { color: theme.text || "#FFFFFF" }]}>
          Bli med på ledertavlen
        </Text>
        <Text
          style={[
            styles.overlayDescription,
            { color: theme.textSecondary || "#B0B0B0" },
          ]}
        >
          Delta på ledertavlen for å sammenligne fremgangen din med andre!
        </Text>
        <TouchableOpacity
          style={[
            styles.overlayButton,
            { backgroundColor: accentColor || "#00C2A8" },
          ]}
          onPress={handleJoinLeaderboard}
        >
          <Text style={styles.overlayButtonText}>Bli med</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background || "#1E1E1E" },
      ]}
    >
      {renderHeader()}
      {leaderboardType === "Event" ? (
        renderEventSection()
      ) : error ? (
        <Text
          style={{
            color: theme.error || "#EF5350",
            textAlign: "center",
            padding: 20,
          }}
        >
          {error}
        </Text>
      ) : isLoading ? (
        <Text
          style={{
            color: theme.text || "#FFFFFF",
            textAlign: "center",
            padding: 20,
          }}
        >
          Laster ledertavle...
        </Text>
      ) : (
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
          ListEmptyComponent={
            <Text
              style={[
                styles.emptyText,
                { color: theme.textSecondary || "#B0B0B0" },
              ]}
            >
              Ingen data tilgjengelig.
            </Text>
          }
        />
      )}
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
            <View
              style={[
                styles.dropdownContainer,
                {
                  backgroundColor: theme.surface || "#2D2D2D",
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                  position: "absolute",
                  top: 80,
                  left: 20,
                  right: 20,
                  maxWidth: 250,
                  paddingVertical: 8,
                },
              ]}
            >
              {["General", "Event"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    leaderboardType === option && {
                      backgroundColor: `${(accentColor || "#00C2A8").replace(
                        "#",
                        ""
                      )}20`,
                    },
                  ]}
                  onPress={() => {
                    setLeaderboardType(option);
                    setSelectedEvent(null);
                    setShowLeaderboardTypeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      {
                        color:
                          leaderboardType === option
                            ? accentColor || "#00C2A8"
                            : theme.text || "#FFFFFF",
                      },
                    ]}
                  >
                    {option === "General" ? "Felles" : "Hendelse"} Ledertavle
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      {renderFilterModal()}
      {isFirstTime && renderFirstTimeOverlay()}
      {!isFirstTime && !hasJoinedLeaderboard && (
        <View style={StyleSheet.absoluteFill}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              style={StyleSheet.absoluteFill}
              tint={isDarkMode ? "dark" : "light"}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF" }]}
            />
          )}
        </View>
      )}
      {showJoinAlert && (
        <View style={styles.alertOverlay}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              style={StyleSheet.absoluteFill}
              tint={isDarkMode ? "dark" : "light"}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF" },
              ]}
            />
          )}
          <View
            style={[
              styles.alertContainer,
              { backgroundColor: theme.surface || "#2D2D2D" },
            ]}
          >
            <View style={styles.alertContent}>
              <Text
                style={[styles.alertTitle, { color: theme.text || "#FFFFFF" }]}
              >
                Bli med på ledertavlen
              </Text>
              <Text
                style={[
                  styles.alertMessage,
                  { color: theme.textSecondary || "#B0B0B0" },
                ]}
              >
                Ønsker du å bli med på ledertavlen og dele fremgangen din med
                andre?
              </Text>
              <View style={styles.alertButtons}>
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonLeft]}
                  onPress={() => setShowJoinAlert(false)}
                >
                  <Text
                    style={[
                      styles.alertButtonText,
                      { color: accentColor || "#00C2A8" },
                    ]}
                  >
                    Lukk
                  </Text>
                </TouchableOpacity>
                <View style={styles.alertButtonSeparator} />
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonRight]}
                  onPress={handleConfirmJoin}
                >
                  <Text
                    style={[
                      styles.alertButtonText,
                      { color: accentColor || "#00C2A8" },
                    ]}
                  >
                    Bli med
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
  backButton: {
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dropdownContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    maxWidth: 250,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "600",
  },
  eventDate: {
    fontSize: 14,
    marginTop: 4,
  },
  eventStatus: {
    fontSize: 12,
    marginTop: 4,
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
    backgroundColor: "transparent",
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
  alertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  alertContainer: {
    width: "70%",
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  alertMessage: {
    textAlign: "center",
    fontSize: 13,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    fontSize: 14,
  },
  swipeButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  swipeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Leaderboard;
