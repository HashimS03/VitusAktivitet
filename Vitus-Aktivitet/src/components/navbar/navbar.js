import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Users, Home, Calendar } from "lucide-react-native";

const Navbar = ({ state, descriptors, navigation }) => {
  // Reorder the routes to put Home in the middle
  const orderedRoutes = state.routes.slice().sort((a, b) => {
    if (a.name === "Home") return 0;
    if (a.name === "Leaderboard") return -1;
    if (a.name === "Events") return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
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
            Icon = Users;
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
            style={[styles.tab]}
            activeOpacity={1}
          >
            <View
              style={[
                styles.oval,
                isFocused && styles.activeOval,
                route.name === "Leaderboard" && isFocused && styles.widerLeaderboard,
                route.name === "Home" && styles.homeTab,
              ]}
            >
              <Icon size={24} color={isFocused ? "#000" : "#808080"} />
              {isFocused && <Text style={styles.activeText}>{label}</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "space-between", // Changed to space-between
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  oval: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    height: 50,
    borderRadius: 25,
  },
  activeOval: {
    backgroundColor: "#00BFA5",
  },
  widerLeaderboard: {
    width: 100,
  },
  homeTab: {
    marginHorizontal: 20, // Add spacing around home tab
  },
  activeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },
});

export default Navbar;