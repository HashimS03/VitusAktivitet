import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormInput from './components/FormInput';
import DateTimePicker from './components/DateTimePicker';

const TimeLocation = ({
  eventDetails,
  updateEventDetails,
  theme,
  isDarkMode
}) => {
  const handleDateChange = (field, date) => {
    updateEventDetails(field, date);
  };

  const handleTimeChange = (field, time) => {
    const timeField = field === "startDate" ? "startTime" : "endTime";
    updateEventDetails(timeField, time);
  };

  return (
    <View style={styles.stepContainer}>
      <Text
        style={[
          styles.stepTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        Tid og sted
      </Text>
      
      <FormInput
        label="Sted"
        value={eventDetails.location}
        onChangeText={(text) => updateEventDetails("location", text)}
        placeholder="Skriv inn sted"
        theme={theme}
        isDarkMode={isDarkMode}
      />
      
      <DateTimePicker
        label="Start"
        dateValue={eventDetails.startDate}
        timeValue={eventDetails.startTime}
        onDateChange={(date) => handleDateChange("startDate", date)}
        onTimeChange={(time) => handleTimeChange("startDate", time)}
        theme={theme}
        isDarkMode={isDarkMode}
      />
      
      <DateTimePicker
        label="Slutt"
        dateValue={eventDetails.endDate}
        timeValue={eventDetails.endTime}
        onDateChange={(date) => handleDateChange("endDate", date)}
        onTimeChange={(time) => handleTimeChange("endDate", time)}
        theme={theme}
        isDarkMode={isDarkMode}
      />
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
});

export default React.memo(TimeLocation);