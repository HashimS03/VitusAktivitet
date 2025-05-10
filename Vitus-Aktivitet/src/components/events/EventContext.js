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

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events");
      console.log("Fetched events from server:", response.data.data);
      let serverEvents = response.data.data || [];

      for (let event of serverEvents) {
        console.log(
          `Event ${event.Id} dates - Start: ${event.start_date}, End=${event.end_date}`
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
        event.isLocalOnly = false;
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

  const syncLocalEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        const localEvents = JSON.parse(storedEvents);
        for (const event of localEvents) {
          if (event.isLocalOnly) {
            console.log(
              "Attempting to sync local event:",
              event.Id,
              event.title
            );
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
                    ? { ...e, Id: response.data.eventId, isLocalOnly: false }
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
    syncLocalEvents();

    const statusInterval = setInterval(() => {
      setEvents((prevEvents) => {
        const updatedEvents = updateEventStatus(prevEvents);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
    }, 60000);

    let pollingInterval;
    if (hasJoinedEvent) {
      pollingInterval = setInterval(() => {
        loadEvents();
        syncLocalEvents();
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
    console.log("Received newEvent:", newEvent);
    console.log(
      "start_date:",
      newEvent.start_date,
      "end_date:",
      newEvent.end_date
    );

    // Validering av obligatoriske felter
    if (
      !newEvent.title ||
      !newEvent.start_date ||
      !newEvent.end_date ||
      !newEvent.eventType
    ) {
      console.error("Missing required fields:", {
        title: newEvent.title,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        eventType: newEvent.eventType,
      });
      Alert.alert(
        "Feil",
        "Mangler obligatoriske felter: tittel, startdato, sluttdato og hendelsestype er påkrevd."
      );
      throw new Error(
        "Missing required fields: title, start_date, end_date, and eventType are required"
      );
    }

    // Validering av datoer
    const startDate = new Date(newEvent.start_date);
    const endDate = new Date(newEvent.end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error(
        "Invalid start_date or end_date:",
        newEvent.start_date,
        newEvent.end_date
      );
      Alert.alert("Feil", "Ugyldig datoformat for startdato eller sluttdato.");
      throw new Error("Invalid date format for start_date or end_date");
    }

    try {
      const serverEventData = {
        title: newEvent.title,
        description: newEvent.description || "",
        activity: newEvent.selectedActivity?.name || "",
        goal: newEvent.goalValue || 0,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: newEvent.location || "",
        event_type: newEvent.eventType || "individual",
        total_participants: Number(newEvent.participantCount) || 0,
        team_count: Number(newEvent.teamCount) || 0,
        members_per_team: Number(newEvent.membersPerTeam) || 0,
      };
      console.log("Prepared serverEventData:", serverEventData);

      const response = await apiClient.post("/events", serverEventData);
      console.log("Server response:", response.data);
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
      Alert.alert(
        "Feil ved oppretting",
        error.response?.data?.message ||
          "Kunne ikke opprette hendelsen på serveren. Den er lagret lokalt i stedet."
      );
      console.log("Falling back to local event creation...");
      const eventWithId = {
        ...newEvent,
        Id: Date.now().toString(),
        participants: [],
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: startDate > new Date() ? "upcoming" : "active",
        isLocalOnly: true,
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
    console.log("Attempting to update event:", updatedEvent);
    const event = events.find((e) => e.Id === updatedEvent.Id);
    if (!event) {
      console.error("Event not found locally:", updatedEvent.Id);
      Alert.alert("Feil", "Hendelsen ble ikke funnet lokalt.");
      throw new Error("Event not found locally");
    }
    console.log(
      "isLocalOnly for event",
      updatedEvent.Id,
      ":",
      event.isLocalOnly
    );

    if (event.isLocalOnly) {
      await syncLocalEvents();
      const syncedEvent = events.find((e) => e.Id === updatedEvent.Id);
      if (syncedEvent.isLocalOnly) {
        setEvents((prevEvents) => {
          const updatedEvents = prevEvents.map((e) =>
            e.Id === updatedEvent.Id
              ? { ...updatedEvent, isLocalOnly: true }
              : e
          );
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
          return updatedEvents;
        });
        console.log(`Updated event ${updatedEvent.Id} locally`);
        return;
      }
    }

    // Sjekk om hendelsen eksisterer på serveren
    try {
      const response = await apiClient.get(`/events/${updatedEvent.Id}`);
      console.log("Event fetched from server:", response.data);
    } catch (error) {
      console.error("Event does not exist on server:", error);
      Alert.alert(
        "Feil",
        "Hendelsen eksisterer ikke på serveren. Synkroniser hendelser eller opprett den på nytt."
      );
      throw error;
    }

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

      console.log(
        "Sending update request to /events/",
        updatedEvent.Id,
        "with data:",
        serverEventData
      );
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
      Alert.alert(
        "Feil ved oppdatering",
        error.response?.data?.message ||
          "Kunne ikke oppdatere hendelsen på serveren. Sjekk om hendelsen eksisterer."
      );
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.Id === updatedEvent.Id
            ? {
                ...updatedEvent,
                participants: event.participants,
                status: event.status,
                isLocalOnly: event.isLocalOnly,
              }
            : event
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      throw error;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      console.log("Checking deletion for eventId:", eventId);
      const event = events.find((e) => e.Id === eventId);
      if (!event) {
        throw new Error("Event not found locally");
      }
      console.log("isLocalOnly for event", eventId, ":", event.isLocalOnly);

      if (event.isLocalOnly) {
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

  const clearPastEvents = async () => {
    try {
      await loadEvents();
      await syncLocalEvents();
      const pastEventIds = events
        .filter((event) => event.status === "past" && !event.isLocalOnly)
        .map((event) => event.Id);
      const failedEvents = [];
      for (const eventId of pastEventIds) {
        console.log(`Attempting to delete past event with ID: ${eventId}`);
        try {
          const response = await apiClient.delete(`/events/${eventId}`);
          console.log(`Delete response for event ${eventId}:`, response.data);
          if (!response.data.success) {
            failedEvents.push({ id: eventId, message: response.data.message });
          }
        } catch (deleteError) {
          console.error(`Error deleting event ${eventId}:`, deleteError);
          failedEvents.push({ id: eventId, message: deleteError.message });
        }
      }
      setEvents((prevEvents) => {
        const filteredEvents = prevEvents.filter(
          (event) => event.status !== "past"
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
        return filteredEvents;
      });
      if (failedEvents.length > 0) {
        Alert.alert(
          "Noen slettinger mislyktes",
          `Kunne ikke slette følgende hendelser: ${failedEvents
            .map((e) => `ID ${e.id}: ${e.message}`)
            .join("\n")}`
        );
      } else {
        Alert.alert("Suksess", "Alle tidligere hendelser er slettet");
      }
    } catch (error) {
      console.error("Failed to clear past events:", error);
      setEvents((prevEvents) => {
        const filteredEvents = prevEvents.filter(
          (event) => event.status !== "past"
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
        return filteredEvents;
      });
      Alert.alert(
        "Feil",
        "Kunne ikke slette alle tidligere hendelser. Noen kan ha blitt fjernet lokalt."
      );
      throw error;
    }
  };

  const joinEvent = () => {
    setHasJoinedEvent(true);
    loadEvents();
  };

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
