import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import FormInput from './components/FormInput';

const EventDetails = ({ 
  eventDetails, 
  updateEventDetails,
  theme,
  isDarkMode
}) => {
  const renderGoalInput = () => {
    if (!eventDetails.selectedActivity) return null;

    if (eventDetails.selectedActivity.type === "duration") {
      return (
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            Mål ({eventDetails.selectedActivity.unit})
          </Text>
          <View style={styles.durationRow}>
            <TextInput
              style={[
                styles.durationInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDarkMode ? theme.border : "#E5E5E5",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
              ]}
              value={eventDetails.goalMinutes.toString()}
              onChangeText={(text) => updateEventDetails("goalMinutes", text)}
              placeholder="Minutter"
              placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
              keyboardType="numeric"
            />
            <TextInput
              style={[
                styles.durationInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDarkMode ? theme.border : "#E5E5E5",
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                },
              ]}
              value={eventDetails.goalSeconds.toString()}
              onChangeText={(text) => updateEventDetails("goalSeconds", text)}
              placeholder="Sekunder"
              placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
              keyboardType="numeric"
            />
          </View>
        </View>
      );
    } else {
      return (
        <FormInput
          label={`Mål (${eventDetails.selectedActivity.unit})`}
          value={eventDetails.goalValue.toString()}
          onChangeText={(text) => updateEventDetails("goalValue", text)}
          placeholder="0"
          keyboardType="numeric"
          theme={theme}
          isDarkMode={isDarkMode}
        />
      );
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text
        style={[
          styles.stepTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        Hendelsesdetaljer
      </Text>
      
      <FormInput
        label="Navn"
        value={eventDetails.title}
        onChangeText={(text) => updateEventDetails("title", text)}
        placeholder="Skriv inn navn"
        theme={theme}
        isDarkMode={isDarkMode}
      />
      
      <FormInput
        label="Beskrivelse"
        value={eventDetails.description}
        onChangeText={(text) => updateEventDetails("description", text)}
        placeholder="Skriv inn beskrivelse"
        multiline={true}
        theme={theme}
        isDarkMode={isDarkMode}
      />
      
      {renderGoalInput()}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  durationInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginRight: 6,
  },
});

export default React.memo(EventDetails);