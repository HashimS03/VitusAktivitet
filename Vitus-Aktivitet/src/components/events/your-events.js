import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext"; // Importer EventContext

const YourEvents = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeEvents } = useContext(EventContext); // Hent activeEvents fra Context

  const handleCreateEvent = () => {
    navigation.navigate("NewEvent");
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.createEventButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={handleCreateEvent}
          >
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={theme.background}
            />
            <Text style={[styles.createEventText, { color: theme.background }]}>
              Create Event
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.joinEventButton, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate("JoinEvent")}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={theme.text}
            />
            <Text style={[styles.joinEventText, { color: theme.text }]}>
              Join Event
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Active Events
        </Text>

        {activeEvents.length === 0 ? (
          <View
            style={[
              styles.emptyStateContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <Image
              source={require("../../../assets/CalenderClock.png")}
              style={styles.emptyStateImage}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              No Active Events
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: theme.textSecondary },
              ]}
            >
              You don't have any active events at the moment.
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyStateButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleCreateEvent}
            >
              <Text
                style={[
                  styles.emptyStateButtonText,
                  { color: theme.background },
                ]}
              >
                Create an Event
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.eventCard, { backgroundColor: theme.surface }]}
              onPress={() =>
                navigation.navigate("ActiveEvent", { eventId: event.id })
              }
            >
              <Text style={[styles.eventTitle, { color: theme.text }]}>
                {event.title}
              </Text>
              <Text
                style={[
                  styles.eventDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {event.description}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 0,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
    marginTop: 0,
  },
  createEventButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 32,
    gap: 8,
    height: 56,
  },
  joinEventButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 32,
    gap: 8,
    height: 56,
  },
  createEventText: {
    fontSize: 16,
    fontWeight: "600",
  },
  joinEventText: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  emptyStateContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 4,
  },
  emptyStateImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    maxWidth: 280,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  eventCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
  },
});

export default YourEvents;
