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

const TEAL_COLOR = "#00BFA5";

const Leaderboard = () => {
  const [selectedSegment, setSelectedSegment] = useState("I DAG");
  const [fadeAnim] = useState(new Animated.Value(1));
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOption, setFilterOption] = useState("Everybody");

  // Full leaderboard data
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

  // Apply filter based on selected option
  const filteredLeaderboardData =
    filterOption === "Everybody"
      ? fullLeaderboardData
      : fullLeaderboardData.filter((player) => player.department === filterOption);

  // Function to handle filter selection
  const handleFilterChange = (option) => {
    setFilterOption(option);
    setFilterVisible(false);
  };

  // Function to animate leaderboard refresh
  const handleSegmentChange = (segment) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setSelectedSegment(segment);
  };

  // Function to render leaderboard items
  const renderLeaderboardItem = ({ item, index }) => (
    <Animated.View style={[styles.leaderboardRow, { opacity: fadeAnim }]}>
      <View style={styles.rankContainer}>
        {item.change > 0 ? <TrendingUp size={16} color="#4CAF50" /> : <TrendingDown size={16} color="#F44336" />}
        <Text style={[styles.changeText, item.change > 0 ? styles.positive : styles.negative]}>
          {Math.abs(item.change)}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Image source={item.avatar} style={styles.listAvatar} />
        <View>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerRank}>{item.department}</Text>
        </View>
      </View>
      <Text style={styles.pointsText}>{item.points.toLocaleString()} Poeng</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Filter Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Filter size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setFilterVisible(false)}>
          <View style={styles.filterModal}>
            <Text style={styles.filterTitle}>Filter by</Text>
            <TouchableOpacity
              style={[styles.filterOption, filterOption === "Everybody" && styles.selectedOption]}
              onPress={() => handleFilterChange("Everybody")}
            >
              <Text style={styles.filterText}>Everybody</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, filterOption === "IT" && styles.selectedOption]}
              onPress={() => handleFilterChange("IT")}
            >
              <Text style={styles.filterText}>IT Department</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, filterOption === "HR" && styles.selectedOption]}
              onPress={() => handleFilterChange("HR")}
            >
              <Text style={styles.filterText}>HR Department</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, filterOption === "Finance" && styles.selectedOption]}
              onPress={() => handleFilterChange("Finance")}
            >
              <Text style={styles.filterText}>Finance Department</Text>
            </TouchableOpacity>
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
    backgroundColor: "#FFF",
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
    color: "#000",
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  filterModal: {
    width: 250,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  filterOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "#E5E5E5",
  },
  selectedOption: {
    backgroundColor: TEAL_COLOR,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
    color: "#000",
  },
  playerRank: {
    fontSize: 12,
    color: "#666",
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEAL_COLOR,
  },
});

export default Leaderboard;
