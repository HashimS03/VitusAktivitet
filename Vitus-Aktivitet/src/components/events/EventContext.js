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
  const [hasJoinedEvent, setHasJoinedEvent] = useState(false);

  // Funksjon for å oppdatere hendelsesstatus
  const updateEventStatus = (eventsList) => {
    const now = new Date();
    return eventsList.map((event) => {
      try {
        const start = new Date(event.start_date);
        const end = new Date(event.end_date);

        // Valider datoer
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn(
            `Invalid dates for event ${event.Id}: Start=${event.start_date}, End=${event.end_date}`
          );
          return { ...event, status: "past" }; // Behandle ugyldige datoer som fortid
        }

        let status;
        if (start > now) {
          status = "upcoming";
        } else if (end < now) {
          status = "past";
        } else {
          status = "active";
        }

        console.log(
          `Event ${
            event.Id
          } status: ${status}, Start: ${start.toISOString()}, End: ${end.toISOString()}, Now: ${now.toISOString()}`
        );
        return { ...event, status };
      } catch (e) {
        console.error(`Error processing dates for event ${event.Id}:`, e);
        return { ...event, status: "past" };
      }
    });
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events");
      console.log("Fetched events from server:", response.data.data);
      let serverEvents = response.data.data || [];

      // Hent deltakere for hver hendelse
      for (let event of serverEvents) {
        const participantsResponse = await apiClient.get(
          `/events/${event.Id}/participants`
        );
        event.isTeamEvent = participantsResponse.data.isTeamEvent || false;
        event.participants = (participantsResponse.data.participants || []).map(
          (participant) => ({
            user_id: participant.user_id,
            name: participant.name,
            team_id: participant.team_id,
            individual_progress: participant.individual_progress || 0,
            team_progress: participant.team_progress || 0,
          })
        );
      }

      // Oppdater status for alle hendelser
      const updatedEvents = updateEventStatus(serverEvents);
      setEvents(updatedEvents);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (serverError) {
      console.error("Failed to load events from server:", serverError);
      try {
        const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedEvents) {
          const parsedEvents = JSON.parse(storedEvents);
          const updatedEvents = updateEventStatus(parsedEvents);
          setEvents(updatedEvents);
          console.log("Loaded events from storage:", updatedEvents);
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

  useEffect(() => {
    loadEvents();

    // Sett opp intervall for å oppdatere status hvert minutt
    const statusInterval = setInterval(() => {
      setEvents((prevEvents) => {
        const updatedEvents = updateEventStatus(prevEvents);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
    }, 60000); // Hvert 60. sekund

    // Polling for hendelser hvis brukeren har blitt med i en hendelse
    let pollingInterval;
    if (hasJoinedEvent) {
      pollingInterval = setInterval(loadEvents, 30000);
      console.log("Polling started for joined events");
    }

    return () => {
      clearInterval(statusInterval);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        console.log("Polling stopped");
      }
    };
  }, [hasJoinedEvent]);

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
        Id: response.data.eventId || Date.now().toString(),
        participants: [],
        status:
          new Date(newEvent.start_date) > new Date() ? "upcoming" : "active",
      };

      setEvents((prevEvents) => {
        const updatedEvents = [...prevEvents, eventWithId];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      return eventWithId;
    } catch (error) {
      console.error("Failed to add event to server:", error);
      const eventWithId = {
        ...newEvent,
        Id: Date.now().toString(),
        participants: [],
        status:
          new Date(newEvent.start_date) > new Date() ? "upcoming" : "active",
      };
      setEvents((prevEvents) => {
        const updatedEvents = [...prevEvents, eventWithId];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
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

      await apiClient.put(`/events/${updatedEvent.Id}`, serverEventData);
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.Id === updatedEvent.Id
            ? {
                ...updatedEvent,
                participants: event.participants,
                status: event.status,
              }
            : event
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
    } catch (error) {
      console.error("Failed to update event on server:", error);
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.Id === updatedEvent.Id
            ? {
                ...updatedEvent,
                participants: event.participants,
                status: event.status,
              }
            : event
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      setEvents((prevEvents) => {
        const filteredEvents = prevEvents.filter(
          (event) => event.Id !== eventId
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
        return filteredEvents;
      });
    } catch (error) {
      console.error("Failed to delete event from server:", error);
      setEvents((prevEvents) => {
        const filteredEvents = prevEvents.filter(
          (event) => event.Id !== eventId
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
        return filteredEvents;
      });
    }
  };

  const joinEvent = () => {
    setHasJoinedEvent(true);
    loadEvents();
  };

  const clearPastEvents = async () => {
    try {
      const pastEventIds = events
        .filter((event) => event.status === "past")
        .map((event) => event.Id);
      for (const eventId of pastEventIds) {
        await apiClient.delete(`/events/${eventId}`);
      }
      setEvents((prevEvents) => {
        const filteredEvents = prevEvents.filter(
          (event) => event.status !== "past"
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
        return filteredEvents;
      });
    } catch (error) {
      console.error("Failed to clear past events:", error);
      setEvents((prevEvents) => {
        const filteredEvents = prevEvents.filter(
          (event) => event.status !== "past"
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
        return filteredEvents;
      });
    }
  };

  // Filtrer hendelser basert på status
  const activeEvents = events.filter((event) => event.status === "active");
  const upcomingEvents = events.filter((event) => event.status === "upcoming");
  const pastEvents = events.filter((event) => event.status === "past");

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
        joinEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
