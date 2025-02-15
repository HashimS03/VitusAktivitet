import { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native";
import UpcomingEvents from "./upcoming-events";
import YourEvents from "./your-events";
import PastEvents from "./past-events";
import { useTheme } from "../context/ThemeContext"; // Import Theme Context

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_WIDTH = SCREEN_WIDTH * 0.94;
const TAB_COUNT = 3;
const CONTAINER_PADDING = 4;
const PILL_OFFSET_LEFT = 8;
const PILL_OFFSET_RIGHT = 2;
const PILL_WIDTH = (TAB_WIDTH - CONTAINER_PADDING * 2) / TAB_COUNT;

export default function EventsNavigation() {
  const [activeTab, setActiveTab] = useState("your");
  const translateX = useRef(new Animated.Value(PILL_WIDTH + PILL_OFFSET_LEFT)).current;
  const { theme, accentColor } = useTheme(); // Get theme values

  useEffect(() => {
    let activeIndex = 1;
    if (activeTab === "upcoming") activeIndex = 0;
    if (activeTab === "past") activeIndex = 2;

    Animated.spring(translateX, {
      toValue: activeIndex * PILL_WIDTH + PILL_OFFSET_LEFT,
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
  }, [activeTab, translateX]);

  const renderContent = () => {
    switch (activeTab) {
      case "upcoming":
        return <UpcomingEvents />;
      case "your":
        return <YourEvents />;
      case "past":
        return <PastEvents />;
      default:
        return <YourEvents />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Hendelser</Text>

      <View style={styles.tabWrapper}>
        <View style={[styles.tabContainer, { width: TAB_WIDTH, backgroundColor: theme.surface }]}>
          <Animated.View
            style={[
              styles.activeTabIndicator,
              {
                backgroundColor: accentColor,
                width: PILL_WIDTH - (PILL_OFFSET_LEFT + PILL_OFFSET_RIGHT),
                transform: [{ translateX: translateX }],
              },
            ]}
          />
          {[
            { id: "upcoming", label: "UPCOMING" },
            { id: "your", label: "YOUR EVENTS" },
            { id: "past", label: "PAST EVENTS" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, { width: PILL_WIDTH }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.id ? theme.text : theme.textSecondary,
                    fontWeight: activeTab === tab.id ? "600" : "400",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.contentWrapper}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
  },
  tabWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 30,
    padding: CONTAINER_PADDING,
    position: "relative",
    height: 48,
    alignItems: "center",
  },
  tab: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  activeTabIndicator: {
    position: "absolute",
    height: 40,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    textAlign: "center",
  },
  contentWrapper: {
    flex: 1,
    paddingTop: 20,
  },
});

