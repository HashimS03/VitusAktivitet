import React, { useContext, useState, useEffect } from "react";
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
  const { theme, accentColor } = useTheme();
  const { activeEvents, deleteEvent, updateEvent } = useContext(EventContext);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const vitusHappyImages = {
    "#48CAB2": require("../../../assets/Vitus_Happy.png"),
    "#FF6B6B": require("../../../assets/Vitus_Happy_Red.png"),
    "#FFD93D": require("../../../assets/Vitus_Happy_Gold.png"),
    "#4C82FB": require("../../../assets/Vitus_Happy_Blue.png"),
    "#8A4FFF": require("../../../assets/Vitus_Happy_Purple.png"),
  };

  const selectedVitusHappyImage =
    vitusHappyImages[accentColor] || require("../../../assets/Vitus_Happy.png");

  useEffect(() => {
    console.log("Active Events:", activeEvents); // For debugging
  }, [activeEvents]);

  const handleCreateEvent = () => {
    navigation.navigate("NewEvent");
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEvent(eventId);
          setMenuVisible(false);
        },
      },
    ]);
  };

  const handleEditEvent = (event) => {
    setMenuVisible(false);
    navigation.navigate("NewEvent", { eventDetails: event, isEditing: true });
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const renderEvent = (event) => {
    const progress = event.currentValue / event.goalValue || 0;
    const unit = event.selectedActivity?.unit || "sekunder";

    return (
      <TouchableOpacity
        key={event.Id} // Added unique key to the root element
        style={[styles.eventCard, { backgroundColor: theme.surface }]}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("ActiveEvent", { eventId: event.Id })
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
            <Progress.Bar
              progress={progress}
              width={null}
              height={8}
              color="#A3E4DB"
              unfilledColor="#A3E4DB30"
              borderWidth={0}
              borderRadius={4}
              style={styles.progressBar}
            />
            <Text style={[styles.progressText, { color: theme.text }]}>
              {event.currentValue || 0} {unit} / {event.goalValue || 0} {unit}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Aktive hendelser
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
              source={selectedVitusHappyImage}
              style={styles.emptyStateImage}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              Ingen aktive hendelser
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: theme.textSecondary },
              ]}
            >
              Du har ingen aktive hendelser. Opprett eller bli med for å starte.
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
                Opprett hendelse
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeEvents.map((event) => renderEvent(event))
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
              onPress={() => handleDeleteEvent(selectedEvent?.Id)}
            >
              <MaterialCommunityIcons name="delete" size={24} color="#FF0000" />
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
  progressBar: { marginBottom: 8 },
  progressText: { fontSize: 14, fontWeight: "500" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContent: { width: "80%", borderRadius: 12, padding: 16 },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuOptionText: { fontSize: 16, marginLeft: 16 },
  menuCloseButton: { alignItems: "center", paddingVertical: 12, marginTop: 8 },
  menuCloseButtonText: { fontSize: 16, fontWeight: "600" },
});

export default YourEvents;
