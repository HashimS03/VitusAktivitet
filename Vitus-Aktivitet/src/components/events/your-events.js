import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme Support

const YourEvents = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme(); // 🌙 Get Theme & Accent Color

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Action Cards */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate("NewEvent")}
        >
          <Text style={[styles.actionCardText, { color: theme.text }]}>
            Opprett hendelse
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate("JoinEvent")}
        >
          <Text style={[styles.actionCardText, { color: theme.text }]}>
            Join Hendelse
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        {/* Active Events Section */}
        <View style={styles.activeEventsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Dine <Text style={[styles.highlightText, { color: accentColor }]}>Aktive</Text> Hendelser
          </Text>

          {/* Empty State (No Active Events) */}
          <TouchableOpacity
            style={[styles.noEventsContainer, { backgroundColor: theme.surface }]}
            onPress={() =>
              navigation.navigate("LogRecordingScreen", {
                isEventActive: false,
              })
            }
          >
            <View>
              <Text style={[styles.noEventTitle, { color: theme.text }]}>
                Ingen Aktive Hendelser
              </Text>
              <Text style={[styles.noEventSubtitle, { color: theme.textSecondary }]}>
                Du har for øyeblikket ingen aktive hendelser.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 30, // ✅ Fix Navbar Padding
  },
  container: {
    flex: 1,
    paddingBottom: 80, // ✅ Ensure space for bottom navigation
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeEventsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
  highlightText: {
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  eventImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E5E5E5",
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  eventTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
  },
  noEventsContainer: {
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  noEventTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  noEventSubtitle: {
    fontSize: 16,
    maxWidth: "80%",
    lineHeight: 24,
  },
});

export default YourEvents;
