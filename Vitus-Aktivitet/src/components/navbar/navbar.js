"use client"

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native"
import { Users, Home, Calendar } from "lucide-react-native"

const screenWidth = Dimensions.get("window").width

const Navbar = ({ state, descriptors, navigation }) => {
  const [slideAnim] = React.useState(new Animated.Value(0))

  const orderedRoutes = state.routes.slice().sort((a, b) => {
    if (a.name === "Home") return 0
    if (a.name === "Leaderboard") return -1
    if (a.name === "Events") return 1
    return 0
  })

  React.useEffect(() => {
    const activeIndex = orderedRoutes.findIndex((route) => route.name === state.routes[state.index].name)
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start()
  }, [state.index, orderedRoutes, slideAnim]) // Added slideAnim to dependencies

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
                    outputRange: [30, (screenWidth - 110) / 2, screenWidth - 140],
                  }),
                },
              ],
            },
          ]}
        />

        {orderedRoutes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel ?? options.title ?? route.name
          const isFocused = state.routes.indexOf(route) === state.index

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true })
            }
          }

          let Icon
          switch (route.name) {
            case "Leaderboard":
              Icon = Users
              break
            case "Home":
              Icon = Home
              break
            case "Events":
              Icon = Calendar
              break
            default:
              Icon = Home
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tab, index === 0 && styles.leftTab, index === 2 && styles.rightTab]}
              activeOpacity={1}
            >
              <View style={styles.iconContainer}>
                <Icon size={24} color={isFocused ? "#000" : "#808080"} strokeWidth={2} />
                <Text
                  style={[
                    styles.label,
                    {
                      opacity: isFocused ? 1 : 0,
                      color: isFocused ? "#000" : "#808080",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
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
    backgroundColor: "#48CAB2",
    borderRadius: 25,
    zIndex: 0,
    shadowColor: "#48CAB2",
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
})

export default Navbar

