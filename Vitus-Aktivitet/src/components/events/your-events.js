import React, { useContext, useState, useEffect, useRef } from "react";
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
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";
import * as Progress from "react-native-progress";
import AsyncStorage from '@react-native-async-storage/async-storage';

const YourEvents = () => {
  const navigation = useNavigation();
  const { theme, accentColor } = useTheme(); // Added accentColor
  const { 
    // Use the filtered "my events" (created by user) categories from EventContext
    myActiveEvents, myUpcomingEvents, myPastEvents,
    deleteEvent, loadEvents
  } = useContext(EventContext);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const userId = useRef(null);

  // Map accent colors to the correct Vitus_Happy images
  const vitusHappyImages = {
    "#48CAB2": require("../../../assets/Vitus_Happy.png"), // Teal
    "#FF6B6B": require("../../../assets/Vitus_Happy_Red.png"),
    "#FFD93D": require("../../../assets/Vitus_Happy_Gold.png"),
    "#4C82FB": require("../../../assets/Vitus_Happy_Blue.png"),
    "#8A4FFF": require("../../../assets/Vitus_Happy_Purple.png"),
  };

  // Select the appropriate Vitus_Happy image based on accentColor
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

  useEffect(() => {
    const loadUserId = async () => {
      userId.current = await AsyncStorage.getItem('userId');
      console.log("Current user ID:", userId.current);
    };
    
    loadUserId();
  }, []);

  const handleCreateEvent = () => {
    navigation.navigate("NewEvent");
  };

  const handleMenuPress = (event) => {
    setSelectedEvent(event);
    setMenuVisible(true);
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteEvent(eventId);
          setMenuVisible(false);
          // Refresh events after deletion
          refreshEvents();
        },
      },
    ]);
  };

  const handleEditEvent = (event) => {
    setMenuVisible(false);
    navigation.navigate("NewEvent", { eventDetails: event, isEditing: true });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return ""; // Handle null or undefined text
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Function to render an event card with consistent ID handling
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

    // Calculate progress if available
    const progress = event.progress || (event.currentValue && event.goalValue ? 
      event.currentValue / event.goalValue : 0);

    return (
      <TouchableOpacity
        key={eventId}
        style={[styles.eventCard, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate("ActiveEvent", { 
          eventId,
          eventData: normalizedEvent // Pass the full normalized event data
        })}
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
                  size={20}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={[styles.eventDescription, { color: theme.textSecondary }]}
            >
              {truncateText(event.description, 30)}
            </Text>
            
            {/* Add progress bar if this is an active event */}
            {myActiveEvents.some(e => e.id === eventId || e.Id === eventId) && (
              <View style={styles.progressContainer}>
                <Progress.Bar
                  progress={progress}
                  width={null}
                  height={8}
                  color={theme.primary}
                  unfilledColor={theme.primary + "30"}
                  borderWidth={0}
                  borderRadius={5}
                  style={styles.progressBar}
                />
                <Text style={[styles.progressText, { color: theme.primary }]}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
            )}
            
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {event.location}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {formatDate(event.start_date)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Check if there are any active events to display
  const hasEvents = myActiveEvents.length > 0;

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
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.createEventButton, { backgroundColor: theme.primary }]}
            onPress={handleCreateEvent}
          >
            <MaterialCommunityIcons name="plus" size={24} color={theme.background} />
            <Text style={[styles.createEventText, { color: theme.background }]}>
              Opprett
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
              Bli med
            </Text>
          </TouchableOpacity>
        </View>

        {!hasEvents ? (
          <View
            style={[styles.emptyStateContainer, { backgroundColor: theme.surface }]}
          >
            <Image
              source={selectedVitusHappyImage}
              style={styles.emptyStateImage}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              Ingen aktive hendelser
            </Text>
            <Text
              style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}
            >
              Du har ingen aktive hendelser. Opprett eller bli med for å starte.
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
              onPress={handleCreateEvent}
            >
              <Text
                style={[styles.emptyStateButtonText, { color: theme.background }]}
              >
                Opprett hendelse
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Active Events Section */}
            {myActiveEvents.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Aktive hendelser
                  </Text>
                </View>
                {myActiveEvents.map(event => renderEvent(event))}
              </>
            )}
          </>
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
            style={[styles.menuContent, { backgroundColor: theme.surface, shadowColor: theme.text }]}
          >
            <TouchableOpacity style={styles.menuOption} onPress={() => handleEditEvent(selectedEvent)}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.text} />
              <Text style={[styles.menuOptionText, { color: theme.text }]}>Edit Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleDeleteEvent(selectedEvent?.id || selectedEvent?.Id)}
            >
              <MaterialCommunityIcons name="delete" size={24} color="#FF0000" />
              <Text style={[styles.menuOptionText, { color: "#FF0000" }]}>Delete Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuCloseButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={[styles.menuCloseButtonText, { color: theme.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  contentContainer: { paddingTop: 0, flexGrow: 1 },
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
  createEventText: { fontSize: 16, fontWeight: "600" },
  joinEventText: { fontSize: 16, fontWeight: "600" },
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
  emptyStateSubtitle: { fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22, maxWidth: 280 },
  emptyStateButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  emptyStateButtonText: { fontSize: 16, fontWeight: "600" },
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
  progressContainer: {
    marginBottom: 8,
    marginTop: 4
  },
  progressBar: { 
    marginBottom: 4,
  },
  progressText: { 
    fontSize: 14, 
    fontWeight: "500",
    textAlign: "right"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContent: { width: "80%", borderRadius: 12, padding: 16 },
  menuOption: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  menuOptionText: { fontSize: 16, marginLeft: 16 },
  menuCloseButton: { alignItems: "center", paddingVertical: 12, marginTop: 8 },
  menuCloseButtonText: { fontSize: 16, fontWeight: "600" },
  emptyMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  eventDescription: { marginBottom: 8, fontSize: 14 },
  eventMeta: { flexDirection: "row", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
});

export default YourEvents;