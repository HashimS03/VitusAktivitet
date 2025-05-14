import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { X } from 'lucide-react-native';
import StepCalculator from '../StepCalculator';

export const StepCalculatorModal = ({
  visible,
  theme,
  accentColor,
  onConfirm,
  onCancel
}) => {
  const [calculatedSteps, setCalculatedSteps] = useState(0);
  
  const handleCalculation = (steps) => {
    setCalculatedSteps(steps);
  };
  
  const handleConfirm = () => {
    if (calculatedSteps <= 0) {
      Alert.alert("Ingen skritt", "Du må legge til minst 1 skritt.");
      return;
    }
    onConfirm(calculatedSteps);
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Legg til skritt
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <StepCalculator 
              updateStepCount={handleCalculation}
              theme={theme}
              accentColor={accentColor}
            />
          </ScrollView>
          
          <View style={styles.footer}>
            <Text style={[styles.stepsCount, { color: accentColor }]}>
              {calculatedSteps} skritt
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { borderColor: theme.border }]} 
                onPress={onCancel}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  Avbryt
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton, { backgroundColor: accentColor }]} 
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                  Legg til
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600'
  },
  scrollView: {
    maxHeight: 500
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE'
  },
  stepsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    marginRight: 12,
    borderWidth: 1,
  },
  confirmButton: {
    marginLeft: 12
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  confirmButtonText: {
    color: '#FFFFFF'
  }
});