import React from "react";
import { View, Text, StyleSheet } from "react-native";

const EventDetail = ({ route }) => {
  const { eventId } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Detaljer</Text>
      <Text style={styles.text}>Event ID: {eventId || "Ukjent"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
