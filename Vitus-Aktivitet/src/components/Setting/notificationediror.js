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
import { useTheme } from "../context/ThemeContext"; // ✅ Import Theme

const NotificationEditor = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme(); // ✅ Get theme & accent color

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section (Fixed Spacing) */}
      <View style={[styles.headerWrapper, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.text }]}>Varslinger</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Notifications Section */}
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Generelt</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Generelle Varslinger</Text>
            <Switch
              value={generalNotifications}
              onValueChange={setGeneralNotifications}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Lyd</Text>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Vibrasjon</Text>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
        </View>

        {/* System and Service Section */}
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>System og Service</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>App Oppdateringer</Text>
            <Switch
              value={appUpdates}
              onValueChange={setAppUpdates}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Fullførte Hendelser</Text>
            <Switch
              value={completedEvents}
              onValueChange={setCompletedEvents}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Nye Hendelser</Text>
            <Switch
              value={newEvents}
              onValueChange={setNewEvents}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Kommende Hendelser</Text>
            <Switch
              value={upcomingEvents}
              onValueChange={setUpcomingEvents}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Utløpte Hendelser</Text>
            <Switch
              value={expiredEvents}
              onValueChange={setExpiredEvents}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
        </View>

        {/* Other Notifications Section */}
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Andre</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Endring på plass i Leaderboard</Text>
            <Switch
              value={leaderboardChanges}
              onValueChange={setLeaderboardChanges}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Fullført Daglige Mål</Text>
            <Switch
              value={dailyGoals}
              onValueChange={setDailyGoals}
              trackColor={{ false: theme.border, true: accentColor }}
              thumbColor={"#FFFFFF"}
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
  },
});

export default NotificationEditor;
