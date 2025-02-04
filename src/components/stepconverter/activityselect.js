import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";

const activities = [
  "Styrke",
  "Basketball",
  "Planke",
  "Fotball",
  "Gå",
  "Svømming",
  "Sykling",
  "Jogging",
  "Padel",
];

const ActivitySelect = ({ navigation, route }) => {
  const handleActivitySelect = (activity) => {
    navigation.navigate("DurationSelect", { activity });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.pageIndicator}>1/3</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Hva er Din <Text style={styles.highlightText}>Aktivitet</Text>
        </Text>
        <Text style={styles.subtitle}>
          Velg Hvilke aktivitet du har gjennomført.
        </Text>

        <ScrollView style={styles.activitiesList}>
          {activities.map((activity, index) => (
            <TouchableOpacity
              key={index}
              style={styles.activityButton}
              onPress={() => handleActivitySelect(activity)}
            >
              <Text style={styles.activityText}>{activity}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => handleActivitySelect("Gå")}
        >
          <Text style={styles.continueButtonText}>Fortsett</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5F7F6",
    borderRadius: 4,
    marginHorizontal: 16,
  },
  progressFill: {
    width: "33%",
    height: "100%",
    backgroundColor: "#00ADB5",
    borderRadius: 4,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  highlightText: {
    color: "#00ADB5",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 32,
  },
  activitiesList: {
    flex: 1,
  },
  activityButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  activityText: {
    fontSize: 18,
    color: "#000000",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
  },
  continueButton: {
    flex: 1,
    padding: 16,
    backgroundColor: "#00ADB5",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ActivitySelect;
