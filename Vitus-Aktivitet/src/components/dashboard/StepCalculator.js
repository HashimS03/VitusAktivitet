import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { X } from "lucide-react-native";

const StepCalculator = ({ onConfirm, onCancel, theme, accentColor }) => {
  const [duration, setDuration] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [intensity, setIntensity] = useState("Moderate");
  const [calculatedSteps, setCalculatedSteps] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const MET_PER_ACTIVITY = {
    Gå: { Low: 2.0, Moderate: 3.8, High: 5.0 },
    Jogging: { Low: 5.0, Moderate: 7.0, High: 10.0 },
    Løping: { Low: 8.0, Moderate: 11.5, High: 14.0 },
    Sykling: { Low: 4.0, Moderate: 8.0, High: 10.0 },
    Svømming: { Low: 4.0, Moderate: 6.0, High: 8.0 },
    Styrke: { Low: 3.0, Moderate: 5.0, High: 6.0 },
    Basketball: { Low: 6.0, Moderate: 8.0, High: 10.0 },
    Fotball: { Low: 7.0, Moderate: 10.0, High: 12.0 },
    Padel: { Low: 5.0, Moderate: 7.0, High: 9.0 },
    Planke: { Low: 2.0, Moderate: 3.0, High: 4.0 },
    Tennis: { Low: 5.0, Moderate: 8.0, High: 10.0 },
    Yoga: { Low: 2.0, Moderate: 2.5, High: 4.0 },
    Dans: { Low: 4.0, Moderate: 6.0, High: 8.0 },
    Håndball: { Low: 7.0, Moderate: 10.0, High: 12.0 },
    Vandring: { Low: 3.5, Moderate: 4.5, High: 6.0 },
    Rulleskøyter: { Low: 5.0, Moderate: 7.0, High: 9.0 },
    Klatring: { Low: 6.0, Moderate: 8.0, High: 10.0 },
    Boxing: { Low: 8.0, Moderate: 12.0, High: 14.0 },
    Zumba: { Low: 5.0, Moderate: 7.0, High: 9.0 },
    Tursti: { Low: 3.5, Moderate: 5.0, High: 7.0 },
  };

  const activities = Object.keys(MET_PER_ACTIVITY);
  const AVERAGE_WEIGHT_KG = 70;
  const STEPS_PER_KCAL = 20;

  const handleCalculate = () => {
    if (!selectedActivity) {
      Alert.alert("Feil", "Vennligst velg en aktivitet.");
      return;
    }
    const durationNum = parseInt(duration, 10);
    if (!isNaN(durationNum) && durationNum > 0) {
      const minutes = timeUnit === "hours" ? durationNum * 60 : durationNum;
      const metValue = MET_PER_ACTIVITY[selectedActivity][intensity];
      const caloriesPerMinute = (metValue * 3.5 * AVERAGE_WEIGHT_KG) / 200;
      const totalCalories = caloriesPerMinute * minutes;
      const steps = Math.round(totalCalories * STEPS_PER_KCAL);
      setCalculatedSteps(steps);
    } else {
      setCalculatedSteps(null);
      Alert.alert("Feil", "Vennligst skriv inn en gyldig varighet.");
    }
  };

  const handleConfirm = () => {
    if (calculatedSteps) {
      // Send calculatedSteps direkte til Dashboard.js
      onConfirm(calculatedSteps);
      setDuration("");
      setCalculatedSteps(null);
      setSelectedActivity("");
    }
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.activityItem, { backgroundColor: theme.surface }]}
      onPress={() => {
        setSelectedActivity(item);
        setShowActivityModal(false);
      }}
    >
      <Text style={[styles.activityText, { color: theme.text }]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Skritt Kalkulator
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Hvordan beregner vi skritt?",
                "Denne kalkulatoren bruker vitenskapelige MET-verdier (Metabolic Equivalent of Task) for å måle energiforbruket ditt. MET viser hvor krevende en aktivitet er sammenlignet med hvile – 1 MET er energien du bruker når du sitter stille. Formelen vår er:\n\n1. Kalorier per minutt = (MET × 3.5 × vekt i kg) / 200\n   - 3.5 er oksygenforbruket ved hvile, og 200 konverterer det til kalorier basert på at 1 liter oksygen gir ca. 5 kalorier.\n2. Totalt kaloriforbruk = Kalorier per minutt × tid (i minutter).\n3. Skritt = Totalt kaloriforbruk × 20 (20 skritt per kalori, basert på at 2000 skritt ≈ 100 kalorier).\n\nEksempel: 23 minutter svømming på moderat nivå (6 MET) for en person på 70 kg:\n- Kalorier per minutt = (6 × 3.5 × 70) / 200 = 7.35 kcal.\n- Totalt = 7.35 × 23 = 169 kcal.\n- Skritt = 169 × 20 = 3380 skritt. Dette hjelper deg å sammenligne ulike aktiviteter med skrittmålinger!"
              )
            }
          >
            <Text style={{ color: theme.textSecondary, fontSize: 18 }}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel}>
            <X size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[
            styles.input,
            { borderColor: theme.border, color: theme.text },
          ]}
          placeholder="Varighet"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <View style={styles.timeUnitContainer}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              timeUnit === "minutes" && { backgroundColor: accentColor },
            ]}
            onPress={() => setTimeUnit("minutes")}
          >
            <View
              style={[
                styles.radioCircle,
                timeUnit === "minutes" && styles.radioSelected,
              ]}
            />
            <Text style={[styles.radioLabel, { color: theme.text }]}>
              Minutter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioButton,
              timeUnit === "hours" && { backgroundColor: accentColor },
            ]}
            onPress={() => setTimeUnit("hours")}
          >
            <View
              style={[
                styles.radioCircle,
                timeUnit === "hours" && styles.radioSelected,
              ]}
            />
            <Text style={[styles.radioLabel, { color: theme.text }]}>
              Timer
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.activityInput, { borderColor: theme.border }]}
          onPress={() => setShowActivityModal(true)}
        >
          <Text
            style={[
              styles.activityPlaceholder,
              { color: selectedActivity ? theme.text : theme.textSecondary },
            ]}
          >
            {selectedActivity || "Velg aktivitet..."}
          </Text>
        </TouchableOpacity>

        <View style={styles.intensityContainer}>
          <Text style={[styles.intensityLabel, { color: theme.textSecondary }]}>
            Intensitet:
          </Text>
          <View style={styles.intensityButtons}>
            <TouchableOpacity
              style={[
                styles.intensityButton,
                intensity === "Low" && { backgroundColor: accentColor },
              ]}
              onPress={() => setIntensity("Low")}
            >
              <Text
                style={[
                  styles.intensityButtonText,
                  { color: intensity === "Low" ? theme.surface : theme.text },
                ]}
              >
                Lav
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.intensityButton,
                intensity === "Moderate" && { backgroundColor: accentColor },
              ]}
              onPress={() => setIntensity("Moderate")}
            >
              <Text
                style={[
                  styles.intensityButtonText,
                  {
                    color:
                      intensity === "Moderate" ? theme.surface : theme.text,
                  },
                ]}
              >
                Moderat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.intensityButton,
                intensity === "High" && { backgroundColor: accentColor },
              ]}
              onPress={() => setIntensity("High")}
            >
              <Text
                style={[
                  styles.intensityButtonText,
                  { color: intensity === "High" ? theme.surface : theme.text },
                ]}
              >
                Høy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: accentColor }]}
          onPress={handleCalculate}
        >
          <Text style={[styles.calculateButtonText, { color: theme.surface }]}>
            Beregn!
          </Text>
        </TouchableOpacity>

        {calculatedSteps !== null && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultText, { color: theme.textSecondary }]}>
              er ekvivalent med:
            </Text>
            <Text style={[styles.stepsText, { color: theme.text }]}>
              {calculatedSteps.toLocaleString()}
            </Text>
            <Text style={[styles.resultText, { color: theme.textSecondary }]}>
              skritt.
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.border }]}
            onPress={onCancel}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              Avbryt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={handleConfirm}
            disabled={!calculatedSteps}
          >
            <Text style={[styles.buttonText, { color: theme.surface }]}>
              Bekreft
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showActivityModal}
        animationType="slide"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.activityModalOverlay}>
          <View
            style={[
              styles.activityModalContent,
              { backgroundColor: theme.surface },
            ]}
          >
            <View style={styles.activityModalHeader}>
              <Text style={[styles.activityModalTitle, { color: theme.text }]}>
                Velg aktivitet
              </Text>
              <TouchableOpacity onPress={() => setShowActivityModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={activities}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item}
              style={styles.activityList}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  timeUnitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
  },
  activityInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  activityPlaceholder: {
    fontSize: 16,
  },
  intensityContainer: {
    marginBottom: 12,
  },
  intensityLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  intensityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  intensityButtonText: {
    fontSize: 16,
  },
  calculateButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
  },
  stepsText: {
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  activityModalContent: {
    width: "90%",
    maxHeight: "50%",
    borderRadius: 15,
    padding: 20,
  },
  activityModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activityModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  activityList: {
    flexGrow: 0,
  },
  activityItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 16,
  },
});

export default StepCalculator;
