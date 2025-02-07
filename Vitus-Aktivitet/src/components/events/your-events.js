import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const YourEvents = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Action Cards */}
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate("NewEvent")}
        >
          <Text style={styles.actionCardText}>Opprett hendelse</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate("JoinEvent")}
        >
          <Text style={styles.actionCardText}>Join Hendelse</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        {/* Active Events Section */}
        <View style={styles.activeEventsSection}>
          <Text style={styles.sectionTitle}>
            Dine <Text style={styles.highlightText}>Aktive</Text> Hendelser
          </Text>

          

          {/* Empty State (No Active Events) */}
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventTitle}>Ingen Aktive Hendelser</Text>
            <Text style={styles.noEventSubtitle}>
              Du har for øyeblikket ingen aktive hendelser.
            </Text>
          </View>

        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30, // ✅ Fix Navbar Padding
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 80, // ✅ Ensure space for bottom navigation
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  activeEventsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
    color: "#1A1A1A",
  },
  highlightText: {
    color: "#00BFA5",
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  eventImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E5E5E5",
  },
  eventContent: {
    padding: 16,
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
    color: "#1A1A1A",
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
  },
  noEventsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  noEventTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  noEventSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 24,
  },
});

export default YourEvents;
