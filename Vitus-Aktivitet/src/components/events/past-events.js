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
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";

const PastEvents = () => {
  const { theme, accentColor } = useTheme();
  const { myPastEvents, clearPastEvents, deleteEvent, loadEvents } = useContext(EventContext);
  const navigation = useNavigation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const vitusHappyImages = {
    "#48CAB2": require("../../../assets/Vitus_Happy.png"),
    "#FF6B6B": require("../../../assets/Vitus_Happy_Red.png"),
    "#FFD93D": require("../../../assets/Vitus_Happy_Gold.png"),
    "#4C82FB": require("../../../assets/Vitus_Happy_Blue.png"),
    "#8A4FFF": require("../../../assets/Vitus_Happy_Purple.png"),
  };

  const selectedVitusHappyImage =
    vitusHappyImages[accentColor] || require("../../../assets/Vitus_Happy.png");

  // Refresh data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refresh events when screen gains focus
      refreshEvents();
      return () => {};
    }, [])
  );
  
  const refreshEvents = async () => {
    setRefreshing(true);
    try {
      await loadEvents();
    } catch (error) {
      console.error("Failed to refresh events:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
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
      outputRange: [0, 0], // Changed to prevent sliding beyond the card width
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeContainer}>
        <TouchableOpacity
          style={[
            styles.swipeButton,
            {
              backgroundColor: theme.error || "#FF0000",
            },
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
      </View>
    );
  };

  const renderEvent = (event) => {
    // Normalize the event ID to ensure consistency
    const eventId = event.Id || event.id;
    
    if (!eventId) {
      console.error("Event without ID detected:", event);
      return null;
    }
    
    // Create a normalized event object with both id and Id fields
    const normalizedEvent = {
      ...event,
      id: eventId,
      Id: eventId
    };
    
    return (
      <Swipeable
        key={eventId}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, eventId)
        }
        friction={2}
        rightThreshold={40}
        overshootRight={false}
        enabled={true}
      >
        <TouchableOpacity
          style={[styles.eventCard, { backgroundColor: theme.surface }]}
          onPress={() =>
            navigation.navigate("ActiveEvent", { 
              eventId,
              eventData: normalizedEvent
            })
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshEvents}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Tidligere hendelser
          </Text>
          {myPastEvents.length > 0 && (
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

        {myPastEvents.length === 0 ? (
          <View
            style={[
              styles.emptyStateContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <Image
              source={selectedVitusHappyImage}
              style={styles.emptyStateImage}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              Ingen tidligere hendelser
            </Text>
            <Text
              style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}
            >
              Du har ingen tidligere hendelser ennå.
            </Text>
          </View>
        ) : (
          myPastEvents.map((event) => renderEvent(event))
        )}
      </ScrollView>

      {/* Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide"
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
  swipeContainer: {
    flex: 1,
    borderRadius: 16, // Match eventCard
    marginHorizontal: 4, // Match eventCard
    marginBottom: 16, // Match eventCard
    overflow: "hidden", // Prevent overflow
  },
  swipeButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16, // Match eventCard padding
    borderRadius: 16, // Match eventCard
    width: "100%", // Ensure it takes full width of swipeContainer
    height: "100%", // Ensure it takes full height of swipeContainer
  },
  swipeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  menuContainer: {
    width: "100%",
    borderTopLeftRadius: 16,
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: "400",
  },
});

export default PastEvents;