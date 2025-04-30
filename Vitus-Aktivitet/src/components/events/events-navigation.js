import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from "react-native";
import { createStackNavigator } from '@react-navigation/stack';
import UpcomingEvents from "./upcoming-events";
import YourEvents from "./your-events";
import PastEvents from "./past-events";
import EventLeaderboard from "./EventLeaderboard";
import ActiveEvent from "./activeevent";
import NewEvent from "./NewEvent";
import JoinEvent from "./JoinEvent"; // Add this import
import { useTheme } from "../context/ThemeContext";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Leaderboard } from "../leaderboard/leaderboard"; // Add this import

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_WIDTH = SCREEN_WIDTH * 0.94;
const TAB_COUNT = 3;
const CONTAINER_PADDING = 4;
const PILL_OFFSET_LEFT = 8;
const PILL_OFFSET_RIGHT = 2;
const PILL_WIDTH = (TAB_WIDTH - CONTAINER_PADDING * 2) / TAB_COUNT;

// Create a Stack Navigator for Events
const EventStack = createStackNavigator();

// Create a component for the main tab content
const EventTabs = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("your");
  const translateX = useRef(new Animated.Value(PILL_WIDTH + PILL_OFFSET_LEFT)).current;
  const { theme, accentColor } = useTheme();

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
        return <UpcomingEvents navigation={navigation} />;
      case "your":
        return <YourEvents navigation={navigation} />;
      case "past":
        return <PastEvents navigation={navigation} />;
      default:
        return <YourEvents navigation={navigation} />;
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
            { id: "upcoming", label: "KOMMENDE" },
            { id: "your", label: "MINE" },
            { id: "past", label: "TIDLIGERE" },
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
};

// Replace your default export with this updated version
export default function EventsNavigation() {
  const { theme } = useTheme();
  
  return (
    <EventStack.Navigator
      initialRouteName="EventTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
        // Hide tab bar when in ActiveEvent, NewEvent, or EventLeaderboard
        tabBarVisible: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          const hideOnScreens = ['ActiveEvent', 'NewEvent', 'EventLeaderboard', 'JoinEvent'];
          return !hideOnScreens.includes(routeName);
        })(route),
        // For newer React Navigation versions
        tabBarStyle: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          const hideOnScreens = ['ActiveEvent', 'NewEvent', 'EventLeaderboard', 'JoinEvent'];
          if (hideOnScreens.includes(routeName)) {
            return { display: 'none' };
          }
        })(route),
      })}
    >
      <EventStack.Screen name="EventTabs" component={EventTabs} />
      <EventStack.Screen 
        name="ActiveEvent" 
        component={ActiveEvent}
        options={{
          headerShown: false,
          presentation: 'card',
          animationEnabled: true,
          tabBarVisible: false, // Explicitly hide tab bar
          tabBarStyle: { display: 'none' }
        }}
      />
      <EventStack.Screen 
        name="EventLeaderboard" 
        component={EventLeaderboard}
        options={{
          headerShown: false,
          presentation: 'card',
          animationEnabled: true,
          tabBarVisible: false,
          tabBarStyle: { display: 'none' }
        }}
      />
      <EventStack.Screen 
        name="NewEvent" 
        component={NewEvent}
        options={{
          headerShown: false,
          presentation: 'card',
          animationEnabled: true,
          tabBarVisible: false,
          tabBarStyle: { display: 'none' }
        }}
      />
      <EventStack.Screen 
        name="Leaderboard" 
        component={Leaderboard}
        options={{
          headerShown: false,
          presentation: 'card', 
          animationEnabled: true,
          tabBarVisible: false,
          tabBarStyle: { display: 'none' }
        }}
      />
      <EventStack.Screen 
        name="JoinEvent" 
        component={JoinEvent}
        options={{
          headerShown: false,
          presentation: 'card',
          animationEnabled: true,
          tabBarVisible: false,
          tabBarStyle: { display: 'none' }
        }}
      />
    </EventStack.Navigator>
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

