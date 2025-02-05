import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Users, Home, Calendar } from "lucide-react-native";

const Navbar = ({ state, descriptors, navigation }) => {
  // Create animated value for the sliding pill
  const [slideAnim] = React.useState(new Animated.Value(0));

  // Reorder the routes to put Home in the middle
  const orderedRoutes = state.routes.slice().sort((a, b) => {
    if (a.name === "Home") return 0;
    if (a.name === "Leaderboard") return -1;
    if (a.name === "Events") return 1;
    return 0;
  });

  // Update position when the active tab changes
  React.useEffect(() => {
    const activeIndex = orderedRoutes.findIndex(
      route => route.name === state.routes[state.index].name
    );
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {/* Background Sliding Pill */}
        <Animated.View
          style={[
            styles.slidingPill,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, 122, 244], 
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
              style={[
                styles.tab,
                index === 1 && styles.middleTab
              ]}
              activeOpacity={1}
            >
              <Icon size={24} color={isFocused ? "#000" : "#808080"} />
              <Text style={[
                styles.label,
                { opacity: isFocused ? 1 : 0 }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingHorizontal: 20,
  },
  navContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  slidingPill: {
    position: "absolute",
    width: 110,
    height: 50,
    backgroundColor: "#00BFA5",
    borderRadius: 25,
    zIndex: 0,
  },
  tab: {
    width: 110,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  middleTab: {
    marginHorizontal: 11, // Added margin to center middle tab
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },
});

export default Navbar;