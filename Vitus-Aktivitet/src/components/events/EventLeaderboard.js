import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { EventContext } from './EventContext';
import { apiClient } from '../../utils/apiClient';
import { useTheme } from '../context/ThemeContext';

const EventLeaderboard = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { 
    activeEvents, 
    pastEvents, 
    upcomingEvents,
    fetchEventParticipants 
  } = useContext(EventContext);
  
  const [participants, setParticipants] = useState([]);
  const [isEventActive, setIsEventActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        
        // Get event ID from params
        const eventIdParam = route.params?.eventId;
        
        if (!eventIdParam) {
          console.error("No event ID provided to EventLeaderboard");
          setError("No event ID provided");
          setLoading(false);
          return;
        }
        
        console.log(`Loading leaderboard for event ID: ${eventIdParam}`);
        
        // Check if we already have the event data in params
        if (route.params?.eventData) {
          setEventData(route.params.eventData);
          
          // Determine if the event is active
          const currentDate = new Date();
          const endDate = new Date(route.params.eventData.end_date);
          setIsEventActive(currentDate <= endDate);
        } else {
          // Find event in context if not provided directly
          const allEvents = [...(activeEvents || []), ...(pastEvents || []), ...(upcomingEvents || [])];
          const event = allEvents.find(e => 
            String(e?.id) === String(eventIdParam) || 
            String(e?.Id) === String(eventIdParam)
          );
          
          if (event) {
            setEventData(event);
            
            // Determine if the event is active
            const currentDate = new Date();
            const endDate = new Date(event.end_date);
            setIsEventActive(currentDate <= endDate);
          } else {
            // If event not found in context, try API
            try {
              const response = await apiClient.get(`/events/${eventIdParam}`);
              if (response.data && response.data.data) {
                setEventData(response.data.data);
                
                const currentDate = new Date();
                const endDate = new Date(response.data.data.end_date);
                setIsEventActive(currentDate <= endDate);
              } else {
                setError("Event not found");
              }
            } catch (apiError) {
              console.error("API error:", apiError);
              setError("Failed to load event");
            }
          }
        }
        
        // Load participants for the leaderboard
        if (fetchEventParticipants) {
          const participantsData = await fetchEventParticipants(eventIdParam);
          
          if (Array.isArray(participantsData) && participantsData.length > 0) {
            // Transform participant data to leaderboard format
            const leaderboardData = participantsData
              .filter(p => p && p.score !== undefined)
              .map(p => ({
                id: p.id?.toString(),
                name: p.userName || "Unknown",
                score: p.score || 0,
                avatar: p.avatar || require("../../../assets/member-avatar.png"),
                team: p.teamId ? `Team ${p.teamId}` : null,
              }))
              .sort((a, b) => b.score - a.score); // Sort by score in descending order
            
            setParticipants(leaderboardData);
          } else {
            setParticipants([]); // Empty array instead of mock data
            setError("No participants found");
          }
        } else {
          setParticipants([]); // Empty array instead of mock data
          setError("Cannot load participants");
        }
      } catch (error) {
        console.error("Error loading leaderboard data:", error);
        setError("Failed to load leaderboard data");
        setParticipants([]); // Empty array instead of mock data
      } finally {
        setLoading(false);
      }
    };
    
    loadEventData();
  }, [route.params?.eventId, route.params?.eventData]);

  const renderParticipantItem = ({ item, index }) => (
    <View
      style={[
        styles.participantItem,
        index < 3 && styles.topThree, // Spesialstil for topp 3
      ]}
    >
      <Text style={styles.rank}>{index + 1}</Text>
      <Image source={item.avatar} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.scoreContainer}>
        {item.rankChange !== 0 && (
          <MaterialCommunityIcons
            name={item.rankChange > 0 ? "arrow-up" : "arrow-down"}
            size={18}
            color={item.rankChange > 0 ? "green" : "red"}
          />
        )}
        <Text style={styles.score}>
          {isEventActive ? "In Progress" : item.score}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, {color: theme.text}]}>
        {eventData?.title ? `${eventData.title} Leaderboard` : "Leaderboard"}
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, {color: theme.textSecondary}]}>Loading leaderboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={50} color={theme.error} />
          <Text style={[styles.errorText, {color: theme.error}]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, {backgroundColor: theme.primary}]} 
            onPress={() => navigation.goBack()}>
            <Text style={{color: theme.background, fontWeight: '600'}}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={participants}
          renderItem={renderParticipantItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 40}}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
    textAlign: "center",
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 3,
  },
  topThree: {
    backgroundColor: "#ffeb3b",
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default EventLeaderboard;
