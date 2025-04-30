import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from '../../utils/apiClient';
import { SERVER_CONFIG } from "../../config/serverConfig"; 

const STORAGE_KEY = "events";
const API_BASE_URL = SERVER_CONFIG.getBaseUrl();

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myEvents, setMyEvents] = useState([]);

  // Improved normalize event objects to use consistent id property
  const normalizeEvent = (event) => {
    if (!event) return null;
    
    // Create a new object with normalized properties
    return {
      ...event,
      id: event.Id || event.id, // Ensure lowercase 'id' is always present
      Id: event.Id || event.id, // Also keep uppercase Id for backward compatibility
      start_date: event.start_date,
      end_date: event.end_date,
      // Ensure these date objects are properly parsed if they're strings
      ...(event.start_date && { parsedStartDate: new Date(event.start_date) }),
      ...(event.end_date && { parsedEndDate: new Date(event.end_date) })
    };
  };

  // Normalize array of events
  const normalizeEvents = (eventArray) => {
    if (!Array.isArray(eventArray)) return [];
    return eventArray.map(normalizeEvent);
  };

  // Filter events by status (active, upcoming, past)
  const filterEventsByStatus = (eventsArray) => {
    if (!Array.isArray(eventsArray)) return { active: [], upcoming: [], past: [] };
    
    const now = new Date();
    
    const active = eventsArray.filter(event => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      return startDate <= now && endDate >= now; // Event has started but not ended
    });

    const upcoming = eventsArray.filter(event => {
      const startDate = new Date(event.start_date);
      return startDate > now; // Event hasn't started yet
    });

    const past = eventsArray.filter(event => {
      const endDate = new Date(event.end_date);
      return endDate < now; // Event has already ended
    });
    
    return { active, upcoming, past };
  };

  // Load events from server and fallback to AsyncStorage if server is unavailable
  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Check if token exists before making the request
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log("No authentication token available - please log in");
        setLoading(false);
        return;
      }
      
      // Get userId for filtering
      const userId = await AsyncStorage.getItem('userId');
      
      // Try to fetch events from server using apiClient
      const response = await apiClient.get('/events');
      
      if (response.data.success) {
        // Server returns { success: true, data: [...events] }
        const serverEvents = response.data.data;
        console.log(`Loaded ${serverEvents.length} events from server`);
        
        // Normalize events properly before setting state
        const normalizedEvents = normalizeEvents(serverEvents);
        
        // Set all events
        setEvents(normalizedEvents);
        
        // Filter to include both events the user created and events they're participating in
        if (userId) {
          const userEvents = normalizedEvents.filter(event => {
            const isCreator = String(event.created_by) === String(userId);
            const isParticipant = event.participants && event.participants.some(
              p => String(p.userId) === String(userId) || String(p.user_id) === String(userId)
            );
            return isCreator || isParticipant;
          });
          
          console.log(`Found ${userEvents.length} events related to the user (created or participating)`);
          setMyEvents(userEvents);
        }
        
        // Also update AsyncStorage as a backup
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedEvents));
      } else {
        console.error("Server returned error:", response.data);
        throw new Error("Failed to fetch events from server");
      }
    } catch (error) {
      // Improved error handling
      console.error("Failed to load events:", error);
      
      if (error.response?.status === 401) {
        // Just use local storage and don't show error - we'll already have an auth alert
        try {
          const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedEvents) {
            const parsedEvents = JSON.parse(storedEvents);
            const normalizedEvents = normalizeEvents(parsedEvents);
            setEvents(normalizedEvents);
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
        }
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Use the loadEvents function in useEffect
  useEffect(() => {
    loadEvents();
    
    // Set up a periodic refresh every 5 minutes (optional)
    const refreshInterval = setInterval(() => {
      loadEvents();
    }, 300000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Add a new event with optimistic updates
  const addEvent = async (newEvent) => {
    try {
      // Get the current user ID to mark as creator
      const userId = await AsyncStorage.getItem('userId');
      
      // Create a temporary event with a unique local ID
      const tempEvent = normalizeEvent({
        ...newEvent,
        id: `temp-${Date.now()}`,
        created_by: userId,
        participants: [{
          userId: userId,
          userName: "You (Pending)"
        }]
      });
      
      // Optimistically update UI
      setEvents(prevEvents => [...prevEvents, tempEvent]);
      setMyEvents(prevEvents => [...prevEvents, tempEvent]);
      
      // Make the API call
      const response = await apiClient.post('/events', newEvent);
      
      if (response.data.success) {
        const eventId = response.data.eventId;
        console.log("Event created with ID:", eventId);
        
        // Update our local copy with the real ID from the server
        const createdEvent = {
          ...tempEvent,
          id: eventId,
          Id: eventId
        };
        
        // Replace the temporary event with the real one
        setEvents(prevEvents => 
          prevEvents.map(e => e.id === tempEvent.id ? createdEvent : e)
        );
        setMyEvents(prevEvents => 
          prevEvents.map(e => e.id === tempEvent.id ? createdEvent : e)
        );
        
        // Update local storage
        const updatedEvents = events.map(e => 
          e.id === tempEvent.id ? createdEvent : e
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        
        return { success: true, eventId };
      } else {
        // If failed, revert the optimistic update
        setEvents(prevEvents => prevEvents.filter(e => e.id !== tempEvent.id));
        setMyEvents(prevEvents => prevEvents.filter(e => e.id !== tempEvent.id));
        console.error("Server error creating event:", response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Error adding event:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Join an event with optimistic updates
  const joinEvent = async (eventId, teamId = null) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName') || "You";
      
      // Normalize the eventId to string for consistent comparison
      const eventIdStr = eventId?.toString();
      if (!eventIdStr) {
        console.error("Invalid event ID provided to joinEvent:", eventId);
        return false;
      }
      
      // Optimistically update UI
      const updatedEvents = events.map(event => {
        // Normalize event.id and event.Id for comparison
        const eventMatchesId = (event.id?.toString() === eventIdStr || event.Id?.toString() === eventIdStr);
        
        if (eventMatchesId) {
          // Add the current user to participants
          const updatedParticipants = [
            ...(event.participants || []),
            {
              id: `temp-${Date.now()}`,
              eventId: eventId,
              userId: userId,
              userName: userName,
              teamId: teamId
            }
          ];
          
          return {
            ...event,
            participants: updatedParticipants
          };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      
      // Call the server to actually join the event
      const response = await apiClient.post(`/events/${eventId}/join`, { teamId });
      
      if (response.data.success) {
        // Update storage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return true;
      } else {
        // Revert the optimistic update
        setEvents(events); // Reset to the original state
        console.error("Failed to join event:", response.data.message);
        return false;
      }
    } catch (error) {
      // Revert the optimistic update
      setEvents(events); // Reset to the original state
      console.error("Error joining event:", error);
      return false;
    }
  };
  
  // Leave an event with optimistic updates
  const leaveEvent = async (eventId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      // Optimistically update UI
      const updatedEvents = events.map(event => {
        if (event.id == eventId || event.Id == eventId) {
          // Remove the current user from participants
          const updatedParticipants = (event.participants || []).filter(
            p => p.userId != userId && p.user_id != userId
          );
          
          return {
            ...event,
            participants: updatedParticipants
          };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      
      // Call the server to actually leave the event
      const response = await apiClient.delete(`/events/${eventId}/leave`);
      
      if (response.data.success) {
        // Update storage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return true;
      } else {
        // Revert the optimistic update
        setEvents(events); // Reset to the original state
        console.error("Failed to leave event:", response.data.message);
        return false;
      }
    } catch (error) {
      // Revert the optimistic update
      setEvents(events); // Reset to the original state
      console.error("Error leaving event:", error);
      return false;
    }
  };
  
  // Helper function to check if user is a participant
  const isParticipating = async (eventId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      // First check local state to avoid unnecessary API calls
      const event = events.find(e => e.id == eventId || e.Id == eventId);
      if (event && event.participants) {
        const isParticipant = event.participants.some(
          p => p.userId == userId || p.user_id == userId
        );
        if (isParticipant) return true;
      }
      
      // Fall back to API call if not found locally
      const response = await apiClient.get(`/events/${eventId}/participation`);
      return response.data.isParticipating === true;
    } catch (error) {
      console.error("Error checking participation:", error);
      return false;
    }
  };

  // Function to check participation details
  const checkParticipation = async (eventId) => {
    try {
      console.log(`Checking participation for event ${eventId}...`);
      const response = await apiClient.get(`/events/${eventId}/participation`);
      
      // Log detailed response data to debug
      console.log(`Participation API response:`, JSON.stringify(response.data));
      
      // Check if response.data is undefined or null
      if (!response.data) {
        console.warn(`Empty response data from participation API for event ${eventId}`);
        return { isParticipating: false };
      }
      
      // Ensure we're using the correct property names
      const isParticipating = response.data.isParticipating === true || 
                             response.data.is_participating === true ||
                             (response.data.status === 'participating');
      
      return {
        isParticipating: isParticipating,
        participantId: response.data.participantId || response.data.participant_id,
        teamId: response.data.teamId || response.data.team_id
      };
    } catch (error) {
      console.error(`Error checking participation for event ${eventId}:`, error);
      console.error(`Error details:`, error.response?.data || error.message);
      return { isParticipating: false };
    }
  };

  // Function to fetch event participants
  const fetchEventParticipants = async (eventId) => {
    try {
      // Check if participants are already in local state
      const event = events.find(e => e.id == eventId || e.Id == eventId);
      if (event && event.participants && event.participants.length > 0) {
        console.log(`Using ${event.participants.length} cached participants for event ${eventId}`);
        return event.participants;
      }
      
      // Fetch from server if not in local state
      const response = await apiClient.get(`/events/${eventId}/participants`);
      const participants = response.data.data || [];
      
      // Update local event with participants
      if (participants.length > 0) {
        setEvents(prevEvents => prevEvents.map(event => {
          if (event.id == eventId || event.Id == eventId) {
            return {
              ...event,
              participants: participants
            };
          }
          return event;
        }));
      }
      
      return participants;
    } catch (error) {
      console.error("Failed to fetch event participants:", error);
      return [];
    }
  };
  
  // Update event with optimistic updates
  const updateEvent = async (updatedEvent) => {
    try {
      // Ensure we're using the correct id
      const eventId = updatedEvent.Id || updatedEvent.id;
      if (!eventId) {
        console.error("Cannot update event without ID");
        return false;
      }
      
      // Normalize the updated event
      const normalizedEvent = normalizeEvent(updatedEvent);
      
      // Optimistically update UI
      setEvents(prevEvents => 
        prevEvents.map(event => 
          (event.id == eventId || event.Id == eventId) 
            ? normalizedEvent 
            : event
        )
      );
      
      setMyEvents(prevEvents => 
        prevEvents.map(event => 
          (event.id == eventId || event.Id == eventId) 
            ? normalizedEvent 
            : event
        )
      );
      
      // Update storage optimistically
      const updatedEvents = events.map(event => 
        (event.id == eventId || event.Id == eventId) 
          ? normalizedEvent 
          : event
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      // Make the API call
      const response = await apiClient.put(`/events/${eventId}`, updatedEvent);
      
      if (response.data.success) {
        return true;
      } else {
        console.error("Failed to update event:", response.data.message);
        // We keep the optimistic update since it's better UX than reverting
        return false;
      }
    } catch (error) {
      console.error("Error updating event:", error);
      // We keep the optimistic update even if server fails
      return true;
    }
  };
  
  // Delete event with optimistic updates
  const deleteEvent = async (eventId) => {
    try {
      // Save a copy of the current events state in case we need to restore
      const previousEvents = [...events];
      const previousMyEvents = [...myEvents];
      
      // Optimistically update UI
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id != eventId && event.Id != eventId)
      );
      
      setMyEvents(prevEvents => 
        prevEvents.filter(event => event.id != eventId && event.Id != eventId)
      );
      
      // Update storage optimistically
      const updatedEvents = events.filter(event => 
        event.id != eventId && event.Id != eventId
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      // Make the API call
      const response = await apiClient.delete(`/events/${eventId}`);
      
      if (response.data.success) {
        return true;
      } else {
        // Revert the optimistic delete if server failed
        setEvents(previousEvents);
        setMyEvents(previousMyEvents);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(previousEvents));
        
        console.error("Failed to delete event:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      return true; // Keep the optimistic update for better UX
    }
  };
  
  // Get filtered events instead of computing in render
  const { active: activeEvents, upcoming: upcomingEvents, past: pastEvents } = filterEventsByStatus(events);
  const { active: myActiveEvents, upcoming: myUpcomingEvents, past: myPastEvents } = filterEventsByStatus(myEvents);
  
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
        myActiveEvents,
        myUpcomingEvents,
        myPastEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        joinEvent,
        leaveEvent,
        isParticipating,
        checkParticipation,
        fetchEventParticipants,
        loadEvents,
        // Add a utility function to get a specific event by ID
        getEventById: (id) => events.find(e => e.id == id || e.Id == id)
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
