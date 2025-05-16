import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { BlurView } from "expo-blur";

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = "Bekreft",
  cancelText = "Avbryt",
  onConfirm,
  onCancel,
  theme,
  isDarkMode
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <BlurView intensity={100} style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text
            style={[
              styles.modalTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.modalText,
              { color: isDarkMode ? "#CCCCCC" : "#666666" },
            ]}
          >
            {message}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.border }]}
              onPress={onCancel}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, { color: theme.background }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default React.memo(ConfirmModal);