"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define the avatars list (same as in EditAvatar)
const avatars = [
  { id: 1, source: require("../../../assets/avatars/Avatar_Asian.png") },
  { id: 2, source: require("../../../assets/avatars/Avatar_Athlete.png") },
  { id: 3, source: require("../../../assets/avatars/Avatar_Dizzy.png") },
  { id: 4, source: require("../../../assets/avatars/Avatar_Gangster.png") },
  { id: 5, source: require("../../../assets/avatars/Avatar_Happy.png") },
  { id: 6, source: require("../../../assets/avatars/Avatar_Love.png") },
  { id: 7, source: require("../../../assets/avatars/Avatar_Sikh.png") },
  { id: 8, source: require("../../../assets/avatars/Avatar_Smirk.png") },
  { id: 9, source: require("../../../assets/avatars/Avatar_Hijabi.png") },
  { id: 10, source: require("../../../assets/avatars/Avatar_Silly.png") },
]

const SettingsRow = ({ icon, title, value, onPress, isLastItem }) => {
  const { theme } = useTheme()
  const accentColor = theme.primary

  return (
    <TouchableOpacity
      style={[
        styles.settingsRow,
        !isLastItem && {
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingsLeft}>
        <Ionicons name={icon} size={24} color={theme.text} />
        <Text style={[styles.settingsText, { color: theme.text }]}>{title}</Text>
      </View>
      {value && (
        <Text style={[styles.settingsValue, { color: accentColor }, value === "ON" && styles.activeValue]}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const SettingsSection = ({ children }) => {
  const { theme } = useTheme()
  return <View style={[styles.settingsSection, { backgroundColor: theme.surface }]}>{children}</View>
}

export default function SettingScreen() {
  const navigation = useNavigation()
  const { theme, isDarkMode } = useTheme()
  const [avatarSelection, setAvatarSelection] = useState(null)

  // Load the avatar selection when the component mounts
  useEffect(() => {
    const loadAvatarSelection = async () => {
      try {
        const selection = await AsyncStorage.getItem("userAvatarSelection")
        if (selection) {
          setAvatarSelection(JSON.parse(selection))
        }
      } catch (error) {
        console.error("Error loading avatar selection:", error)
      }
    }
    loadAvatarSelection()
  }, [])

  // Reload avatar selection when the screen is focused
  useEffect(() => {
    const subscription = navigation.addListener("focus", () => {
      const loadAvatarSelection = async () => {
        try {
          const selection = await AsyncStorage.getItem("userAvatarSelection")
          if (selection) {
            setAvatarSelection(JSON.parse(selection))
          }
        } catch (error) {
          console.error("Error loading avatar selection:", error)
        }
      }
      loadAvatarSelection()
    })
    return subscription
  }, [navigation])

  const handleLogout = () => {
    Alert.alert("Logg ut", "Er du sikker på at du vil logge ut?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Logg ut",
        style: "destructive",
        onPress: () => {
          // Fikset navigasjon til Start-skjermen
          navigation.reset({
            index: 0,
            routes: [{ name: "Start" }],
          })
        },
      },
    ])
  }

  const themeMode = isDarkMode ? "Mørk Modus" : "Lys Modus"

  // Find the selected avatar object if type is "avatar"
  const selectedAvatarObj =
    avatarSelection?.type === "avatar" ? avatars.find((avatar) => avatar.id === avatarSelection.value) : null

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.settingsHeader, { color: theme.text }]}>Innstillinger</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarSelection?.type === "photo" ? (
              <Image source={{ uri: avatarSelection.value }} style={styles.avatar} />
            ) : selectedAvatarObj ? (
              <Image source={selectedAvatarObj.source} style={styles.avatar} />
            ) : (
              <Image
                source={require("../../../assets/avatars/memo_35.png")} // Default avatar
                style={styles.avatar}
              />
            )}
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate("EditAvatar")} // Navigate within SettingsStack
            >
              <Ionicons name="pencil" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>Navn</Text>
          <Text style={[styles.contact, { color: theme.textSecondary }]}>youremail@domain.com | +47 256 27 189</Text>
        </View>

        {/* Settings Sections */}
        <SettingsSection>
          {[
            {
              icon: "document-text",
              title: "Rediger Profil Informasjon",
              route: "EditProfile",
            },
            {
              icon: "notifications",
              title: "Varslinger",
              value: "ON",
              route: "notificationeditor",
            },
            {
              icon: "language",
              title: "Språk",
              value: "Norsk",
              route: "Language",
            },
          ].map((item, index, array) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              value={item.value}
              onPress={() => navigation.navigate(item.route)} // Navigate within SettingsStack
              isLastItem={index === array.length - 1}
            />
          ))}
        </SettingsSection>

        <SettingsSection>
          {[
            {
              icon: "shield-checkmark",
              title: "Sikkerhet og Personvern",
              route: "securityprivacy",
            },
            {
              icon: "color-palette",
              title: "Tema",
              value: themeMode,
              route: "Theme",
            },
          ].map((item, index, array) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              value={item.value}
              onPress={() => navigation.navigate(item.route)} // Navigate within SettingsStack
              isLastItem={index === array.length - 1}
            />
          ))}
        </SettingsSection>

        <SettingsSection>
          {[
            {
              icon: "help-circle",
              title: "Help & Support",
              route: "helpsupport",
            },
            { icon: "chatbubbles", title: "Kontakt oss", route: "contactus" },
            { icon: "log-out", title: "Logg ut", onPress: handleLogout },
          ].map((item, index, array) => (
            <SettingsRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              onPress={
                item.onPress ? item.onPress : () => navigation.navigate(item.route) // Navigate within SettingsStack
              }
              isLastItem={index === array.length - 1}
            />
          ))}
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    zIndex: 999,
  },
  settingsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  contact: { marginBottom: 24 },
  settingsSection: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  settingsLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingsText: { fontSize: 16 },
  settingsValue: { fontSize: 16 },
  activeValue: { fontWeight: "600" },
})

