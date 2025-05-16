import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";

const DateTimePicker = ({
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  theme,
  isDarkMode
}) => {
  const [pickerConfig, setPickerConfig] = useState({
    visible: false,
    mode: "date",
    value: dateValue,
    selectedValue: null,
  });

  const showPicker = (mode) => {
    setPickerConfig({
      visible: true,
      mode,
      value: mode === "date" ? dateValue : timeValue,
      selectedValue: null,
    });
  };

  const closePicker = () => {
    setPickerConfig(prev => ({
      ...prev,
      visible: false,
      selectedValue: null,
    }));
  };

  const handlePickerChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setPickerConfig(prev => ({ ...prev, visible: false }));
      if (event.type === "set" && selectedDate) {
        const handler = pickerConfig.mode === "date" ? onDateChange : onTimeChange;
        handler(selectedDate);
      }
    } else if (Platform.OS === "ios" && selectedDate) {
      setPickerConfig(prev => ({
        ...prev,
        selectedValue: selectedDate,
      }));
    }
  };

  const confirmPicker = () => {
    if (pickerConfig.selectedValue) {
      const handler = pickerConfig.mode === "date" ? onDateChange : onTimeChange;
      handler(pickerConfig.selectedValue);
    }
    closePicker();
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: isDarkMode ? "#FFFFFF" : "#333333" }]}>
        {label}
      </Text>
      <View style={styles.dateTimeRow}>
        <TouchableOpacity
          style={[
            styles.dateTimeInput,
            {
              backgroundColor: theme.surface,
              borderColor: isDarkMode ? theme.border : "#E5E5E5",
            },
          ]}
          onPress={() => showPicker("date")}
        >
          <Text
            style={[
              styles.dateTimeText,
              { color: isDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            {dateValue.toLocaleDateString()}
          </Text>
          <MaterialCommunityIcons
            name="calendar"
            size={18}
            color={theme.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.dateTimeInput,
            {
              backgroundColor: theme.surface,
              borderColor: isDarkMode ? theme.border : "#E5E5E5",
            },
          ]}
          onPress={() => showPicker("time")}
        >
          <Text
            style={[
              styles.dateTimeText,
              { color: isDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            {timeValue.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <MaterialCommunityIcons
            name="clock-outline"
            size={18}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      {pickerConfig.visible && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
            <View
              style={[
                styles.dateTimePickerContainer,
                { backgroundColor: theme.surface },
              ]}
            >
              <RNDateTimePicker
                value={pickerConfig.value}
                mode={pickerConfig.mode}
                is24Hour={true}
                display="spinner"
                onChange={handlePickerChange}
                themeVariant={isDarkMode ? "dark" : "light"}
                textColor={isDarkMode ? "#FFFFFF" : "#000000"}
                style={styles.dateTimePicker}
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={confirmPicker}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.background }]}>
                    Bekreft
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dateTimeInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    marginRight: 6,
  },
  dateTimeText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dateTimePickerContainer: {
    width: 320,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dateTimePicker: {
    width: 320,
    height: 215,
  },
  confirmButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default React.memo(DateTimePicker);