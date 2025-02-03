import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Image } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"

const NewEvent = ({ navigation }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [goalValue, setGoalValue] = useState(50)

  const handleConfirm = () => {
    navigation.navigate("ActiveEvent")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/animals-bg.png")}
          style={styles.backgroundImage}
          resizeMode="contain"
        />

        <View style={styles.formContainer}>
          <Text style={styles.label}>Legg til Tittel på Aktivitet</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Tittle" />
            {title !== "" && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setTitle("")}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
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
              multiline
            />
            {description !== "" && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setDescription("")}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Velg et Mål</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={goalValue}
              onValueChange={setGoalValue}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor="#00BFA5"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#00BFA5"
            />
          </View>

          <Text style={styles.label}>Velg en Dato</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity style={styles.dateInput}>
              <Text style={styles.dateText}>Start Date</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateInput}>
              <Text style={styles.dateText}>End Date</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.buttonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Godta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    zIndex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: 200,
    position: "absolute",
    top: 0,
    opacity: 0.5,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 180,
  },
  label: {
    fontSize: 16,
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
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
    gap: 12,
    marginBottom: 24,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    color: "#666",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: "auto",
    paddingBottom: 34,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFE5E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#00BFA5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
})

export default NewEvent

