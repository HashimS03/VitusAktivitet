import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from '../../utils/apiClient';
import { SERVER_CONFIG } from "../../config/serverConfig"; 

const STORAGE_KEY = "events";
const API_BASE_URL = SERVER_CONFIG.getBaseUrl();

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);  // Initialize with empty array, not undefined
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myEvents, setMyEvents] = useState([]); // Add this state

  // Load events from server and fallback to AsyncStorage if server is unavailable
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        // Get userId for filtering
        const userId = await AsyncStorage.getItem('userId');
        
        // Try to fetch events from server using apiClient
        const response = await apiClient.get('/events');
        
        // Server returns { success: true, data: [...events] }
        const serverEvents = response.data.success ? response.data.data : [];
        
        console.log(`Loaded ${serverEvents.length} events from server`);
        
        // Set all events
        setEvents(serverEvents);
        
        // Filter events where user is participating but is not the creator
        if (userId) {
          const participatedEvents = serverEvents.filter(event => 
            event.created_by != userId && 
            event.participants && 
            event.participants.some(p => (p.userId == userId || p.user_id == userId))
          );
          setMyEvents(participatedEvents);
        }
        
        // Also update AsyncStorage as a backup
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverEvents));
        
      } catch (serverError) {
        console.error("Failed to load events from server:", serverError);
        
        // More detailed error logging
        if (serverError.response) {
          console.error("Server response error:", {
            status: serverError.response.status,
            data: serverError.response.data
          });
        }
        
        // Fallback to AsyncStorage if server fails
        try {
          const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
            console.log("Loaded events from AsyncStorage instead");
          } else {
            setEvents([]);
            console.log("No stored events found in AsyncStorage");
          }
        } catch (storageError) {
          console.error("Failed to load events from storage:", storageError);
          setError(storageError.message);
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);
  
  // Add a new event
  const addEvent = async (newEvent) => {
    try {
      const response = await apiClient.post('/events', newEvent);
      
      if (response.data.success) {
        const eventId = response.data.eventId;
        console.log("Event created with ID:", eventId);
        
        // Get the full event data with participants
        const eventResponse = await apiClient.get(`/events`);
        if (eventResponse.data.success) {
          // Update all events
          const updatedEvents = eventResponse.data.data;
          setEvents(updatedEvents);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        }
        
        return { success: true, eventId };
      } else {
        console.error("Server error creating event:", response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Error adding event:", error);
      // Still add locally if server fails
      const eventWithId = { 
        ...newEvent, 
        Id: Date.now().toString(),
        participants: [{
          userId: await AsyncStorage.getItem('userId'),
          userName: "You (Local)"
        }]
      };
      
      setEvents(prevEvents => [...prevEvents, eventWithId]);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...events, eventWithId]));
      
      return { success: false, error: error.message, eventId: eventWithId.Id };
    }
  };
  
  // Join an event
  const joinEvent = async (eventId, teamId = null) => {
    try {
      // Call the server to join the event
      const response = await apiClient.post(`/events/${eventId}/join`, { teamId });
      
      if (response.data.success) {
        // Refresh events to get updated participants
        const eventResponse = await apiClient.get(`/events`);
        if (eventResponse.data.success) {
          const updatedEvents = eventResponse.data.data;
          setEvents(updatedEvents);
          
          // Update myEvents list as well
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            const participatedEvents = updatedEvents.filter(event => 
              event.created_by != userId && 
              event.participants && 
              event.participants.some(p => (p.userId == userId || p.user_id == userId))
            );
            setMyEvents(participatedEvents);
          }
          
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        }
        
        return true;
      } else {
        console.error("Failed to join event:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error joining event:", error);
      return false;
    }
  };
  
  // Leave an event
  const leaveEvent = async (eventId) => {
    try {
      const response = await apiClient.delete(`/events/${eventId}/leave`);
      
      if (response.data.success) {
        // Refresh events to get updated participants
        const eventResponse = await apiClient.get(`/events`);
        if (eventResponse.data.success) {
          setEvents(eventResponse.data.data);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(eventResponse.data.data));
        }
        
        return true;
      } else {
        console.error("Failed to leave event:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error leaving event:", error);
      return false;
    }
  };
  
  // Helper function to check if user is a participant
  const isParticipating = async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/participation`);
      return response.data.isParticipating === true;
    } catch (error) {
      console.error("Error checking participation:", error);
      return false;
    }
  };

  // Add this function if it's missing:
  const checkParticipation = async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/participation`);
      return response.data;
    } catch (error) {
      console.error("Error checking participation:", error);
      return { isParticipating: false };
    }
  };

  // Add this function if it's missing:
  const fetchEventParticipants = async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/participants`);
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch event participants:", error);
      return [];
    }
  };
  
  // Filter events by status (active, upcoming, past)
  const activeEvents = Array.isArray(events) ? events.filter(event => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return startDate <= now && endDate >= now;
  }) : [];

  const upcomingEvents = Array.isArray(events) ? events.filter(event => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    return startDate > now;
  }) : [];

  const pastEvents = Array.isArray(events) ? events.filter(event => {
    const now = new Date();
    const endDate = new Date(event.end_date);
    return endDate < now;
  }) : [];
  
  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        activeEvents,
        upcomingEvents,
        pastEvents,
        myEvents,
        addEvent,
        joinEvent,
        leaveEvent,
        isParticipating,
        checkParticipation,      // Add this
        fetchEventParticipants   // Add this
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
