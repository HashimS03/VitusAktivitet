import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Users, Home, Calendar } from "lucide-react-native";

const Navbar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

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
            key={index}
            onPress={onPress}
            style={[styles.tab]}
            activeOpacity={1} // Prevents button animation effect
          >
            {/* Background oval for active tab */}
            <View
              style={[
                styles.oval,
                isFocused && styles.activeOval,
                route.name === "Leaderboard" &&
                  isFocused &&
                  styles.widerLeaderboard, // Slightly wider for Leaderboard
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
    justifyContent: "space-evenly",
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
    width: 90, // Default width
    height: 50,
    borderRadius: 25,
  },
  activeOval: {
    backgroundColor: "#00BFA5",
  },
  widerLeaderboard: {
    width: 100, // Slightly wider for "Leaderboard" only
  },
  activeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },
});

export default Navbar;
