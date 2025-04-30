import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../utils/apiClient";
import { SERVER_CONFIG } from "../../config/serverConfig";

const STORAGE_KEY = "events";
const API_BASE_URL = SERVER_CONFIG.getBaseUrl();

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/events");
        let serverEvents = response.data.data || [];

        // Fetch participants for each event
        for (let event of serverEvents) {
          const participantsResponse = await apiClient.get(
            `/events/${event.id}/participants`
          );
          event.isTeamEvent = participantsResponse.data.isTeamEvent || false;
          event.participants = (
            participantsResponse.data.participants || []
          ).map((participant) => ({
            user_id: participant.user_id,
            name: participant.name,
            team_id: participant.team_id,
            individual_progress: participant.individual_progress || 0,
            team_progress: participant.team_progress || 0,
          }));
        }

        setEvents(serverEvents);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverEvents));
      } catch (serverError) {
        console.error("Failed to load events from server:", serverError);
        try {
          const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
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

      const response = await apiClient.post("/events", serverEventData);
      const eventWithId = {
        ...newEvent,
        id: response.data.eventId || Date.now().toString(),
        participants: [],
      };

      setEvents((prevEvents) => [...prevEvents, eventWithId]);
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...events, eventWithId])
      );
      return eventWithId;
    } catch (error) {
      console.error("Failed to add event to server:", error);
      const eventWithId = {
        ...newEvent,
        id: Date.now().toString(),
        participants: [],
      };
      setEvents((prevEvents) => [...prevEvents, eventWithId]);
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...events, eventWithId])
      );
      return eventWithId;
    }
  };

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
      const updatedEvents = events.map((event) =>
        event.id === updatedEvent.id
          ? { ...updatedEvent, participants: event.participants }
          : event
      );

      setEvents(updatedEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (error) {
      console.error("Failed to update event on server:", error);
      const updatedEvents = events.map((event) =>
        event.id === updatedEvent.id
          ? { ...updatedEvent, participants: event.participants }
          : event
      );

      setEvents(updatedEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      const filteredEvents = events.filter((event) => event.id !== eventId);
      setEvents(filteredEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
    } catch (error) {
      console.error("Failed to delete event from server:", error);
      const filteredEvents = events.filter((event) => event.id !== eventId);
      setEvents(filteredEvents);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
    }
  };

  const activeEvents = events.filter((event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return startDate <= now && endDate >= now;
  });

  const upcomingEvents = events.filter((event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    return startDate > now;
  });

  const pastEvents = events.filter((event) => {
    const now = new Date();
    const endDate = new Date(event.end_date);
    return endDate < now;
  });

  const clearPastEvents = async () => {};

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
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
