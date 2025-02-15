import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Modal,
} from "react-native";
import { Filter, TrendingUp, TrendingDown } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext"; // Import Theme Context

const Leaderboard = () => {
  const [selectedSegment, setSelectedSegment] = useState("I DAG");
  const [fadeAnim] = useState(new Animated.Value(1));
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOption, setFilterOption] = useState("Everybody");
  const { theme, isDarkMode } = useTheme(); // Get theme values

  const fullLeaderboardData = [
    { id: '1', name: 'Ho Daniel', points: 2000, department: 'IT', avatar: require('../../../assets/figure/daniel.png') },
    { id: '2', name: 'Hashem', points: 1500, department: 'HR', avatar: require('../../../assets/figure/hashem.png') },
    { id: '3', name: 'Sarim', points: 1200, department: 'Finance', avatar: require('../../../assets/figure/sarim.png') },
    { id: "4", name: "Sjartan", points: 950, change: +2, department: "IT", avatar: require("../../../assets/figure/avatar1.jpg") },
    { id: "5", name: "Ahmed", points: 920, change: -1, department: "HR", avatar: require("../../../assets/figure/avatar2.jpg") },
    { id: "6", name: "Emma", points: 880, change: +3, department: "IT", avatar: require("../../../assets/figure/avatar3.jpg") },
    { id: "7", name: "Lars", points: 850, change: -2, department: "Finance", avatar: require("../../../assets/figure/avatar4.jpeg") },
    { id: "8", name: "Sofia", points: 820, change: +1, department: "HR", avatar: require("../../../assets/figure/avatar5.jpeg") },
    { id: "9", name: "Magnus", points: 780, change: -3, department: "IT", avatar: require("../../../assets/figure/avatar6.jpg") },
    { id: "10", name: "Isabella", points: 750, change: +4, department: "Finance", avatar: require("../../../assets/figure/avatar7.jpeg") },
  ];

  const filteredLeaderboardData =
    filterOption === "Everybody"
      ? fullLeaderboardData
      : fullLeaderboardData.filter((player) => player.department === filterOption);

  const handleFilterChange = (option) => {
    setFilterOption(option);
    setFilterVisible(false);
  };

  const handleSegmentChange = (segment) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setSelectedSegment(segment);
  };

  const renderLeaderboardItem = ({ item }) => (
    <Animated.View
      style={[
        styles.leaderboardRow,
        { opacity: fadeAnim, backgroundColor: isDarkMode ? "#333333" : "#F0F0F0" },
      ]}
    >
      <View style={styles.rankContainer}>
        {item.change > 0 ? (
          <TrendingUp size={16} color="#4CAF50" />
        ) : (
          <TrendingDown size={16} color="#F44336" />
        )}
        <Text style={[styles.changeText, item.change > 0 ? styles.positive : styles.negative]}>
          {Math.abs(item.change)}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Image source={item.avatar} style={styles.listAvatar} />
        <View>
          <Text style={[styles.playerName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.playerRank, { color: theme.textSecondary }]}>{item.department}</Text>
        </View>
      </View>
      <Text style={[styles.pointsText, { color: theme.primary }]}>
        {item.points.toLocaleString()} Poeng
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Filter Button */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Leaderboard</Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: isDarkMode ? "#333333" : "#F5F5F5" }]}
          onPress={() => setFilterVisible(true)}
        >
          <Filter size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setFilterVisible(false)}>
          <View style={styles.filterModal(theme)}>
            <Text style={styles.filterTitle(theme)}>Filter by</Text>
            {["Everybody", "IT", "HR", "Finance"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.filterOption(theme, filterOption === option)}
                onPress={() => handleFilterChange(option)}
              >
                <Text style={styles.filterText(theme, filterOption === option)}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Leaderboard List */}
      <FlatList
        data={filteredLeaderboardData}
        keyExtractor={(item) => item.id}
        renderItem={renderLeaderboardItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 50,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  playerRank: {
    fontSize: 12,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // 🔹 MODAL OVERLAY FIXES
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // ✅ Ensures proper blur
  },

  // 🔹 FIXED FILTER MODAL CONTAINER - Uses theme colors
  filterModal: (theme) => ({
    width: 280,
    borderRadius: 16, // Increased radius for smooth UI
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface, // ✅ Dark mode support
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  }),

  // 🔹 MODAL TITLE - Uses theme text color
  filterTitle: (theme) => ({
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: theme.text, // ✅ Dynamic text color
  }),

  // 🔹 FILTER OPTION FIXES - Uses theme colors
  filterOption: (theme, selected) => ({
    paddingVertical: 14, // More height for better tap experience
    paddingHorizontal: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: selected ? theme.primary : theme.surface, // ✅ Better contrast
    borderWidth: selected ? 2 : 0, // Highlight selected option
    borderColor: selected ? theme.primary : "transparent",
  }),

  // 🔹 FILTER TEXT FIX - Dynamic text color
  filterText: (theme, selected) => ({
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    color: selected ? theme.background : theme.text, // ✅ Better contrast
  }),
});


export default Leaderboard;
