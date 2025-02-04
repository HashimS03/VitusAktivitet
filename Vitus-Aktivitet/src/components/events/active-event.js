import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const ActiveEvent = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.statusDot} />
          <Text style={styles.title}>Din gruppe</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
          <Text style={styles.locationText}>Alf bjeckes vei 28 • Oslo</Text>
        </View>

        <Text style={styles.description}>Inviter medlemmer for{"\n"}å bli med i gruppen!</Text>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Medlemmer</Text>
          <Text style={styles.memberCount}>0 av 1 medlemmer</Text>

          <View style={styles.membersList}>
            <View style={styles.memberAvatar}>
              <Image source={require("../../../assets/member-avatar.png")} style={styles.avatarImage} />
              <Text style={styles.memberName}>Hanne</Text>
            </View>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.emptyAvatar}>
                <MaterialCommunityIcons name="plus" size={24} color="#666" />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.eventSection}>
          <Text style={styles.sectionTitle}>Hendelse</Text>
          <TouchableOpacity style={styles.eventCard}>
            <Image source={require("../../../assets/event-illustration.png")} style={styles.eventImage} />
            <View style={styles.eventInfo}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>Hvem er sterkest? Push ups konkurranse</Text>
                <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
              </View>
              <View style={styles.eventDetails}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                <Text style={styles.eventLocation}>Alf bjeckes vei 28 • Oslo</Text>
              </View>
              <Text style={styles.eventDate}>Fri, Apr 23 • 6:00 PM</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate("Events")}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00BFA5",
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  closeButton: {
    padding: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
  },
  membersSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  membersList: {
    flexDirection: "row",
    gap: 16,
  },
  memberAvatar: {
    alignItems: "center",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
    color: "#666",
  },
  emptyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  eventSection: {
    flex: 1,
  },
  eventCard: {
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5F5F5",
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
  },
  doneButton: {
    backgroundColor: "#00BFA5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ActiveEvent

