import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PastEvents = ({ setActiveTab, activeTab }) => {
  const events = [
    {
      id: 1,
      title: "Tennis Tournament",
      date: "January 15, 2024",
      time: "10:00 - 12:00",
      location: "Tennis Court",
      participants: 16,
      status: "Completed"
    },
    {
      id: 2,
      title: "Volleyball Practice",
      date: "January 20, 2024",
      time: "13:00 - 15:00",
      location: "Beach Arena",
      participants: 12,
      status: "Cancelled"
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Hendelser</Text>
        
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'upcoming' && styles.inactiveTab]} 
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.inactiveTabText]}>UPCOMING</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'your' && styles.inactiveTab]} 
            onPress={() => setActiveTab('your')}
          >
            <Text style={[styles.tabText, activeTab === 'your' && styles.inactiveTabText]}>YOUR EVENTS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'past' && styles.activeTab]} 
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>PAST EVENTS</Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <ScrollView style={styles.eventsList}>
          {events.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: event.status === 'Completed' ? '#E8F5E9' : '#FFEBEE' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: event.status === 'Completed' ? '#2E7D32' : '#C62828' }
                  ]}>
                    {event.status}
                  </Text>
                </View>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                  <Text style={styles.detailText}>{event.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{event.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="account-group" size={20} color="#666" />
                  <Text style={styles.detailText}>{event.participants} participants</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#00BFA5',
    fontSize: 13,
    fontWeight: '600',
  },
  inactiveTabText: {
    color: '#999',
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PastEvents;