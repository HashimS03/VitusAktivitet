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
          source={require("../../../assets/animals-bg.png")} // Update with your sleeping cat image
          style={styles.backgroundImage}
          resizeMode="contain"
        />

        <View style={styles.formContainer}>
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
              <TouchableOpacity style={styles.clearButton} onPress={() => setTitle("")}>
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
              <TouchableOpacity style={styles.clearButton} onPress={() => setDescription("")}>
                <MaterialCommunityIcons name="close" size={20} color="#999" />
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
              maximumTrackTintColor="#E5E5E5"
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
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>Godta</Text>
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
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: 240,
    marginTop: -20,
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
    justifyContent: 'center',
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
    justifyContent: 'center',
    alignItems: "center",
    borderRadius: 12,
  },
  confirmButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#00BFA5",
    justifyContent: 'center',
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
})

export default NewEvent