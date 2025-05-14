import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export const StatCard = ({ title, icon, content, theme, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={styles.statHeader}>
        <Text style={[styles.statTitle, { color: theme.text }]}>
          {title}
        </Text>
        <ChevronRight size={20} color={theme.textSecondary} />
      </View>
      
      <View style={styles.content}>
        {content}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  }
});