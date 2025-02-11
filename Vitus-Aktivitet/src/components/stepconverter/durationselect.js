"use client";

import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;

const durations = Array.from({ length: 9 }, (_, i) => 25 - i);

const DurationSelect = ({ navigation, route }) => {
  const { activity } = route.params;
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

  const renderDurationItem = ({ item, index }) => {
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
          styles.durationItem,
          {
            transform: [{ scale }],
            opacity: isSelected ? 1 : opacity,
          },
        ]}
      >
        <Text
          style={[
            styles.durationText,
            isSelected && styles.selectedDurationText,
          ]}
        >
          {item} min
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
        if (index >= 0 && index < durations.length) {
          setSelectedIndex(index);
        }
      },
    }
  );

  const handleMomentumScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < durations.length) {
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
          <View style={[styles.progressFill, { width: "66%" }]} />
        </View>
        <Text style={styles.pageIndicator}>2/3</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Velg hvor <Text style={styles.highlightText}>Lenge</Text>
        </Text>
        <Text style={styles.subtitle}>
          Hvor lang tid utførte du din aktivitet?
        </Text>

        {/* Central Scroll Area */}
        <View style={styles.scrollContainer}>
          <View style={styles.centerLine} />
          <Animated.FlatList
            ref={flatListRef}
            data={durations}
            renderItem={renderDurationItem}
            keyExtractor={(item) => item.toString()}
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
            navigation.navigate("Confirmation", {
              activity,
              duration: durations[selectedIndex],
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
  durationItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  durationText: {
    fontSize: 24,
    color: "#999",
    fontWeight: "500",
  },
  selectedDurationText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00ADB5",
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

export default DurationSelect;
