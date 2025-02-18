import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { ChevronLeft, Search } from "lucide-react-native";

const TEAL_COLOR = "#00B6AA";

const departments = [
  "Frogner",
  "CC Vest",
  "Oslo City",
  "Oslo S",
  "Alna",
  "Bogstadveien",
  "Colleseum",
  "Storo",
  "Veitvet",
];

export default function DepartmentSelection({ navigation, onComplete }) {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0.66,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]); // Added progress to dependencies

  const handleSelect = (department) => {
    setSelectedDepartment(department);
  };

  const handleContinue = () => {
    if (selectedDepartment) {
      onComplete(selectedDepartment);
      navigation.navigate("AvatarSelection"); // Replace with your next screen
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>2/3</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Hva er Din <Text style={styles.highlight}>Avdeling</Text>
        </Text>
        <Text style={styles.subtitle}>La oss bli bedre kjent.</Text>

        <ScrollView style={styles.departmentList}>
          {departments.map((department) => (
            <TouchableOpacity
              key={department}
              style={[
                styles.departmentItem,
                selectedDepartment === department && styles.selectedDepartment,
              ]}
              onPress={() => handleSelect(department)}
            >
              <Text
                style={[
                  styles.departmentText,
                  selectedDepartment === department &&
                    styles.selectedDepartmentText,
                ]}
              >
                {department}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate("AvatarSelection")}
        >
          <Text style={styles.skipButtonText}>Hopp Over</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedDepartment && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueButtonText,
              selectedDepartment && styles.continueButtonTextActive,
            ]}
          >
            Fortsett
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5F7F6",
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: TEAL_COLOR,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  highlight: {
    color: TEAL_COLOR,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  departmentList: {
    flex: 1,
  },
  departmentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  selectedDepartment: {
    backgroundColor: "#E5F7F6",
    marginHorizontal: -2,
    paddingHorizontal: 24,
  },
  departmentText: {
    fontSize: 16,
    color: "#666",
  },
  selectedDepartmentText: {
    color: TEAL_COLOR,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 24,
    paddingBottom: 40,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#E5F7F6",
  },
  skipButtonText: {
    color: TEAL_COLOR,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  continueButtonActive: {
    backgroundColor: TEAL_COLOR,
  },
  continueButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButtonTextActive: {
    color: "#FFF",
  },
});
