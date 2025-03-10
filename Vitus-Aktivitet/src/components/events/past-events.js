import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";

const PastEvents = () => {
  const { theme } = useTheme();
  const { pastEvents, clearPastEvents } = useContext(EventContext);

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const renderEvent = (event) => {
    const progress = event.currentValue / event.goalValue || 0;
    const unit = event.selectedActivity?.unit || "sekunder";

    return (
      <View
        key={event.id}
        style={[styles.eventCard, { backgroundColor: theme.surface }]}
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
              <TouchableOpacity disabled>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={24}
                  color={theme.text + "50"}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              Avsluttet: {new Date(event.end_date).toLocaleDateString()} •{" "}
              {new Date(event.end_date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>
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
              <Text style={[styles.clearButtonText, { color: theme.background }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {pastEvents.length === 0 ? (
          <View
            style={[styles.emptyStateContainer, { backgroundColor: theme.surface }]}
          >
            <Image
              source={require("../../../assets/Vitus_Happy.png")}
              style={styles.emptyStateImage}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              Ingen tidligere hendelser
            </Text>
            <Text
              style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}
            >
              Det er desverre ingen tidligere hendelser per nå.
            </Text>
          </View>
        ) : (
          pastEvents.map((event) => renderEvent(event))
        )}
      </ScrollView>
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
  emptyStateSubtitle: { fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22, maxWidth: 280 },
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
});

export default PastEvents;