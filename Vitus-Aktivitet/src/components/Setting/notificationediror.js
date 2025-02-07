import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NotificationEditor = () => {
  const navigation = useNavigation();

  // State for toggles
  const [generalNotifications, setGeneralNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [vibration, setVibration] = useState(true);
  const [appUpdates, setAppUpdates] = useState(false);
  const [completedEvents, setCompletedEvents] = useState(true);
  const [newEvents, setNewEvents] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState(false);
  const [expiredEvents, setExpiredEvents] = useState(false);
  const [leaderboardChanges, setLeaderboardChanges] = useState(false);
  const [dailyGoals, setDailyGoals] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={styles.header}>Varslinger</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generelt</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Generelle Varslinger</Text>
            <Switch
              value={generalNotifications}
              onValueChange={setGeneralNotifications}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lyd</Text>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vibrasjon</Text>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>

        {/* System and Service Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System og Service</Text>
          <View style={styles.row}>
            <Text style={styles.label}>App Oppdateringer</Text>
            <Switch
              value={appUpdates}
              onValueChange={setAppUpdates}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fullførte Hendelser</Text>
            <Switch
              value={completedEvents}
              onValueChange={setCompletedEvents}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nye Hendelser</Text>
            <Switch
              value={newEvents}
              onValueChange={setNewEvents}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kommende Hendelser</Text>
            <Switch
              value={upcomingEvents}
              onValueChange={setUpcomingEvents}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Utløpte Hendelser</Text>
            <Switch
              value={expiredEvents}
              onValueChange={setExpiredEvents}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>

        {/* Other Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Andre</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Endring på plass i Leaderboard</Text>
            <Switch
              value={leaderboardChanges}
              onValueChange={setLeaderboardChanges}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fullført Daglige Mål</Text>
            <Switch
              value={dailyGoals}
              onValueChange={setDailyGoals}
              trackColor={{ false: "#ccc", true: "#48CAB2" }}
              thumbColor={"#FFFFFF"} // ✅ Always white dot
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingTop: Platform.OS === "ios" ? 60 : 40, // Adjust for status bar height
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10, // Moves the title lower
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
});

export default NotificationEditor;
