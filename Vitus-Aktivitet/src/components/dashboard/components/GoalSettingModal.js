import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { X } from 'lucide-react-native';

export const GoalSettingModal = ({
  visible,
  theme,
  accentColor,
  newGoal,
  setNewGoal,
  onCancel,
  onSave
}) => {
  return (
    <Modal 
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Sett daglig mål
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Skriv inn ditt nye daglige mål for skritt. Målet vil gjelde fra i morgen.
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: theme.text, 
                    borderColor: theme.border,
                    backgroundColor: theme.background
                  }
                ]}
                value={newGoal}
                onChangeText={setNewGoal}
                keyboardType="numeric"
                placeholder="F.eks. 8000"
                placeholderTextColor={theme.textSecondary}
                autoFocus={true}
              />
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>skritt</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { borderColor: theme.border }]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>Avbryt</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, { backgroundColor: accentColor }]} 
              onPress={onSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Lagre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  modalContent: {
    marginBottom: 24
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: '500',
    marginRight: 12
  },
  inputLabel: {
    fontSize: 16,
    width: 60
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
  saveButton: {
    marginLeft: 12
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  saveButtonText: {
    color: '#FFFFFF'
  }
});