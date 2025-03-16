import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";
import { useNavigation } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";

const PastEvents = () => {
  const { theme } = useTheme();
  const { pastEvents, clearPastEvents, deleteEvent } = useContext(EventContext);
  const navigation = useNavigation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleMenuPress = (event) => {
    setSelectedEvent(event);
    setMenuVisible(true);
  };

  const handleStartAgain = () => {
    setMenuVisible(false);
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);

    const newEventTemplate = {
      title: selectedEvent.title,
      description: selectedEvent.description,
      goalValue: selectedEvent.goalValue,
      selectedActivity: selectedEvent.selectedActivity,
      location: selectedEvent.location,
      eventType: selectedEvent.eventType,
      teamCount: selectedEvent.team_count,
      membersPerTeam: selectedEvent.members_per_team,
      participantCount: selectedEvent.total_participants,
      currentValue: 0,
      startDate: now,
      endDate: oneHourLater,
      startTime: now,
      endTime: oneHourLater,
      start_date: now.toISOString(),
      end_date: oneHourLater.toISOString(),
      id: Date.now().toString(),
    };

    navigation.navigate("NewEvent", {
      eventDetails: newEventTemplate,
      isEditing: false,
    });
  };

  const handleDeleteEvent = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this past event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEvent(selectedEvent.id),
        },
      ]
    );
  };

  const renderRightActions = (progress, dragX, eventId) => {
    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 80],
      extrapolate: "clamp",
    });
    return (
      <TouchableOpacity
        style={[
          styles.swipeButton,
          { backgroundColor: theme.error || "#FF0000" },
        ]}
        onPress={() => {
          Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this past event?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteEvent(eventId),
              },
            ]
          );
        }}
      >
        <Text style={styles.swipeButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderEvent = (event) => {
    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, event.id)
        }
        friction={2}
        rightThreshold={40}
        overshootRight={false}
        enabled={true}
      >
        <TouchableOpacity
          style={[styles.eventCard, { backgroundColor: theme.surface }]}
          onPress={() =>
            navigation.navigate("ActiveEvent", { eventId: event.id })
          }
        >
          <View style={styles.cardContent}>
            <Image
              source={require("../../../assets/Vitus_Strong.png")}
              style={styles.eventImage}
              resizeMode="contain"
            />
            <View style={styles.eventDetails}>
              <View style={styles.headerRow}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>
                  {truncateText(event.title, 20)}
                </Text>
                <TouchableOpacity onPress={() => handleMenuPress(event)}>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color={theme.text}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[styles.progressText, { color: theme.textSecondary }]}
              >
                Avsluttet: {new Date(event.end_date).toLocaleDateString()} •{" "}
                {new Date(event.end_date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          ...styles.contentContainer,
          flexGrow: 1,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Tidligere hendelser
          </Text>
          {pastEvents.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                Alert.alert(
                  "Clear Past Events",
                  "Are you sure you want to clear all past events?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: clearPastEvents,
                    },
                  ]
                );
              }}
            >
              <Text
                style={[styles.clearButtonText, { color: theme.background }]}
              >
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {pastEvents.length === 0 ? (
          <View
            style={[
              styles.emptyStateContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <Image
              source={require("../../../assets/Vitus_Happy.png")}
              style={styles.emptyStateImage}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              Ingen tidligere hendelser
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: theme.textSecondary },
              ]}
            >
              Det er dessverre ingen tidligere hendelser per nå.
            </Text>
          </View>
        ) : (
          pastEvents.map((event) => (
            <React.Fragment key={event.id}>{renderEvent(event)}</React.Fragment>
          ))
        )}
      </ScrollView>

      {/* Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide" // Endret til slide for en renere følelse
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[styles.menuContainer, { backgroundColor: theme.surface }]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleStartAgain}
            >
              <MaterialCommunityIcons
                name="restart"
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                Start igjen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteEvent}
            >
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color={theme.error || "#FF0000"}
              />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                Delete Event
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  contentContainer: { paddingTop: 0, flexGrow: 1 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 24, fontWeight: "600" },
  emptyStateContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 4,
  },
  emptyStateImage: { width: 100, height: 100, marginBottom: 16 },
  emptyStateTitle: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  emptyStateSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    maxWidth: 280,
  },
  eventCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  eventImage: { width: 60, height: 60, marginRight: 12 },
  eventDetails: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: { fontSize: 20, fontWeight: "bold" },
  progressText: { fontSize: 14, fontWeight: "500" },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonText: { fontSize: 14, fontWeight: "600" },
  swipeButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  swipeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Litt lysere overlay
    justifyContent: "flex-end", // Plasserer menyen nederst
    alignItems: "center",
  },
  menuContainer: {
    width: "100%", // Full bredde for clean look
    borderTopLeftRadius: 16, // Rundede kanter øverst
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14, // Mer vertikal plass
    borderBottomWidth: 1, // Separator mellom elementer
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16, // Økt avstand til ikon
    fontWeight: "400", // Mindre fet tekst for renere look
  },
});

export default PastEvents;
