import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";

const UpcomingEvents = () => {
  const { theme, accentColor } = useTheme(); // Added accentColor
  const { upcomingEvents } = useContext(EventContext);

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

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const renderEvent = (event) => {
    const progress = event.currentValue / event.goalValue || 0;
    const unit = event.selectedActivity?.unit || "sekunder";

    return (
      <View
        key={event.Id}
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
              Starter: {new Date(event.start_date).toLocaleDateString()} •{" "}
              {new Date(event.start_date).toLocaleTimeString([], {
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
            Kommende hendelser
          </Text>
        </View>

        {upcomingEvents.length === 0 ? (
          <View
            style={[styles.emptyStateContainer, { backgroundColor: theme.surface }]}
          >
            <Image
              source={selectedVitusHappyImage} // Updated to use dynamic image
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
          upcomingEvents.map((event) => renderEvent(event))
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