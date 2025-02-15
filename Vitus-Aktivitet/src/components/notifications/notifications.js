import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme
import { useNavigation } from "@react-navigation/native";

const notifications = [
  { id: "1", title: "New Challenge Available!", description: "Join the latest running challenge." },
  { id: "2", title: "Leaderboard Update", description: "You're now in the top 5! Keep going!" },
  { id: "3", title: "Event Reminder", description: "Don't forget about your upcoming event!" },
];

export default function Notifications() {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Get theme values

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        {/* Centered Header Title */}
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
      </View>

      {/* Notifications List with Extra Spacing */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer} // ✅ Ensures spacing below header
        renderItem={({ item }) => (
          <View style={[styles.notificationCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.notificationTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.notificationDescription, { color: theme.textSecondary }]}>{item.description}</Text>
          </View>
        )}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16, // ✅ Added space
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 12, // ✅ Increased touchable area
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    right: 24, // ✅ Aligns title to center
    textAlign: "center",
    flex: 1, // ✅ Ensures proper centering
  },
  listContainer: {
    paddingTop: 24, // ✅ Increased spacing between header and first notification card
  },
  notificationCard: {
    padding: 18, // ✅ More padding for better spacing
    marginHorizontal: 16,
    marginBottom: 12, // ✅ Increased margin for spacing
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6, // ✅ More spacing
  },
  notificationDescription: {
    fontSize: 14,
  },
});

