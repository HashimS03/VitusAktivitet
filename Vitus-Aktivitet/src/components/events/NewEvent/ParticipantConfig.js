import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FormInput from './components/FormInput';

const ParticipantConfig = ({
  eventDetails,
  updateEventDetails,
  theme,
  isDarkMode
}) => {
  return (
    <View style={styles.stepContainer}>
      <Text
        style={[
          styles.stepTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        Deltakere
      </Text>
      
      <View style={styles.eventTypeButtons}>
        {["team", "individual"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.eventTypeButton,
              {
                borderColor: isDarkMode ? theme.border : "#E5E5E5",
                backgroundColor:
                  eventDetails.eventType === type
                    ? theme.primary
                    : theme.surface,
              },
            ]}
            onPress={() => updateEventDetails("eventType", type)}
          >
            <MaterialCommunityIcons
              name={type === "team" ? "account-group" : "account"}
              size={20}
              color={
                eventDetails.eventType === type
                  ? theme.background
                  : isDarkMode
                  ? "#FFFFFF"
                  : "#333333"
              }
            />
            <Text
              style={[
                styles.eventTypeButtonText,
                {
                  color:
                    eventDetails.eventType === type
                      ? theme.background
                      : isDarkMode
                      ? "#FFFFFF"
                      : "#333333",
                },
              ]}
            >
              {type === "team" ? "Lag" : "Individuell"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {eventDetails.eventType === "individual" && (
        <FormInput
          label="Antall deltakere"
          value={eventDetails.participantCount}
          onChangeText={(text) => updateEventDetails("participantCount", text)}
          placeholder="Skriv inn antall"
          keyboardType="numeric"
          theme={theme}
          isDarkMode={isDarkMode}
        />
      )}
      
      {eventDetails.eventType === "team" && (
        <>
          <FormInput
            label="Antall lag"
            value={eventDetails.teamCount}
            onChangeText={(text) => updateEventDetails("teamCount", text)}
            placeholder="Skriv inn antall lag"
            keyboardType="numeric"
            theme={theme}
            isDarkMode={isDarkMode}
          />
          
          <FormInput
            label="Medlemmer per lag"
            value={eventDetails.membersPerTeam}
            onChangeText={(text) => updateEventDetails("membersPerTeam", text)}
            placeholder="Skriv inn antall medlemmer"
            keyboardType="numeric"
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </>
      )}
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
  eventTypeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  eventTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  eventTypeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default React.memo(ParticipantConfig);