"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Modal, Alert } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import * as Progress from "react-native-progress"

const ActiveSoloEvent = ({ route }) => {
  const { eventDetails } = route.params || {}
  const [isModalVisible, setModalVisible] = useState(false)
  const [progress, setProgress] = useState(0.4) // Example progress
  const [currentValue, setCurrentValue] = useState(40) // Example current value
  const [targetValue, setTargetValue] = useState(100) // Example target
  const navigation = useNavigation()
  const { theme, isDarkMode } = useTheme()

  useEffect(() => {
    navigation.setOptions({
      transitionSpec: {
        open: { animation: "timing", config: { duration: 300 } },
        close: { animation: "timing", config: { duration: 300 } },
      },
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [layouts.screen.height, 0] }),
            },
          ],
        },
      }),
    })
  }, [navigation])

  const toggleModal = () => setModalVisible(!isModalVisible)
  const handleBackPress = () => navigation.navigate("EventsMain", { screen: "YourEvents" })

  const handleEditEvent = () => {
    toggleModal()
    navigation.navigate("NewEvent", { eventDetails })
  }

  const handleDeleteEvent = () => {
    Alert.alert("Slett hendelse", "Er du sikker på at du vil slette denne hendelsen?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: () => {
          console.log("Deleting event:", eventDetails?.id)
          navigation.navigate("EventsMain", { screen: "YourEvents" })
        },
      },
    ])
  }

  const handleUpdateProgress = () => {
    // Example progress update
    const newProgress = Math.min(progress + 0.1, 1)
    const newCurrentValue = Math.min(currentValue + 10, targetValue)
    setProgress(newProgress)
    setCurrentValue(newCurrentValue)
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Solo Utfordring</Text>
          <TouchableOpacity onPress={toggleModal} style={styles.menuButton}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <Image source={require("../../../assets/event-illustration.png")} style={styles.eventBanner} />

        <View style={[styles.eventInfoContainer, { backgroundColor: isDarkMode ? "#333333" : "#F5F5F5" }]}>
          <Text style={[styles.eventTitle, { color: theme.text }]}>{eventDetails?.title || "Push-ups Utfordring"}</Text>
          <View style={styles.eventDetails}>
            <MaterialCommunityIcons name="calendar" size={20} color={theme.textSecondary} />
            <Text style={[styles.eventDetailText, { color: theme.textSecondary }]}>
              {eventDetails?.date || "Fri, Apr 23 • 6:00 PM"}
            </Text>
          </View>
          <View style={styles.eventDetails}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.textSecondary} />
            <Text style={[styles.eventDetailText, { color: theme.textSecondary }]}>
              {eventDetails?.location || "Hjemmetrening"}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Din Fremgang</Text>
          <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
            <View style={styles.progressHeader}>
              <MaterialCommunityIcons name="arm-flex" size={24} color={theme.primary} />
              <Text style={[styles.progressTitle, { color: theme.text }]}>Push-ups</Text>
            </View>
            <Progress.Bar
              progress={progress}
              width={null}
              height={10}
              color={theme.primary}
              unfilledColor={theme.primary + "30"}
              borderWidth={0}
              borderRadius={5}
              style={styles.progressBar}
            />
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {currentValue} av {targetValue} repetisjoner
              </Text>
              <Text style={[styles.progressPercentage, { color: theme.primary }]}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.primary }]}
            onPress={handleUpdateProgress}
          >
            <MaterialCommunityIcons name="plus" size={24} color={theme.background} />
            <Text style={[styles.updateButtonText, { color: theme.background }]}>Oppdater fremgang</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistikk</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="timer-outline" size={24} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text }]}>15:30</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Beste tid</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="trending-up" size={24} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text }]}>50</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Maks reps</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="fire" size={24} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text }]}>5</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Dagers streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Beskrivelse</Text>
          <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
            {eventDetails?.description ||
              "Utfordre deg selv med denne push-ups utfordringen! Målet er å nå 100 push-ups på tid. Registrer fremgangen din og følg med på personlige rekorder."}
          </Text>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.modalOption} onPress={handleEditEvent}>
              <MaterialCommunityIcons name="pencil" size={24} color={theme.text} />
              <Text style={[styles.modalOptionText, { color: theme.text }]}>Rediger hendelse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleDeleteEvent}>
              <MaterialCommunityIcons name="delete" size={24} color="#FF0000" />
              <Text style={[styles.modalOptionText, { color: "#FF0000" }]}>Slett hendelse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
              <Text style={[styles.modalCloseButtonText, { color: theme.primary }]}>Lukk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
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
  },
  menuButton: {
    padding: 8,
  },
  eventBanner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  eventInfoContainer: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 16,
    marginLeft: 8,
  },
  progressSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  progressBar: {
    marginVertical: 8,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "600",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  descriptionSection: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
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
    fontWeight: "600",
  },
})

export default ActiveSoloEvent

