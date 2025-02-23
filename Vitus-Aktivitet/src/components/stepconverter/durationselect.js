"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
  Animated,
  Platform,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = 60; // Height of each item in the list
const VISIBLE_ITEMS = 7; // Odd number
const TOTAL_ITEMS = 60; // Maksimum 3 timer

const generateDurations = () => {
  return Array.from({ length: TOTAL_ITEMS }, (_, i) => i + 1);
};

const DurationSelect = ({ navigation, route }) => {
  const { theme, accentColor } = useTheme(); // 🌙 Get Theme & Accent Color
  const { activity } = route.params;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollTimeout = useRef(null);
  const isScrolling = useRef(false);

  const durations = useMemo(() => generateDurations(), []);
  const repeatedDurations = useMemo(() => durations, [durations]);

  const renderDurationItem = ({ item, index }) => {
    const actualIndex = index % TOTAL_ITEMS;
    const isSelected = actualIndex === selectedIndex;

    const formatDuration = (minutes) => {
      if (minutes < 60) {
        return `${minutes} min`;
      } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours} t ${mins} min` : `${hours} t`;
      }
    };

    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.8, 0.9, 1, 0.9, 0.8],
      extrapolate: "clamp",
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.2, 0.5, 1, 0.5, 0.2], // More grey as it fades
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.durationItem,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Text
          style={[
            styles.durationText,
            { color: isSelected ? accentColor : theme.textSecondary }, // ✅ Uses theme color for selected & faded text
            isSelected && styles.selectedDurationText,
          ]}
        >
          {formatDuration(item)}
        </Text>
      </Animated.View>
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT) % TOTAL_ITEMS;
        setSelectedIndex(index);
      },
    }
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: accentColor, width: "66%" },
            ]}
          />
        </View>
        <Text style={[styles.pageIndicator, { color: theme.text }]}>2/3</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Velg hvor{" "}
          <Text style={[styles.highlightText, { color: accentColor }]}>
            Lenge
          </Text>
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Hvor lang tid utførte du din aktivitet?
        </Text>

        {/* Central Scroll Area */}
        <View style={styles.scrollContainer}>
          <View style={[styles.centerLine, { borderColor: accentColor }]} />
          <Animated.FlatList
            ref={flatListRef}
            data={repeatedDurations}
            renderItem={renderDurationItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            bounces={false} // 🛑 Hindrer overscrolling på iOS
            overScrollMode="never" // 🛑 Hindrer overscrolling på Android
            decelerationRate="fast"
            onScroll={handleScroll}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            contentContainerStyle={{
              paddingVertical: (height - ITEM_HEIGHT) / 2.4 - ITEM_HEIGHT * 2,
              ...(Platform.OS === "android"
                ? {
                    paddingTop:
                      (height - ITEM_HEIGHT) / 2.4 - ITEM_HEIGHT * 1.2,
                    paddingBottom: ITEM_HEIGHT * 4, // android needs more padding
                  }
                : {}),
            }}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Avbryt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: accentColor }]}
          onPress={() =>
            navigation.navigate("Confirmation", {
              activity,
              duration: durations[selectedIndex],
            })
          }
        >
          <Text style={[styles.continueText, { color: theme.textContrast }]}>
            Fortsett
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  highlightText: {
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  scrollContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLine: {
    position: "absolute",
    width: "100%",
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    top: "50%",
    marginTop: -ITEM_HEIGHT / 2,
  },
  durationItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  durationText: {
    fontSize: 24,
    fontWeight: "500",
  },
  selectedDurationText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  continueText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default DurationSelect;
