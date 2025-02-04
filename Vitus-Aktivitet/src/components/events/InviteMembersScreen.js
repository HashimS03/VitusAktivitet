import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Share } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import QRCode from "react-native-qrcode-svg"
import { useNavigation } from "@react-navigation/native"

const InviteMembersScreen = ({ visible, onClose, eventId }) => {
  const navigation = useNavigation()

  const handleShare = async () => {
    try {
      const eventLink = `https://yourapp.com/join/${eventId}`
      await Share.share({
        message: "Join my event!",
        url: eventLink,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Din gruppe</Text>
          <Text style={styles.subtitle}>
            Dine venner can scanne{"\n"}denne QR koden for å bli{"\n"}med i gruppen
          </Text>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode value={`https://yourapp.com/join/${eventId}`} size={200} backgroundColor="white" color="black" />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Eller</Text>
            <View style={styles.divider} />
          </View>

          {/* Share Link Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#000" />
            <Text style={styles.shareButtonText}>Del Lenke</Text>
          </TouchableOpacity>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#666",
    fontSize: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
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
    backgroundColor: "#00BFA5",
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
})

export default InviteMembersScreen

