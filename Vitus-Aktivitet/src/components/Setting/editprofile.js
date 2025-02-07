import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const EditProfile = () => {
  const navigation = useNavigation();

  // State variables for input fields
  const [fullName, setFullName] = useState("Hashem Sheikh");
  const [nickname, setNickname] = useState("Hashem Sheikh");
  const [email, setEmail] = useState("youremail@domain.com");
  const [phone, setPhone] = useState("256 27 189");
  const [country, setCountry] = useState("Norge");
  const [gender, setGender] = useState("Mann");
  const [address, setAddress] = useState("Alf Bjerkes Vei 28");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={styles.header}>Rediger Profil</Text>
      </View>

      {/* Scrollable Form */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Navn</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
        </View>

        {/* Nickname */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kalle Navn</Text>
          <TextInput style={styles.input} value={nickname} onChangeText={setNickname} />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-post</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefon Nummer</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.flag}>🇳🇴</Text>
            <TextInput style={styles.phoneInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
        </View>

        {/* Country & Gender Dropdowns */}
        <View style={styles.row}>
          {/* Country Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Land</Text>
            <Picker selectedValue={country} onValueChange={(itemValue) => setCountry(itemValue)} style={styles.dropdown}>
              <Picker.Item label="Norge" value="Norge" />
              <Picker.Item label="Sverige" value="Sverige" />
              <Picker.Item label="Danmark" value="Danmark" />
            </Picker>
          </View>

          {/* Gender Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Kjønn</Text>
            <Picker selectedValue={gender} onValueChange={(itemValue) => setGender(itemValue)} style={styles.dropdown}>
              <Picker.Item label="Mann" value="Mann" />
              <Picker.Item label="Kvinne" value="Kvinne" />
              <Picker.Item label="Annet" value="Annet" />
            </Picker>
          </View>
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={() => alert("Profil oppdatert!")}>
          <Text style={styles.submitText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    marginTop: Platform.OS === "ios" ? 60 : 40, // Adjust for status bar height
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40, // Ensures last field is not cut off
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#EEF4FF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 8,
    padding: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  flag: {
    fontSize: 18,
    marginRight: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 10,
  },
  dropdown: {
    backgroundColor: "#EEF4FF",
    borderRadius: 8,
    padding: 10,
  },
  submitButton: {
    backgroundColor: "#48CAB2",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfile;
