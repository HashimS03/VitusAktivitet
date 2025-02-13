import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";

// Predefinerte aktiviteter
const PREDEFINED_ACTIVITIES = [
  {
    id: 1,
    name: "Planke",
    type: "duration",
    icon: "human",
    description: "Hold plankestilling så lenge som mulig",
    defaultGoal: 60,
    unit: "sekunder",
  },
  {
    id: 2,
    name: "Push-ups",
    type: "count",
    icon: "arm-flex",
    description: "Gjør så mange push-ups som mulig",
    defaultGoal: 50,
    unit: "repetisjoner",
  },
  {
    id: 3,
    name: "Løping",
    type: "distance",
    icon: "run",
    description: "Løp den angitte distansen",
    defaultGoal: 5,
    unit: "kilometer",
  },
];

const NewEvent = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalValue, setGoalValue] = useState(50);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [location, setLocation] = useState("");
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Funksjon for å håndtere dato-valg
  const handleDateChange = (event, selectedDate, type) => {
    if (type === "start") {
      setShowStartPicker(false);
      if (selectedDate) setStartDate(selectedDate);
    } else {
      setShowEndPicker(false);
      if (selectedDate) setEndDate(selectedDate);
    }
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setTitle(activity.name);
    setDescription(activity.description);
    setGoalValue(activity.defaultGoal);
    setShowActivityModal(false);
    setShowWarning(false); // Fjerner advarselen når en aktivitet velges
  };

  const handleConfirm = () => {
    // Create event object with all necessary data
    const eventData = {
      title,
      description,
      startDate,
      endDate,
      goalValue,
      activityType: selectedActivity?.type,
      activityUnit: selectedActivity?.unit,
      status: "active",
      participants: [], // Will be populated when users join
      results: {}, // Will store user results
    };

    console.log("Creating event:", eventData);
    navigation.navigate("ActiveEvent");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/vitusaktivitet_v2_sq.png")}
          style={styles.backgroundImage}
          resizeMode="contain"
        />

        <View style={styles.formContainer}>
          <Text style={styles.label}>Velg Aktivitet</Text>
          <TouchableOpacity
            style={styles.activitySelector}
            onPress={() => setShowActivityModal(true)}
          >
            <Text style={styles.activitySelectorText}>
              {selectedActivity ? selectedActivity.name : "Velg en aktivitet"}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          <Text style={styles.label}>Legg til Tittel på Aktivitet</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Tittle"
              placeholderTextColor="#999"
            />
            {title !== "" && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setTitle("")}
              >
                <MaterialCommunityIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Legg til Beskrivelse på Aktivitet</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#999"
              multiline
            />
            {description !== "" && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setDescription("")}
              >
                <MaterialCommunityIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>
            Velg et Mål {selectedActivity ? `(${selectedActivity.unit})` : ""}
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={goalValue}
              onTouchStart={() => {
                if (!selectedActivity) {
                  setShowWarning(true); // Aktiver advarsel
                }
              }}
              onValueChange={(value) => {
                if (!selectedActivity) {
                  setShowWarning(true); // Aktiver advarsel
                } else {
                  setGoalValue(value);
                  setShowWarning(false); // Fjern advarsel hvis aktivitet er valgt
                }
              }}
              disabled={!selectedActivity}
              minimumValue={0}
              maximumValue={selectedActivity?.type === "duration" ? 300 : 100}
              minimumTrackTintColor={selectedActivity ? "#00BFA5" : "#ccc"}
              maximumTrackTintColor="#E5E5E5"
              thumbTintColor={selectedActivity ? "#00BFA5" : "#ccc"}
            />

            {/* Dynamisk tekst som skifter farge */}
            <Text
              style={[styles.goalValueText, showWarning && styles.warningText]}
            >
              {!selectedActivity
                ? showWarning
                  ? "Velg aktivitet *"
                  : "Velg aktivitet"
                : selectedActivity?.type === "duration"
                ? `${Math.floor(goalValue / 60)} min ${Math.floor(
                    goalValue % 60
                  )} sek`
                : `${Math.round(goalValue)} ${
                    selectedActivity?.unit || "enheter"
                  }`}
            </Text>
          </View>

          <Text style={styles.label}>Velg Lokasjon/Sted</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Skriv inn lokasjon"
              placeholderTextColor="#999"
            />
            {location !== "" && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setLocation("")}
              >
                <MaterialCommunityIcons name="close" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Velg en Dato</Text>
            <View style={styles.dateContainer}>
              {/* Start Date Picker */}
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateText}>
                  {startDate ? startDate.toLocaleDateString() : "Start Date"}
                </Text>
              </TouchableOpacity>

              {/* End Date Picker */}
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateText}>
                  {endDate ? endDate.toLocaleDateString() : "End Date"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Faktiske DateTimePicker-modaler */}
            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, date) =>
                  handleDateChange(event, date, "start")
                }
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, date) => handleDateChange(event, date, "end")}
              />
            )}

            <View style={styles.timeContainer}>
              <Text style={styles.label}>Velg Klokkeslett</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateText}>
                  {time
                    ? time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Velg klokkeslett"}
                </Text>
              </TouchableOpacity>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={time || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.buttonText, styles.cancelText]}>
                  Avbryt
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedActivity && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedActivity}
              >
                <Text style={[styles.buttonText, styles.confirmText]}>
                  Godta
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Activity Selection Modal - NEW */}
          <Modal
            visible={showActivityModal}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Velg Aktivitet</Text>
                {PREDEFINED_ACTIVITIES.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={styles.activityOption}
                    onPress={() => handleActivitySelect(activity)}
                  >
                    <MaterialCommunityIcons
                      name={activity.icon}
                      size={24}
                      color="#00BFA5"
                    />
                    <View style={styles.activityOptionText}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowActivityModal(false)}
                >
                  <Text style={styles.modalCloseText}>Lukk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  timeContainer: {
    marginBottom: 24,
  },

  // Behold alle dine eksisterende stiler
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  warningText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },

  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
  },
  backgroundImage: {
    width: "90%",
    height: 240,
    marginTop: -20,
    alignSelf: "center",
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "#fff",
    height: 56,
  },

  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1A1A1A",
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  dateContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  dateInput: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    color: "#999",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
    paddingBottom: 34,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#FFF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  confirmButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#00BFA5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: "#FF0000",
  },
  confirmText: {
    color: "#FFF",
  },

  // Nye stiler for aktivitetsvelger
  activitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activitySelectorText: {
    fontSize: 16,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  activityOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  activityOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "500",
  },
  activityDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  goalValueText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
});

export default NewEvent;
