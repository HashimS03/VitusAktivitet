import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { EventContext } from "../events/EventContext";

const EventDetail = ({ route }) => {
  const { eventId } = route.params || {};
  const { theme } = useTheme();
  const { activeEvents } = useContext(EventContext);

  const event = activeEvents.find((e) => e.id === eventId);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Event Detaljer</Text>
      {event ? (
        <>
          <Text style={[styles.text, { color: theme.text }]}>
            Tittel: {event.title}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Beskrivelse: {event.description}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Mål: {event.goalValue} {event.selectedActivity?.unit}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Startdato: {event.startDate.toLocaleDateString()}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Sluttdato: {event.endDate.toLocaleDateString()}
          </Text>
        </>
      ) : (
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          Event ikke funnet
        </Text>
      )}
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
