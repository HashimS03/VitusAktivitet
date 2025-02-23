"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { ChevronLeft, Search } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;

const activities = [
  "Styrke",
  "Basketball",
  "Planke",
  "Fotball",
  "Gå",
  "Svømming",
  "Sykling",
  "Jogging",
  "Padel",
];

const ActivitySelect = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(activities[0]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollTimeout = useRef(null);
  const isScrolling = useRef(false);

  const filteredActivities = activities.filter((activity) =>
    activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderScrollItem = ({ item, index }) => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.7, 0.8, 1, 0.8, 0.7],
      extrapolate: "clamp",
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.3, 0.5, 1, 0.5, 0.3],
      extrapolate: "clamp",
    });

    const isSelected = item === selectedActivity;

    return (
      <Animated.View
        style={[
          styles.activityItem,
          {
            transform: [{ scale }],
            opacity: isSelected ? 1 : opacity,
          },
        ]}
      >
        <Text
          style={[
            styles.activityText,
            { color: theme.textSecondary },
            isSelected && [
              styles.selectedActivityText,
              { color: theme.primary },
            ],
          ]}
        >
          {item}
        </Text>
      </Animated.View>
    );
  };

  const renderSearchItem = ({ item }) => {
    const isSelected = item === selectedActivity;

    return (
      <TouchableOpacity
        onPress={() => {
          const newIndex = activities.indexOf(item);
          setSelectedActivity(item);
          setSelectedIndex(newIndex);
          setShowSearch(false);
          setSearchQuery("");

          // Add a small delay to ensure smooth transition
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: newIndex * ITEM_HEIGHT,
              animated: false,
            });
            // Reset the animation value to match new position
            scrollY.setValue(newIndex * ITEM_HEIGHT);
          }, 50);
        }}
        style={[
          styles.searchItemContainer,
          { borderBottomColor: theme.border },
        ]}
      >
        <Text
          style={[
            styles.activityText,
            { color: theme.textSecondary },
            isSelected && [
              styles.selectedActivityText,
              { color: theme.primary },
            ],
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const scrollToIndex = (index, animated = true) => {
    if (flatListRef.current) {
      const safeIndex = Math.max(0, Math.min(index, activities.length - 1));
      const offset = safeIndex * ITEM_HEIGHT; // Beregn eksakt scroll-posisjon

      flatListRef.current.scrollToOffset({
        offset,
        animated,
      });

      console.log("Scrolling to offset:", offset); // Debugging
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        if (isScrolling.current) return;

        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);

        if (index >= 0 && index < activities.length) {
          // Nullstill tidligere timeout hvis det er en aktiv
          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }

          // Sett en forsinkelse før verdien oppdateres
          scrollTimeout.current = setTimeout(() => {
            setSelectedIndex(index);
            setSelectedActivity(activities[index]);
          }, 300); // Forsinkelse på 300ms
        }
      },
    }
  );

  const handleMomentumScrollEnd = (event) => {
    isScrolling.current = false;
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    if (index >= 0 && index < activities.length) {
      setSelectedIndex(index);
      setSelectedActivity(activities[index]);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        scrollToIndex(index);
      }, 150);
    }
  };

  const handleScrollBeginDrag = () => {
    isScrolling.current = true;
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  };

  useEffect(() => {
    if (!showSearch) {
      scrollToIndex(selectedIndex, false);
    }

    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [selectedIndex, showSearch]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[styles.progressFill, { backgroundColor: theme.primary }]}
          />
        </View>
        <Text style={[styles.pageIndicator, { color: theme.text }]}>1/3</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Hva er Din{" "}
          <Text style={[styles.highlightText, { color: theme.primary }]}>
            Aktivitet
          </Text>
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Velg Hvilke aktivitet du har gjennomført.
        </Text>

        <View style={styles.scrollContainer}>
          {!showSearch && (
            <View style={[styles.centerLine, { borderColor: theme.primary }]} />
          )}

          {showSearch ? (
            <>
              <View
                style={[
                  styles.searchContainer,
                  {
                    borderBottomColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <TextInput
                  style={[styles.searchInput, { color: theme.primary }]}
                  placeholder="Søk aktivitet..."
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.searchIcon}
                  onPress={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                >
                  <Search size={24} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <Animated.FlatList
                data={filteredActivities}
                renderItem={renderSearchItem}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.searchResultsContainer}
              />
            </>
          ) : (
            <>
              <Animated.FlatList
                ref={flatListRef}
                data={activities}
                renderItem={renderScrollItem}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScrollBeginDrag={handleScrollBeginDrag}
                contentContainerStyle={{
                  paddingVertical:
                    (height - ITEM_HEIGHT) / 2.4 - ITEM_HEIGHT * 2,
                  ...(Platform.OS === "android"
                    ? {
                        paddingTop:
                          (height - ITEM_HEIGHT) / 2.4 - ITEM_HEIGHT * 1.2,
                        paddingBottom: ITEM_HEIGHT * 4, // android needs more padding
                      }
                    : {}),
                }}
                getItemLayout={(data, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                removeClippedSubviews={true}
                maxToRenderPerBatch={VISIBLE_ITEMS}
                windowSize={VISIBLE_ITEMS}
                initialNumToRender={VISIBLE_ITEMS}
                bounces={false} // 🛑 Hindrer overscrolling på iOS
                overScrollMode="never" // 🛑 Hindrer overscrolling på Android
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Search size={24} color={theme.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Avbryt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.primary }]}
          onPress={() =>
            navigation.navigate("DurationSelect", {
              activity: selectedActivity,
            })
          }
        >
          <Text style={[styles.continueText, { color: theme.primaryText }]}>
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
    width: "33%",
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
  activityItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  searchItemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    width: "100%",
  },
  activityText: {
    fontSize: 24,
    fontWeight: "500",
  },
  selectedActivityText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: ITEM_HEIGHT,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 24,
    textAlign: "center",
  },
  searchButton: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    width: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    padding: 8,
  },
  searchResultsContainer: {
    width: "100%",
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

export default ActivitySelect;
