import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../utils/apiClient";
import { SERVER_CONFIG } from "../../config/serverConfig";
import { Alert } from "react-native";

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
    const now = new Date().toISOString();
    return eventsList.map((event) => {
      try {
        const start = new Date(event.start_date).toISOString();
        const end = new Date(event.end_date).toISOString();

        if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
          console.warn(
            `Invalid dates for event ${event.Id}: Start=${event.start_date}, End=${event.end_date}`
          );
          return { ...event, status: "past" };
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
          `Event ${event.Id} status: ${status}, Start: ${start}, End: ${end}, Now: ${now}`
        );
        return { ...event, status };
      } catch (e) {
        console.error(`Error processing dates for event ${event.Id}:`, e);
        return { ...event, status: "past" };
      }
    });
  };

  // Hent hendelser fra server eller lokal lagring
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events");
      console.log("Fetched events from server:", response.data.data);
      let serverEvents = response.data.data || [];

      for (let event of serverEvents) {
        console.log(
          `Event ${event.Id} dates - Start: ${event.start_date}, End: ${event.end_date}`
        );
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
        event.isLocalOnly = false; // Serverhendelser er ikke lokale
      }

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

  // Synkroniser lokale hendelser med serveren
  const syncLocalEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        const localEvents = JSON.parse(storedEvents);
        for (const event of localEvents) {
          if (event.isLocalOnly) {
            try {
              const serverEventData = {
                title: event.title,
                description: event.description || "",
                activity: event.selectedActivity?.name || "",
                goal: event.goalValue || 0,
                start_date: event.start_date,
                end_date: event.end_date,
                location: event.location || "",
                event_type: event.eventType || "individual",
                total_participants: Number(event.participantCount) || 0,
                team_count: Number(event.teamCount) || 0,
                members_per_team: Number(event.membersPerTeam) || 0,
              };

              const response = await apiClient.post("/events", serverEventData);
              setEvents((prevEvents) =>
                prevEvents.map((e) =>
                  e.Id === event.Id
                    ? {
                        ...e,
                        Id: response.data.eventId,
                        isLocalOnly: false,
                      }
                    : e
                )
              );
              console.log(
                `Synced local event ${event.Id} to server as ${response.data.eventId}`
              );
            } catch (error) {
              console.error(`Failed to sync event ${event.Id}:`, error);
            }
          }
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      }
    } catch (error) {
      console.error("Failed to sync local events:", error);
    }
  };

  useEffect(() => {
    loadEvents();

    // Prøv å synkronisere lokale hendelser ved oppstart
    syncLocalEvents();

    // Oppdater status hvert minutt
    const statusInterval = setInterval(() => {
      setEvents((prevEvents) => {
        const updatedEvents = updateEventStatus(prevEvents);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
    }, 60000);

    // Polling for hendelser hvis brukeren har blitt med i en hendelse
    let pollingInterval;
    if (hasJoinedEvent) {
      pollingInterval = setInterval(() => {
        loadEvents();
        syncLocalEvents(); // Synkroniser ved polling
      }, 30000);
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
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: new Date(newEvent.end_date).toISOString(),
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
        start_date: serverEventData.start_date,
        end_date: serverEventData.end_date,
        status:
          new Date(serverEventData.start_date) > new Date()
            ? "upcoming"
            : "active",
        isLocalOnly: false,
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
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: new Date(newEvent.end_date).toISOString(),
        status:
          new Date(newEvent.start_date) > new Date() ? "upcoming" : "active",
        isLocalOnly: true, // Marker som lokal hendelse
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
                isLocalOnly: false,
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
                isLocalOnly: event.isLocalOnly, // Behold isLocalOnly-status
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
      console.log("Attempting to delete event with ID:", eventId);
      const event = events.find((e) => e.Id === eventId);
      if (!event) {
        throw new Error("Event not found locally");
      }

      if (event.isLocalOnly) {
        // Slett kun lokalt hvis hendelsen ikke finnes på serveren
        setEvents((prevEvents) => {
          const filteredEvents = prevEvents.filter((e) => e.Id !== eventId);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
          return filteredEvents;
        });
        console.log(`Locally deleted event ${eventId}`);
        return;
      }

      const response = await apiClient.delete(`/events/${eventId}`);
      if (response.data.success) {
        setEvents((prevEvents) => {
          const filteredEvents = prevEvents.filter((e) => e.Id !== eventId);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
          return filteredEvents;
        });
        console.log(`Event ${eventId} deleted successfully from server`);
      } else {
        throw new Error(response.data.message || "Failed to delete event");
      }
    } catch (error) {
      console.error(
        "Failed to delete event:",
        error.response?.data,
        error.message
      );
      Alert.alert(
        "Feil ved sletting",
        error.response?.data?.message ||
          error.message ||
          "Kunne ikke slette hendelsen. Prøv igjen senere."
      );
      throw error;
    }
  };

  const joinEvent = () => {
    setHasJoinedEvent(true);
    loadEvents();
  };

  const clearPastEvents = async () => {
    try {
      const pastEventIds = events
        .filter((event) => event.status === "past" && !event.isLocalOnly)
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
