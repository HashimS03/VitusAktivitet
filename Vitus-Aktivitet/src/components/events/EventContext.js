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

  // Load events from server and fallback to AsyncStorage
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        const response = await apiClient.get('/events');
        const serverEvents = response.data.data || [];
        
        // Ensure participants is parsed correctly
        const parsedEvents = serverEvents.map(event => ({
          ...event,
          participants: Array.isArray(event.participants) ? event.participants : [],
        }));
        
        setEvents(parsedEvents);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedEvents));
        
      } catch (serverError) {
        console.error("Failed to load events from server:", serverError);
        
        if (serverError.response) {
          console.error("Server response error:", {
            status: serverError.response.status,
            data: serverError.response.data
          });
        }
        
        try {
          const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedEvents) {
            const parsed = JSON.parse(storedEvents).map(event => ({
              ...event,
              participants: Array.isArray(event.participants) ? event.participants : [],
            }));
            setEvents(parsed);
          } else {
            setEvents([]);
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

  // Fetch a single event by ID
  const fetchEvent = async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch event:", error);
      throw error;
    }
  };

  // Join an event
  const joinEvent = async (eventId) => {
    try {
      await apiClient.post(`/events/${eventId}/join`);
      const eventData = await fetchEvent(eventId);
      
      setEvents(prevEvents => {
        const updatedEvents = prevEvents.map(event =>
          event.id === eventId ? { ...event, participants: eventData.participants } : event
        );
        if (!updatedEvents.some(event => event.id === eventId)) {
          updatedEvents.push(eventData);
        }
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      
      return eventData;
    } catch (error) {
      console.error("Failed to join event:", error);
      throw error;
    }
  };

  // Add a new event
  const addEvent = async (newEvent) => {
    try {
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
      
      const response = await apiClient.post('/events', serverEventData);
      
      const eventWithId = { 
        ...newEvent, 
        id: response.data.eventId.toString(),
        participants: newEvent.participants || [],
      };
      
      setEvents(prevEvents => {
        const updatedEvents = [...prevEvents, eventWithId];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      
      console.log("Event added successfully:", eventWithId);
      return eventWithId;
      
    } catch (error) {
      console.error("Failed to add event to server:", error);
      
      const eventWithId = { ...newEvent, id: Date.now().toString() };
      setEvents(prevEvents => {
        const updatedEvents = [...prevEvents, eventWithId];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      
      console.log("Event added locally only (server failed):", eventWithId);
      return eventWithId;
    }
  };

  // Update an event
  const updateEvent = async (updatedEvent) => {
    try {
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
      
      await apiClient.put(`/events/${updatedEvent.id}`, serverEventData);
    
      const updatedEvents = events.map(event => 
        event.id === updatedEvent.id ? { ...updatedEvent, participants: event.participants } : event
      );
      
      setEvents(updatedEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      console.log("Event updated successfully:", updatedEvent);
      
    } catch (error) {
      console.error("Failed to update event on server:", error);
      
      const updatedEvents = events.map(event => 
        event.id === updatedEvent.id ? { ...updatedEvent, participants: event.participants } : event
      );
      
      setEvents(updatedEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      
      console.log("Event updated locally only (server failed):", updatedEvent);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      
      const filteredEvents = events.filter(event => event.id !== eventId);
      setEvents(filteredEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
      
      console.log("Event deleted successfully:", eventId);
      
    } catch (error) {
      console.error("Failed to delete event from server:", error);
      
      const filteredEvents = events.filter(event => event.id !== eventId);
      setEvents(filteredEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
      
      console.log("Event deleted locally only (server failed):", eventId);
    }
  };

  // Filter events
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

  // Clear past events
  const clearPastEvents = async () => {
    // Implementation depends on server API
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
        fetchEvent,
        joinEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};