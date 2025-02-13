import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MOCK_PARTICIPANTS = [
  {
    id: "1",
    name: "Anna",
    score: 1200,
    avatar: require("../../../assets/figure/avatar1.jpg"),
    rankChange: 1,
  },
  {
    id: "2",
    name: "Bjørn",
    score: 980,
    avatar: require("../../../assets/figure/avatar2.jpg"),
    rankChange: -1,
  },
  {
    id: "3",
    name: "Camilla",
    score: 850,
    avatar: require("../../../assets/figure/avatar3.jpg"),
    rankChange: 2,
  },
  {
    id: "4",
    name: "David",
    score: 720,
    avatar: require("../../../assets/figure/avatar1.jpg"),
    rankChange: 0,
  },
  {
    id: "5",
    name: "Eva",
    score: 650,
    avatar: require("../../../assets/figure/avatar1.jpg"),
    rankChange: -2,
  },
];

const EventLeaderboard = ({ navigation, route }) => {
  const [participants, setParticipants] = useState([]);
  const [isEventActive, setIsEventActive] = useState(true);

  useEffect(() => {
    setParticipants(MOCK_PARTICIPANTS);
    setIsEventActive(route.params?.isEventActive ?? true);
  }, []);

  const renderParticipantItem = ({ item, index }) => (
    <View
      style={[
        styles.participantItem,
        index < 3 && styles.topThree, // Spesialstil for topp 3
      ]}
    >
      <Text style={styles.rank}>{index + 1}</Text>
      <Image source={item.avatar} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.scoreContainer}>
        {item.rankChange !== 0 && (
          <MaterialCommunityIcons
            name={item.rankChange > 0 ? "arrow-up" : "arrow-down"}
            size={18}
            color={item.rankChange > 0 ? "green" : "red"}
          />
        )}
        <Text style={styles.score}>
          {isEventActive ? "In Progress" : item.score}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Leaderboard</Text>

      <FlatList
        data={participants}
        renderItem={renderParticipantItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 3,
  },
  topThree: {
    backgroundColor: "#ffeb3b",
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default EventLeaderboard;
