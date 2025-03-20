"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, FlatList } from "react-native"
import { X, ChevronDown, Check, HelpCircle } from "lucide-react-native"
import { useTheme } from "../context/ThemeContext" // Import Theme Context

const StepCalculator = ({ onConfirm, onCancel }) => {
  const { theme, isDarkMode } = useTheme() // Get theme values
  const accentColor = theme.primary // Primary color from theme

  const [duration, setDuration] = useState("")
  const [timeUnit, setTimeUnit] = useState("minutes")
  const [selectedActivity, setSelectedActivity] = useState("")
  const [intensity, setIntensity] = useState("Moderate")
  const [calculatedSteps, setCalculatedSteps] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showIntensityModal, setShowIntensityModal] = useState(false)
  const [showTimeUnitModal, setShowTimeUnitModal] = useState(false)

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
  }

  const activities = Object.keys(MET_PER_ACTIVITY)
  const intensityLevels = ["Low", "Moderate", "High"]
  const timeUnits = [
    { value: "minutes", label: "Minutter" },
    { value: "hours", label: "Timer" },
  ]

  const AVERAGE_WEIGHT_KG = 70
  const STEPS_PER_KCAL = 20

  const handleCalculate = () => {
    if (!selectedActivity) {
      Alert.alert("Feil", "Vennligst velg en aktivitet.")
      return
    }
    const durationNum = Number.parseInt(duration, 10)
    if (!isNaN(durationNum) && durationNum > 0) {
      const minutes = timeUnit === "hours" ? durationNum * 60 : durationNum
      const metValue = MET_PER_ACTIVITY[selectedActivity][intensity]
      const caloriesPerMinute = (metValue * 3.5 * AVERAGE_WEIGHT_KG) / 200
      const totalCalories = caloriesPerMinute * minutes
      const steps = Math.round(totalCalories * STEPS_PER_KCAL)
      setCalculatedSteps(steps)
    } else {
      setCalculatedSteps(null)
      Alert.alert("Feil", "Vennligst skriv inn en gyldig varighet.")
    }
  }

  const handleConfirm = () => {
    if (calculatedSteps) {
      onConfirm(calculatedSteps)
      setDuration("")
      setCalculatedSteps(null)
      setSelectedActivity("")
    }
  }

  const showInfoAlert = () => {
    Alert.alert(
      "Hvordan beregner vi skritt?",
      "Denne kalkulatoren bruker vitenskapelige MET-verdier (Metabolic Equivalent of Task) for å måle energiforbruket ditt. MET viser hvor krevende en aktivitet er sammenlignet med hvile – 1 MET er energien du bruker når du sitter stille. Formelen vår er:\n\n1. Kalorier per minutt = (MET × 3.5 × vekt i kg) / 200\n   - 3.5 er oksygenforbruket ved hvile, og 200 konverterer det til kalorier basert på at 1 liter oksygen gir ca. 5 kalorier.\n2. Totalt kaloriforbruk = Kalorier per minutt × tid (i minutter).\n3. Skritt = Totalt kaloriforbruk × 20 (20 skritt per kalori, basert på at 2000 skritt ≈ 100 kalorier).\n\nEksempel: 23 minutter svømming på moderat nivå (6 MET) for en person på 70 kg:\n- Kalorier per minutt = (6 × 3.5 × 70) / 200 = 7.35 kcal.\n- Totalt = 7.35 × 23 = 169 kcal.\n- Skritt = 169 × 20 = 3380 skritt. Dette hjelper deg å sammenligne ulike aktiviteter med skrittmålinger!",
    )
  }

  const getIntensityColor = (level) => {
    switch (level) {
      case "Low":
        return "#4CAF50" // Green
      case "Moderate":
        return "#FFC107" // Yellow
      case "High":
        return "#F44336" // Red
      default:
        return theme.textSecondary
    }
  }

  const getTimeUnitLabel = () => {
    return timeUnits.find((unit) => unit.value === timeUnit)?.label || "Velg tidsenhet"
  }

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.modalItem, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedActivity(item)
        setShowActivityModal(false)
      }}
    >
      <Text style={[styles.modalItemText, { color: theme.text }]}>{item}</Text>
      {selectedActivity === item && <Check size={20} color={accentColor} />}
    </TouchableOpacity>
  )

  const renderIntensityItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.modalItem, { backgroundColor: theme.card }]}
      onPress={() => {
        setIntensity(item)
        setShowIntensityModal(false)
      }}
    >
      <View style={styles.intensityRow}>
        <View style={[styles.intensityDot, { backgroundColor: getIntensityColor(item) }]} />
        <Text style={[styles.modalItemText, { color: theme.text }]}>{item}</Text>
      </View>
      {intensity === item && <Check size={20} color={accentColor} />}
    </TouchableOpacity>
  )

  const renderTimeUnitItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.modalItem, { backgroundColor: theme.card }]}
      onPress={() => {
        setTimeUnit(item.value)
        setShowTimeUnitModal(false)
      }}
    >
      <Text style={[styles.modalItemText, { color: theme.text }]}>{item.label}</Text>
      {timeUnit === item.value && <Check size={20} color={accentColor} />}
    </TouchableOpacity>
  )

  return (
    <>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Skritt Kalkulator</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.helpButton} onPress={showInfoAlert}>
              <HelpCircle size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Varighet</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.surface,
                  flex: 2,
                  marginRight: 8,
                },
              ]}
              placeholder="Skriv inn varighet"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  flex: 1,
                },
              ]}
              onPress={() => setShowTimeUnitModal(true)}
            >
              <Text style={{ color: theme.text }}>{getTimeUnitLabel()}</Text>
              <ChevronDown size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Aktivitet</Text>
          <TouchableOpacity
            style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => setShowActivityModal(true)}
          >
            <Text style={{ color: selectedActivity ? theme.text : theme.textSecondary }}>
              {selectedActivity || "Velg aktivitet..."}
            </Text>
            <ChevronDown size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>Intensitet</Text>
          <TouchableOpacity
            style={[styles.dropdownButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => setShowIntensityModal(true)}
          >
            <View style={styles.intensityRow}>
              <View style={[styles.intensityDot, { backgroundColor: getIntensityColor(intensity) }]} />
              <Text style={{ color: theme.text, marginLeft: 8 }}>{intensity}</Text>
            </View>
            <ChevronDown size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.calculateButton, { backgroundColor: accentColor }]} onPress={handleCalculate}>
          <Text style={[styles.calculateButtonText, { color: "#FFFFFF" }]}>Beregn Skritt</Text>
        </TouchableOpacity>

        {calculatedSteps !== null && (
          <View style={[styles.resultContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.resultText, { color: theme.textSecondary }]}>er ekvivalent med:</Text>
            <Text style={[styles.stepsText, { color: accentColor }]}>{calculatedSteps.toLocaleString()}</Text>
            <Text style={[styles.resultText, { color: theme.textSecondary }]}>skritt</Text>

            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: accentColor }]} onPress={handleConfirm}>
              <Text style={[styles.confirmButtonText, { color: "#FFFFFF" }]}>Bruk Denne Verdien</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Activity Modal */}
      <Modal
        transparent
        visible={showActivityModal}
        animationType="slide"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Velg Aktivitet</Text>
              <TouchableOpacity onPress={() => setShowActivityModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList data={activities} renderItem={renderActivityItem} keyExtractor={(item) => item} />
          </View>
        </View>
      </Modal>

      {/* Intensity Modal */}
      <Modal
        transparent
        visible={showIntensityModal}
        animationType="slide"
        onRequestClose={() => setShowIntensityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Velg Intensitet</Text>
              <TouchableOpacity onPress={() => setShowIntensityModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList data={intensityLevels} renderItem={renderIntensityItem} keyExtractor={(item) => item} />
          </View>
        </View>
      </Modal>

      {/* Time Unit Modal */}
      <Modal
        transparent
        visible={showTimeUnitModal}
        animationType="slide"
        onRequestClose={() => setShowTimeUnitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Velg Tidsenhet</Text>
              <TouchableOpacity onPress={() => setShowTimeUnitModal(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList data={timeUnits} renderItem={renderTimeUnitItem} keyExtractor={(item) => item.value} />
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
    // Removed border/shadow styles from container
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  helpButton: {
    padding: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  intensityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  calculateButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resultText: {
    fontSize: 16,
  },
  stepsText: {
    fontSize: 40,
    fontWeight: "700",
    marginVertical: 8,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 16,
  },
})

export default StepCalculator

