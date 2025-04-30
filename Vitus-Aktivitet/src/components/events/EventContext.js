import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from '../../utils/apiClient';

const STORAGE_KEY = "events";

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
      
      // Get stored events first
      const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        const localEvents = JSON.parse(storedEvents);
        setEvents(normalizeEvents(localEvents));
      }
      
      // Then try to get from server
      try {
        const response = await apiClient.get('/events');
        if (response.data && response.data.data) {
          const serverEvents = response.data.data;
          setEvents(normalizeEvents(serverEvents));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverEvents));
        }
      } catch (apiError) {
        console.error("API error loading events:", apiError);
        // Don't clear events on API error
      }
    } catch (error) {
      console.error("Error in loadEvents:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Use the loadEvents function in useEffect
  useEffect(() => {
    loadEvents();
    
    // Reduce polling frequency to once every 15 minutes
    const refreshInterval = setInterval(() => {
      // Only refresh if the app is actively being used
      const lastActivity = AsyncStorage.getItem('lastUserActivity');
      const now = Date.now();
      if (lastActivity && (now - parseInt(lastActivity)) < 30 * 60 * 1000) {
        loadEvents();
      }
    }, 900000); // 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
    // Add this useEffect right after your existing loadEvents useEffect (around line 105)
  // This will update myEvents whenever user authentication changes or events change
  useEffect(() => {
    const updateMyEventsForCurrentUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        
        if (!userId) {
          console.log("No user ID found, myEvents will be empty");
          setMyEvents([]);
          return;
        }
        
        if (!events || events.length === 0) {
          console.log(`No events available to filter for user ${userId}`);
          setMyEvents([]);
          return;
        }
        
      
        
        // Filter events where the current user is creator or participant
        const userEvents = events.filter(event => {
          if (!event) return false;
          
          // Check if user is creator (compare as strings to be safe)
          const isCreator = String(event.created_by) === String(userId);
          
          // Check if user is a participant
          let isParticipant = false;
          if (event.participants && Array.isArray(event.participants)) {
            isParticipant = event.participants.some(p => 
              String(p.userId) === String(userId) || 
              String(p.user_id) === String(userId)
            );
          }
          
          return isCreator || isParticipant;
        });
        
        
        
        // Update myEvents with filtered list
        setMyEvents(userEvents);
        
        // Store these events in user-specific storage for persistence across logins
        await AsyncStorage.setItem(`user_${userId}_events`, JSON.stringify(userEvents));
      } catch (error) {
        console.error("Error updating myEvents for current user:", error);
      }
    };
    
    // Call the function
    updateMyEventsForCurrentUser();
  }, [events]); // This will run whenever the events list changes
  
    // Add this useEffect to respond to user authentication changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const authToken = await AsyncStorage.getItem('authToken');
        
        if (userId && authToken) {
          console.log(`User logged in with ID: ${userId}, loading their events`);
          
          // Try to get user-specific events from storage first
          const userEventsJson = await AsyncStorage.getItem(`user_${userId}_events`);
          if (userEventsJson) {
            const userEvents = JSON.parse(userEventsJson);
            console.log(`Found ${userEvents.length} cached events for user ${userId}`);
            setMyEvents(normalizeEvents(userEvents));
          }
          
          // Then refresh events from server
          loadEvents();
        } else {
          console.log("No authenticated user, clearing myEvents");
          setMyEvents([]);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };
    
    // Run on component mount
    checkAuthStatus();
    
    // Only check auth on mount, not periodically
    return () => {}; // No interval to clear
  }, []);
  
  // Add a new event with optimistic updates
  const addEvent = async (newEvent) => {
    console.log("🔍 ADDEVENT FUNCTION CALLED with:", JSON.stringify(newEvent, null, 2));
    
    try {
      // Get the current user ID to mark as creator
      console.log("🔍 Getting userId from AsyncStorage");
      const userId = await AsyncStorage.getItem('userId');
      console.log("🔍 userId retrieved:", userId);
      
      // Create a temporary event with a unique local ID
      const tempId = `temp-${Date.now()}`;
      console.log("🔍 Generated temporary ID:", tempId);
      
      const tempEvent = normalizeEvent({
        ...newEvent,
        id: tempId,
        created_by: userId,
        participants: [{
          userId: userId,
          userName: "You (Pending)"
        }]
      });
      
      console.log("🔍 Created temporary event:", JSON.stringify(tempEvent, null, 2));
      
      // Optimistically update UI
      console.log("🔍 Updating UI with temporary event");
      setEvents(prevEvents => [...prevEvents, tempEvent]);
      setMyEvents(prevEvents => [...prevEvents, tempEvent]);
      
      // Store in local storage in case of network issues
      console.log("🔍 Storing event in AsyncStorage");
      try {
        const currentEvents = [...events, tempEvent];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentEvents));
        console.log("✅ Successfully saved to AsyncStorage");
      } catch (storageError) {
        console.error("🔴 AsyncStorage error:", storageError);
      }

      // Explicitly tie this event to the current user in local storage
      try {
        // Save to user-specific storage as well
        const userEventsJson = await AsyncStorage.getItem(`user_${userId}_events`);
        let userEvents = [];
        
        if (userEventsJson) {
          userEvents = JSON.parse(userEventsJson);
        }
        
        userEvents.push(tempEvent);
        await AsyncStorage.setItem(`user_${userId}_events`, JSON.stringify(userEvents));
        console.log(`Added event to user ${userId}'s personal storage`);
      } catch (userStorageError) {
        console.error("Error saving to user-specific storage:", userStorageError);
      }
      
      // Make the API call with apiClient (not axios directly)
      console.log("🔍 Making API call to create event...");
      console.log("🔍 Request payload:", JSON.stringify(newEvent, null, 2));
      
      try {
        const response = await apiClient.post('/events', newEvent);
        console.log("✅ API response received:", JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
          const eventId = response.data.eventId;
          console.log("✅ Event created successfully with ID:", eventId);
          
          // Update our local copy with the real ID from the server
          const createdEvent = {
            ...tempEvent,
            id: eventId,
            Id: eventId
          };
          
          // Replace the temporary event with the real one
          console.log("🔍 Updating events list with real ID");
          setEvents(prevEvents => 
            prevEvents.map(e => e.id === tempEvent.id ? createdEvent : e)
          );
          setMyEvents(prevEvents => 
            prevEvents.map(e => e.id === tempEvent.id ? createdEvent : e)
          );
          
          // Update local storage
          console.log("🔍 Updating AsyncStorage with real ID");
          try {
            const updatedEvents = events.map(e => 
              e.id === tempEvent.id ? createdEvent : e
            );
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
            console.log("✅ AsyncStorage updated successfully");
          } catch (storageError) {
            console.error("🔴 AsyncStorage update error:", storageError);
          }

          const result = { 
            success: true, 
            eventId,
            createdEvent: {
              ...createdEvent,
              // Make extra sure all data needed for display is included
              start_date: createdEvent.start_date,
              end_date: createdEvent.end_date,
              title: createdEvent.title,
              description: createdEvent.description,
              activity: createdEvent.activity,
              progress: createdEvent.progress || 0,
              goal: createdEvent.goal,
              location: createdEvent.location,
              participants: createdEvent.participants || []
            }
          };

          // Save this event specifically to user-specific storage
          try {
            // Get user-specific events
            const userEventsJson = await AsyncStorage.getItem(`user_${userId}_events`);
            let userEvents = userEventsJson ? JSON.parse(userEventsJson) : [];
            
            // Add or update this event in user-specific storage
            const existingIndex = userEvents.findIndex(e => e.id === eventId || e.Id === eventId);
            if (existingIndex >= 0) {
              userEvents[existingIndex] = createdEvent;
            } else {
              userEvents.push(createdEvent);
            }
            
            await AsyncStorage.setItem(`user_${userId}_events`, JSON.stringify(userEvents));
            console.log(`Added event ${eventId} to user ${userId}'s personal storage`);
          } catch (error) {
            console.error("Error updating user-specific storage:", error);
          }

          return result;
        } else {
          console.error("🔴 API reported failure:", response.data);
          throw new Error(response.data.message || "Failed to create event");
        }
      } catch (apiError) {
        console.error("🔴 API call failed:", apiError);
        if (apiError.response) {
          console.error("🔴 Response status:", apiError.response.status);
          console.error("🔴 Response data:", JSON.stringify(apiError.response.data, null, 2));
        }
        throw apiError;
      }
    } catch (error) {
      console.error("🔴 Error in addEvent:", error);
      console.error("🔴 Error stack:", error.stack);
      
      return { 
        success: false, 
        error: error.message,
        details: error.response?.data || {},
        status: error.response?.status
      };
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
      // Check if we already have cached participants
      const cachedKey = `event_participants_${eventId}`;
      const cachedData = await AsyncStorage.getItem(cachedKey);
      
      if (cachedData) {
        // Use cached data if available and not expired (cache for 10 minutes)
        const parsedCache = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsedCache.timestamp;
        
        if (cacheAge < 10 * 60 * 1000) { // 10 minutes
          console.log(`Using cached participants for event ${eventId}`);
          return parsedCache.participants;
        }
      }
      
      console.log(`Fetching participants for event ${eventId}...`);
      const response = await apiClient.get(`/events/${eventId}/participants`);
      
      if (response.data && response.data.participants) {
        // Cache the participants
        await AsyncStorage.setItem(cachedKey, JSON.stringify({
          participants: response.data.participants,
          timestamp: Date.now()
        }));
        
        return response.data.participants;
      }
      return [];
    } catch (error) {
      console.error("Error fetching participants:", error);
      // Don't throw - return empty array to avoid crashes
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
