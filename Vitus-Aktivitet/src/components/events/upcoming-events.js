import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const UpcomingEvents = () => {
  const { theme, accentColor } = useTheme();
  const { myUpcomingEvents, loadEvents } = useContext(EventContext);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

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

  const truncateText = (text, maxLength) => {
    if (!text) return "";
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
      <TouchableOpacity
        key={eventId}
        style={[styles.eventCard, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate("ActiveEvent", { 
          eventId,
          eventData: normalizedEvent
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
            </View>
            <Text
              style={[styles.eventDescription, { color: theme.textSecondary }]}
            >
              {truncateText(event.description, 30)}
            </Text>
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
            Kommende hendelser
          </Text>
        </View>

        {myUpcomingEvents.length === 0 ? (
          <View
            style={[styles.emptyStateContainer, { backgroundColor: theme.surface }]}
          >
            <Image
              source={selectedVitusHappyImage}
              style={styles.emptyStateImage}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              Ingen hendelser
            </Text>
            <Text
              style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}
            >
              Ingen kommende hendelser. Hold utkikk for nye!
            </Text>
          </View>
        ) : (
          myUpcomingEvents.map((event) => renderEvent(event))
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
  emptyStateTitle: { fontSize: 24, fontWeight: "600", textAlign: "center", marginBottom: 8 },
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
});

export default UpcomingEvents;