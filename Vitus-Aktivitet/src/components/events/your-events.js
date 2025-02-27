import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";
import * as Progress from "react-native-progress";

const YourEvents = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeEvents, deleteEvent, updateEvent } = useContext(EventContext);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleCreateEvent = () => {
    navigation.navigate("NewEvent");
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteEvent(eventId);
            setMenuVisible(false);
          },
        },
      ]
    );
  };

  const handleEditEvent = (event) => {
    setMenuVisible(false);
    navigation.navigate("NewEvent", { eventDetails: event, isEditing: true });
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Events
          </Text>
        </View>

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
          activeEvents.map((event, index) => {
            const progress = event.currentValue / event.goalValue;
            const unit = event.selectedActivity?.unit || "km";
            return (
              <TouchableOpacity
                key={index}
                style={[styles.eventCard, { backgroundColor: theme.surface }]}
                onPress={() =>
                  navigation.navigate("ActiveEvent", { eventId: event.id })
                }
              >
                <View style={styles.eventContent}>
                  <Image
                    source={require("../../../assets/trophy_icon.png")}
                    style={styles.eventImage}
                  />
                  <View style={styles.eventDetails}>
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventTitle, { color: theme.text }]}>
                        {truncateText(event.title, 20)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedEvent(event);
                          setMenuVisible(true);
                        }}
                      >
                        <MaterialCommunityIcons
                          name="dots-vertical"
                          size={24}
                          color={theme.text}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text
                      style={[
                        styles.eventDescription,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {truncateText(event.description, 50)}
                    </Text>
                    <Progress.Bar
                      progress={progress || 0}
                      width={null}
                      height={8}
                      color={theme.primary}
                      unfilledColor={theme.primary + "30"}
                      borderWidth={0}
                      borderRadius={4}
                      style={styles.progressBar}
                    />
                    <Text style={[styles.progressText, { color: theme.text }]}>
                      {event.currentValue || 0} {unit} / {event.goalValue || 100} {unit}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.menuContent,
              { backgroundColor: theme.surface, shadowColor: theme.text },
            ]}
          >
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleEditEvent(selectedEvent)}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                color={theme.text}
              />
              <Text style={[styles.menuOptionText, { color: theme.text }]}>
                Edit Event
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleDeleteEvent(selectedEvent.id)}
            >
              <MaterialCommunityIcons
                name="delete"
                size={24}
                color="#FF0000"
              />
              <Text style={[styles.menuOptionText, { color: "#FF0000" }]}>
                Delete Event
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuCloseButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text
                style={[styles.menuCloseButtonText, { color: theme.primary }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
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
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  eventDetails: {
    flex: 1,
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
  eventDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: "#666",
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContent: {
    width: "80%",
    borderRadius: 12,
    padding: 16,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuOptionText: {
    fontSize: 16,
    marginLeft: 16,
  },
  menuCloseButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  menuCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default YourEvents;