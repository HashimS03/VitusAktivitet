import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const StepNavigator = ({
  currentStep,
  totalSteps,
  formProgress,
  progressAnimation,
  onNext,
  onPrevious,
  onCancel,
  onSubmit,
  isEditing,
  theme,
  isDarkMode
}) => {
  return (
    <View style={styles.container}>
      <View style={[
        styles.header,
        {
          backgroundColor: theme.background,
          borderBottomColor: isDarkMode
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.05)",
        },
      ]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: theme.primary,
            },
          ]}
        />
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: theme.border }]}
          onPress={currentStep === 0 ? onCancel : onPrevious}
        >
          <Text
            style={[
              styles.footerButtonText,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            {currentStep === 0 ? "Avbryt" : "Forrige"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: theme.primary }]}
          onPress={currentStep < totalSteps - 1 ? onNext : onSubmit}
        >
          <Text style={[styles.footerButtonText, { color: theme.background }]}>
            {currentStep < totalSteps - 1 
              ? "Neste" 
              : isEditing ? "Oppdater" : "Opprett"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: "transparent",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default React.memo(StepNavigator);