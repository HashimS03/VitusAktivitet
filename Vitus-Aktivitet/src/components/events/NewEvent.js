import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useTheme } from "../context/ThemeContext"; // Import Theme Context

const NewEvent = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalValue, setGoalValue] = useState(50);
  const { theme, isDarkMode, accentColor } = useTheme();

  const handleConfirm = () => {
    navigation.navigate("ActiveEvent");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/animals-bg.png")}
          style={[styles.backgroundImage, { opacity: isDarkMode ? 0.5 : 1 }]} // Adjust image opacity
          resizeMode="contain"
        />

        <View style={styles.formContainer}>
          {/* Title Input */}
          <Text style={[styles.label, { color: theme.text }]}>Legg til Tittel på Aktivitet</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Tittel"
              placeholderTextColor={theme.textSecondary}
            />
            {title !== "" && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setTitle("")}>
                <MaterialCommunityIcons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Description Input */}
          <Text style={[styles.label, { color: theme.text }]}>Legg til Beskrivelse på Aktivitet</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Beskrivelse"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
            {description !== "" && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setDescription("")}>
                <MaterialCommunityIcons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Goal Selection */}
          <Text style={[styles.label, { color: theme.text }]}>Velg et Mål</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              value={goalValue}
              onValueChange={setGoalValue}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor={accentColor}
              maximumTrackTintColor={theme.border}
              thumbTintColor={accentColor}
            />
          </View>

          {/* Date Selection */}
          <Text style={[styles.label, { color: theme.text }]}>Velg en Dato</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity style={[styles.dateInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>Start Date</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dateInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>End Date</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.surface }]} onPress={() => navigation.goBack()}>
              <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: accentColor }]} onPress={handleConfirm}>
              <Text style={[styles.buttonText, { color: theme.background }]}>Godta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
    height: 56,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
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
    gap: 16,
    marginBottom: 24,
  },
  dateInput: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  dateText: {
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
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  confirmButton: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NewEvent;
