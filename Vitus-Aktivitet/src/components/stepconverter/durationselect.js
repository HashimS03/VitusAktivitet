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
} from "react-native";
import { ChevronLeft } from "lucide-react-native";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = 60; // Height of each item in the list
const VISIBLE_ITEMS = 7; // Odd number
const TOTAL_ITEMS = 60; // Maksimum 3 timer

const generateDurations = () => {
  return Array.from({ length: TOTAL_ITEMS }, (_, i) => i + 1);
};

const DurationSelect = ({ navigation, route }) => {
  const { activity } = route.params;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flatListRef = useRef(null);

  const durations = useMemo(() => generateDurations(), []);
  const repeatedDurations = useMemo(
    () => [...durations, ...durations, ...durations],
    [durations]
  );

  useEffect(() => {
    // Scroll to the middle set of items initially
    flatListRef.current?.scrollToIndex({
      index: TOTAL_ITEMS + Math.floor(VISIBLE_ITEMS / 2),
      animated: false,
    });
  }, []);

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

    return (
      <View style={styles.durationItem}>
        <Text
          style={[
            styles.durationText,
            isSelected && styles.selectedDurationText,
          ]}
        >
          {formatDuration(item)}
        </Text>
      </View>
    );
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT) % TOTAL_ITEMS;
    setSelectedIndex(index);
  };

  const handleMomentumScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    if (index < TOTAL_ITEMS) {
      // If we're in the first set, jump to the middle set
      flatListRef.current?.scrollToIndex({
        index: index + TOTAL_ITEMS,
        animated: false,
      });
    } else if (index >= TOTAL_ITEMS * 2) {
      // If we're in the last set, jump to the middle set
      flatListRef.current?.scrollToIndex({
        index: index - TOTAL_ITEMS,
        animated: false,
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
          <FlatList
            ref={flatListRef}
            data={repeatedDurations}
            renderItem={renderDurationItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            contentContainerStyle={{
              paddingVertical:
                (height - ITEM_HEIGHT) / 2 -
                ITEM_HEIGHT * (VISIBLE_ITEMS / 2 - 0.4),
            }}
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
