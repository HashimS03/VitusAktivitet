import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
  theme,
  isDarkMode
}) => (
  <View style={styles.inputGroup}>
    <Text
      style={[styles.label, { color: isDarkMode ? "#FFFFFF" : "#333333" }]}
    >
      {label}
    </Text>
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.surface,
          borderColor: isDarkMode ? theme.border : "#E5E5E5",
          color: isDarkMode ? "#FFFFFF" : "#000000",
        },
        multiline && {
          height: 100,
          textAlignVertical: "top",
          paddingTop: 12,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    width: "100%",
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
  },
});

export default React.memo(FormInput);