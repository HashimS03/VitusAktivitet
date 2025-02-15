import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import InviteMembersScreen from "./InviteMembersScreen";

const ActiveEventImproved = ({ route }) => {
  const { eventDetails } = route.params || {};
  const [isModalVisible, setModalVisible] = useState(false);
  const [showInviteScreen, setShowInviteScreen] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      transitionSpec: {
        open: {
          animation: "timing",
          config: { duration: 300 },
        },
        close: {
          animation: "timing",
          config: { duration: 300 },
        },
      },
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateY: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.height, 0],
                }),
              },
            ],
          },
        };
      },
    });
  }, [navigation]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleBackPress = () => {
    navigation.navigate("EventsMain", { screen: "YourEvents" });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {eventDetails?.title || "Din gruppe"}
          </Text>
          <TouchableOpacity onPress={toggleModal} style={styles.menuButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <Image
         //source={require("../../../assets/vitusaktivitet_v2_sq.png")}
          //style={styles.eventBanner}
        />

        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventTitle}>
            {eventDetails?.title || "Hvem er sterkest? Push ups konkurranse"}
          </Text>
          <View style={styles.eventDetails}>
            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
            <Text style={styles.eventDetailText}>
              {eventDetails?.date || "Fri, Apr 23 • 6:00 PM"}
            </Text>
          </View>
          <View style={styles.eventDetails}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
            <Text style={styles.eventDetailText}>
              {eventDetails?.location || "Alf bjeckes vei 28 • Oslo"}
            </Text>
          </View>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Medlemmer</Text>
          <Text style={styles.memberCount}>1 av 4 medlemmer</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.membersList}
          >
            <View style={styles.memberAvatar}>
              <Image
                source={require("../../../assets/member-avatar.png")}
                style={styles.avatarImage}
              />
              <Text style={styles.memberName}>Hanne</Text>
            </View>
            {[1, 2, 3].map((i) => (
              <TouchableOpacity
                key={i}
                style={styles.emptyAvatar}
                onPress={() => setShowInviteScreen(true)}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#00BFA5" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Beskrivelse</Text>
          <Text style={styles.descriptionText}>
            {eventDetails?.description ||
              "La oss se hvem som kan gjøre flest push-ups! Kom og bli med på denne morsomme konkurransen og test din styrke."}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => setShowInviteScreen(true)}
        >
          <MaterialCommunityIcons name="account-plus" size={24} color="#FFF" />
          <Text style={styles.inviteButtonText}>Inviter medlemmer</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption}>
              <MaterialCommunityIcons name="pencil" size={24} color="#000" />
              <Text style={styles.modalOptionText}>Rediger hendelse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <MaterialCommunityIcons name="delete" size={24} color="#FF0000" />
              <Text style={[styles.modalOptionText, { color: "#FF0000" }]}>
                Slett hendelse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={toggleModal}
            >
              <Text style={styles.modalCloseButtonText}>Lukk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <InviteMembersScreen
        visible={showInviteScreen}
        onClose={() => setShowInviteScreen(false)}
        eventId={eventDetails?.id || "123"}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  menuButton: {
    padding: 8,
  },
  /*eventBanner: {
    width: "100%",
    height: 200,
    alignSelf: "center",
  },*/
  eventInfoContainer: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    margin: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  membersSection: {
    padding: 16,
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
  },
  memberAvatar: {
    alignItems: "center",
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
    color: "#666",
  },
  emptyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5F7F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  descriptionSection: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00BFA5",
    paddingVertical: 16,
    borderRadius: 12,
    margin: 16,
  },
  inviteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 16,
  },
  modalCloseButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: "#00BFA5",
    fontWeight: "600",
  },
});

export default ActiveEventImproved;
