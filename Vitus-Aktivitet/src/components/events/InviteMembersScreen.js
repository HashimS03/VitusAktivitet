import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Share,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "../context/ThemeContext";

const InviteMembersScreen = ({ visible, onClose, eventId }) => {
  const { theme, isDarkMode } = useTheme();

  // Use a production-ready base URL; replace with your actual server URL
  const baseUrl = "https://your-app-server.com"; // Replace with actual server URL
  const eventLink = `${baseUrl}/event/${eventId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my event! Scan the QR code or click this link: ${eventLink}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surface }]}
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>Din gruppe</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Dine venner kan scanne{"\n"}denne QR koden for å bli{"\n"}med i
            gruppen
          </Text>

          <View
            style={[
              styles.qrContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <QRCode
              value={eventLink}
              size={200}
              backgroundColor={theme.background}
              color={isDarkMode ? "white" : "black"}
            />
          </View>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
              Eller
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: theme.surface }]}
            onPress={handleShare}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color={theme.text}
            />
            <Text style={[styles.shareButtonText, { color: theme.text }]}>
              Del Lenke
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Ferdig</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 40,
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  doneButton: {
    position: "absolute",
    bottom: 34,
    left: 20,
    right: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default InviteMembersScreen;