import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const YourEvents = ({ setActiveTab, activeTab }) => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Hendelser</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.inactiveTab]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[styles.tabText, activeTab === "upcoming" && styles.inactiveTabText]}>UPCOMING</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "your" && styles.activeTab]}
            onPress={() => setActiveTab("your")}
          >
            <Text style={[styles.tabText, activeTab === "your" && styles.activeTabText]}>YOUR EVENTS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.inactiveTab]}
            onPress={() => setActiveTab("past")}
          >
            <Text style={[styles.tabText, activeTab === "past" && styles.inactiveTabText]}>PAST EVENTS</Text>
          </TouchableOpacity>
        </View>

        {/* Action Cards */}
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("NewEvent")}>
          <Text style={styles.actionCardText}>Opprett hendelse</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("JoinEvent")}>
          <Text style={styles.actionCardText}>Join Hendelse</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        {/* Active Events Section */}
        <View style={styles.activeEventsSection}>
          <Text style={styles.sectionTitle}>
            Dine <Text style={styles.highlightText}>Aktive</Text> Hendelser
          </Text>

          {/* Event Card */}
          <TouchableOpacity style={styles.eventCard}>
            <Image
              source={require("../../../assets/event-illustration.png")}
              style={styles.eventImage}
              resizeMode="cover"
            />
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>LØP LØP LØP!</Text>
                <TouchableOpacity>
                  <MaterialCommunityIcons name="dots-horizontal" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.eventTime}>10:00 - 10:00</Text>
              <Text style={styles.eventDate}>18. Jan</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
    color: "#1A1A1A",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#00BFA5",
    fontWeight: "600",
  },
  inactiveTabText: {
    color: "#999",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
})

export default YourEvents

