import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext"; // Import Theme Context

const EventDetail = ({ route }) => {
  const { eventId } = route.params || {};
  const { theme } = useTheme(); // Get theme values

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Event Detaljer</Text>
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        Event ID: {eventId || "Ukjent"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
  },
});

export default EventDetail;
