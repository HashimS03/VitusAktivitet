import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Progress from "react-native-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDisplayDate, getDaysDifference } from "../../../utils/dateUtils";

export const EventCard = ({ item, theme, accentColor, onPress }) => {
  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return getDaysDifference(today, endDate);
  };
  
  const daysRemaining = getDaysRemaining(item.end_date);
  
  return (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        {/* Replace Image with colored View */}
        <View 
          style={[styles.eventImage, { backgroundColor: accentColor + '40' }]}
        >
          <MaterialCommunityIcons
            name="calendar-check"
            size={30}
            color={accentColor}
            style={styles.eventIcon}
          />
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.headerRow}>
            <Text 
              style={[styles.eventTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          
          <Progress.Bar
            progress={item.progress || 0}
            width={null}
            color={accentColor}
            unfilledColor={theme.border}
            borderWidth={0}
            height={6}
            borderRadius={3}
            style={styles.progressBar}
          />
          
          <View style={styles.eventFooter}>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons
                name="calendar-range"
                size={14}
                color={theme.textSecondary}
              />
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {formatDisplayDate(item.start_date)}
              </Text>
            </View>
            
            <View style={styles.daysContainer}>
              <Text 
                style={[
                  styles.daysText,
                  { color: daysRemaining <= 3 ? '#FF6B6B' : theme.textSecondary }
                ]}
              >
                {daysRemaining} dager igjen
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 16,
    width: 300,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  eventIcon: {
    opacity: 0.9
  },
  eventDetails: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  progressBar: {
    marginBottom: 8
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4
  },
  daysContainer: {
    
  },
  daysText: {
    fontSize: 12,
    fontWeight: '500'
  }
});