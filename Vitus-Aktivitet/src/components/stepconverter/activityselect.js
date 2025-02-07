"use client";

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Dimensions,
  Animated,
} from "react-native";
import { ChevronLeft, Search } from "lucide-react-native";

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
  "Amerikansk Fotball",
];

const ActivitySelect = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const scrollY = useRef(new Animated.Value(1)).current;
  const [selectedIndex, setSelectedIndex] = useState(0); 

  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to the initial selected item
    flatListRef.current?.scrollToOffset({
      offset: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  const renderActivityItem = ({ item, index }) => {
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

    const isSelected = index === selectedIndex;

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
            isSelected && styles.selectedActivityText,
          ]}
        >
          {item}
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
        const index = Math.round(offsetY / ITEM_HEIGHT);
        if (index >= 0 && index < activities.length) {
          setSelectedIndex(index);
        }
      },
    }
  );

  const handleMomentumScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < activities.length) {
      setSelectedIndex(index);
      // Ensure perfect alignment
      flatListRef.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.pageIndicator}>1/3</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Hva er Din <Text style={styles.highlightText}>Aktivitet</Text>
        </Text>
        <Text style={styles.subtitle}>
          Velg Hvilke aktivitet du har gjennomført.
        </Text>

        {/* Central Scroll Area */}
        <View style={styles.scrollContainer}>
          <View style={styles.centerLine} />

          {showSearch ? (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Søk aktivitet..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity
                style={styles.searchIcon}
                onPress={() => setShowSearch(false)}
              >
                <Search size={24} color="#00ADB5" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Animated.FlatList
                ref={flatListRef}
                data={activities}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                contentContainerStyle={{
                  paddingVertical: (height - ITEM_HEIGHT) / 2.4 - ITEM_HEIGHT * 2,
                }}
                getItemLayout={(data, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
              >
                <Search size={24} color="#00ADB5" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() =>
            navigation.navigate("DurationSelect", {
              activity: activities[selectedIndex],
            })
          }
        >
          <Text style={styles.continueText}>Fortsett</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5F7F6",
    borderRadius: 2,
    marginHorizontal: 16,
  },
  progressFill: {
    width: "33%",
    height: "100%",
    backgroundColor: "#00ADB5",
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
    color: "#00ADB5",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
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
    borderColor: "#00ADB5",
    top: "50%",
    marginTop: -ITEM_HEIGHT / 2,
  },
  activityItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  activityText: {
    fontSize: 24,
    color: "#999",
    fontWeight: "500",
  },

  selectedActivityText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00ADB5",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#00ADB5",
  },
  searchInput: {
    flex: 1,
    fontSize: 24,
    color: "#00ADB5",
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
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "#00ADB5",
    alignItems: "center",
  },
  cancelText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ActivitySelect;
