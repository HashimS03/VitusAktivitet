import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"

const YourEvents = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.createEventButton, { backgroundColor: "#7C3AED" }]}
            onPress={() => navigation.navigate("NewEvent")}
          >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
            <Text style={styles.createEventText}>Create Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.joinEventButton, { backgroundColor: "#2C2C2E" }]}
            onPress={() => navigation.navigate("JoinEvent")}
          >
            <MaterialCommunityIcons name="account-group" size={24} color="white" />
            <Text style={styles.joinEventText}>Join Event</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Events</Text>

        <View style={[styles.emptyStateContainer, { backgroundColor: "#2C2C2E" }]}>
          <Image source={require("../../../assets/CalenderClock.png")} style={styles.emptyStateImage} />
          <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Active Events</Text>
          <Text style={[styles.emptyStateSubtitle, { color: "#8E8E93" }]}>
            You don't have any active events at the moment.
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: "#7C3AED" }]}
            onPress={() => navigation.navigate("NewEvent")}
          >
            <Text style={styles.emptyStateButtonText}>Create an Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 0, // Remove top padding
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4, // Reduced from 8 to 4
    marginTop: 0, // Removed top margin
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
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  joinEventText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 4, // Reduced from 8 to 4
  },
  emptyStateContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 4, // Reduced from 8 to 4
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
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default YourEvents

