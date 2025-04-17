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

  // Load events from server and fallback to AsyncStorage if server is unavailable
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        // Try to fetch events from server using apiClient
        const response = await apiClient.get('/events');
        
        // Fix: serverEvents should come from response.data.data, not response.data
        const serverEvents = response.data.data || [];
        
        setEvents(serverEvents);
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
          } else {
            // If no stored events, initialize with empty array
            setEvents([]);
          }
        } catch (storageError) {
          console.error("Failed to load events from storage:", storageError);
          setError(storageError.message);
          // Initialize with empty array as last resort
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);

  // Add a new event to both the server and local state
  const addEvent = async (newEvent) => {
    try {
      // Format data to match server expectations
      const serverEventData = {
        title: newEvent.title,
        description: newEvent.description || "",
        activity: newEvent.selectedActivity?.name || "",
        goal: newEvent.goalValue || 0,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        location: newEvent.location || "",
        event_type: newEvent.eventType || "individual",
        total_participants: Number(newEvent.participantCount) || 0,
        team_count: Number(newEvent.teamCount) || 0,
        members_per_team: Number(newEvent.membersPerTeam) || 0,
      };
      
      console.log("Sending event data to server:", serverEventData);
      
      // Send to server using apiClient
      const response = await apiClient.post('/events', serverEventData);
      
      console.log("Server response:", response.data);
      
      // If successful, update local state with correct ID mapping
      const eventWithId = { 
        ...newEvent, 
        id: response.data.eventId 
      };
      
      setEvents(prevEvents => [...prevEvents, eventWithId]);
      
      // Update AsyncStorage as backup
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...events, eventWithId]));
      
      console.log("Event added successfully:", eventWithId);
      return eventWithId;
      
    } catch (error) {
      console.error("Failed to add event to server:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Fallback: Add to local state only if server fails
      const eventWithId = { ...newEvent, id: Date.now().toString() };
      setEvents(prevEvents => [...prevEvents, eventWithId]);
      
      // Update AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...events, eventWithId]));
      
      console.log("Event added locally only (server failed):", eventWithId);
      return eventWithId;
    }
  };

  // Update an event on both server and local state
  const updateEvent = async (updatedEvent) => {
    try {
      // Format data for server
      const serverEventData = {
        title: updatedEvent.title,
        description: updatedEvent.description || "",
        activity: updatedEvent.selectedActivity?.name || "",
        goal: updatedEvent.goalValue || 0,
        start_date: updatedEvent.start_date,
        end_date: updatedEvent.end_date,
        location: updatedEvent.location || "",
        event_type: updatedEvent.eventType || "individual",
        total_participants: Number(updatedEvent.participantCount) || 0,
        team_count: Number(updatedEvent.teamCount) || 0,
        members_per_team: Number(updatedEvent.membersPerTeam) || 0,
      };
      
      // Send to server using apiClient
      await apiClient.put(`/events/${updatedEvent.id}`, serverEventData);
    
      const updatedEvents = events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      
      setEvents(updatedEvents);
      
      // Update AsyncStorage as backup
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      console.log("Event updated successfully:", updatedEvent);
      
    } catch (error) {
      console.error("Failed to update event on server:", error);
      
      // Fallback: Update in local state only
      const updatedEvents = events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      
      setEvents(updatedEvents);
      
      // Update AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      console.log("Event updated locally only (server failed):", updatedEvent);
    }
  };

  // Delete event from both server and local state
  const deleteEvent = async (eventId) => {
    try {
      // Delete from server using apiClient
      await apiClient.delete(`/events/${eventId}`);
      
      // Update local state
      const filteredEvents = events.filter(event => event.id !== eventId);
      setEvents(filteredEvents);
      
      // Update AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
      
      console.log("Event deleted successfully:", eventId);
      
    } catch (error) {
      console.error("Failed to delete event from server:", error);
      
      // Fallback: Delete from local state only
      const filteredEvents = events.filter(event => event.id !== eventId);
      setEvents(filteredEvents);
      
      // Update AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
      
      console.log("Event deleted locally only (server failed):", eventId);
    }
  };

  // Filter events by status (active, upcoming, past)
  const activeEvents = events.filter(event => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return startDate <= now && endDate >= now;
  });

  const upcomingEvents = events.filter(event => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    return startDate > now;
  });

  const pastEvents = events.filter(event => {
    const now = new Date();
    const endDate = new Date(event.end_date);
    return endDate < now;
  });

  // Additional function to clear past events
  const clearPastEvents = async () => {
    // Logic to remove past events from both server and local state
    // Implementation would depend on your server API
  };

  // Function to join an event
  const joinEvent = async (eventId, teamId = null) => {
    try {
      const response = await apiClient.post(`/events/${eventId}/join`, { teamId });
      
      // Update local state to reflect the new participation
      const userData = await AsyncStorage.getItem('userInfo');
      const user = userData ? JSON.parse(userData) : {};
      
      setEvents(currentEvents => 
        currentEvents.map(event => {
          if (event.Id.toString() === eventId.toString()) {
            // Add current user to participants
            const participants = event.participants || [];
            return {
              ...event,
              participants: [
                ...participants,
                {
                  id: response.data.participantId,
                  userId: user.id,
                  userName: user.name || "Me",
                  teamId
                }
              ]
            };
          }
          return event;
        })
      );
      
      return true;
    } catch (error) {
      console.error("Failed to join event:", error);
      return false;
    }
  };

  // Function to leave an event
  const leaveEvent = async (eventId) => {
    try {
      await apiClient.delete(`/events/${eventId}/leave`);
      
      // Update local state to reflect leaving
      const userId = await AsyncStorage.getItem('userId');
      
      setEvents(currentEvents => 
        currentEvents.map(event => {
          if (event.Id.toString() === eventId.toString()) {
            // Remove current user from participants
            const participants = (event.participants || [])
              .filter(p => p.userId !== parseInt(userId));
            
            return {
              ...event,
              participants
            };
          }
          return event;
        })
      );
      
      return true;
    } catch (error) {
      console.error("Failed to leave event:", error);
      return false;
    }
  };

  // Function to fetch participants for an event
  const fetchEventParticipants = async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/participants`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch event participants:", error);
      return [];
    }
  };

  // Function to check if current user is participating in an event
  const checkParticipation = async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/participation`);
      return response.data;
    } catch (error) {
      console.error("Failed to check participation:", error);
      return { isParticipating: false };
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        activeEvents,
        upcomingEvents,
        pastEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        clearPastEvents,
        joinEvent,               // Add this
        leaveEvent,              // Add this
        fetchEventParticipants,  // Add this
        checkParticipation       // Add this
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
