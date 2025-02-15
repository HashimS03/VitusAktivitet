import React from "react";
import { 
  View, 
  Text,
  Image, 
  StyleSheet, 
  SafeAreaView 
} from "react-native";
import { useTheme } from "../context/ThemeContext"; // Import Theme Context

const PastEvents = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* No Events Illustration */}
        <Image
          source={require("../../../assets/CalenderClock.png")}
          style={styles.calendarImage}
          resizeMode="contain"
        />

        {/* No Events Message */}
        <Text style={[styles.noEventTitle, { color: theme.text }]}>No Past Event</Text>
        <Text style={[styles.noEventSubtitle, { color: theme.textSecondary }]}>
          Det er desverre ingen tidligere hendelser per nå...
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  calendarImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  noEventTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  noEventSubtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 24,
  },
});

export default PastEvents;
