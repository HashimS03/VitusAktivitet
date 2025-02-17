"use client";

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import {
  Users,
  Home,
  Calendar,
  Award,
  Medal,
  BarChart,
  Podium,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext"; // Import Theme Context

const screenWidth = Dimensions.get("window").width;

const Navbar = ({ state, descriptors, navigation }) => {
  const [slideAnim] = React.useState(new Animated.Value(0));
  const { theme, isDarkMode } = useTheme(); // Get theme values

  const orderedRoutes = state.routes.slice().sort((a, b) => {
    if (a.name === "Home") return 0;
    if (a.name === "Leaderboard") return -1;
    if (a.name === "Events") return 1;
    return 0;
  });

  React.useEffect(() => {
    const activeIndex = orderedRoutes.findIndex(
      (route) => route.name === state.routes[state.index].name
    );
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start();
  }, [state.index, orderedRoutes, slideAnim]);

  return (
    <View
      style={[
        styles.navWrapper,
        { backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF" },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? "#3A3A3A" : "#FFFFFF",
            borderTopColor: theme.border,
            shadowColor: isDarkMode ? "transparent" : "#000000", // 🔹 Light shadow only in Light Mode
            shadowOffset: isDarkMode
              ? { width: 0, height: 0 }
              : { width: 0, height: -2 },
            shadowOpacity: isDarkMode ? 0 : 0.1, // 🔹 Subtle shadow in Light Mode
            shadowRadius: isDarkMode ? 0 : 8, // 🔹 Light blur effect
            elevation: isDarkMode ? 0 : 6, // 🔹 Android shadow for Light Mode
          },
        ]}
      >
        <View style={styles.navContainer}>
          {/* Background Sliding Pill */}
          <Animated.View
            style={[
              styles.slidingPill,
              {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [
                        30,
                        (screenWidth - 110) / 2,
                        screenWidth - 140,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />

          {orderedRoutes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.routes.indexOf(route) === state.index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            let Icon;
            switch (route.name) {
              case "Leaderboard":
                Icon = Award;
                break;
              case "Home":
                Icon = Home;
                break;
              case "Events":
                Icon = Calendar;
                break;
              default:
                Icon = Home;
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[
                  styles.tab,
                  index === 0 && styles.leftTab,
                  index === 2 && styles.rightTab,
                ]}
                activeOpacity={1}
              >
                <View style={styles.iconContainer}>
                  <Icon
                    size={24}
                    color={
                      isFocused
                        ? isDarkMode
                          ? "#FFFFFF"
                          : "#000000"
                        : theme.textSecondary
                    }
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        opacity: isFocused ? 1 : 0,
                        color: isFocused
                          ? isDarkMode
                            ? "#FFFFFF"
                            : "#000000"
                          : theme.textSecondary,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopLeftRadius: 30, // ✅ Keeps the curved effect
    borderTopRightRadius: 30, // ✅ Keeps the curved effect
    overflow: "hidden", // ✅ Ensures no artifacts outside
  },
  container: {
    flex: 1,
    height: 90,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    overflow: "hidden", // ✅ Prevents anything from leaking out
  },
  navContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    paddingHorizontal: 30,
    paddingBottom: 10,
  },
  slidingPill: {
    position: "absolute",
    width: 110,
    height: 50,
    borderRadius: 25,
    zIndex: 0,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    width: 90,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  leftTab: {
    marginLeft: 10,
  },
  rightTab: {
    marginRight: 10,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
});

export default Navbar;
