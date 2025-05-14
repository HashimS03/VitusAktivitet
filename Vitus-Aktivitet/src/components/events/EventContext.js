import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../utils/apiClient";
import { Alert } from "react-native";
import { parseServerDate, formatServerDate } from "../../utils/dateUtils";

const STORAGE_KEY = "events";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasJoinedEvent, setHasJoinedEvent] = useState(false);

  // Hjelpefunksjon for å parse datoer og håndtere manglende tid
  const parseDate = (dateString) => {
    try {
      // Check if dateString is null or undefined
      if (!dateString) {
        console.warn("Missing date string");
        return new Date();
      }

      console.log("Parsing date string:", dateString);

      // For Date objects, just return them
      if (dateString instanceof Date) {
        return dateString;
      }

      // Create a new date object and force UTC interpretation
      const date = new Date(dateString);
      
      // Log the parsed result for debugging
      console.log("Parsed date:", date.toISOString());
      
      return date;
    } catch (e) {
      console.error(`Invalid date string: ${dateString}`, e);
      return new Date();
    }
  };

  const updateEventStatus = (eventsList) => {
    const now = new Date();
    return eventsList.map((event) => {
      try {
        // Create Date objects directly
        let start = new Date(event.start_date);
        let end = new Date(event.end_date);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn(
            `Invalid dates for event ${event.Id}: Start=${event.start_date}, End=${event.end_date}`
          );
          return { ...event, status: "past" };
        }

        // Simple comparison of date objects
        let status;
        if (start > now) {
          status = "upcoming";
        } else if (end < now) {
          status = "past";
        } else {
          status = "active";
        }

        console.log(
          `Event ${event.Id} status: ${status}, Start: ${start.toISOString()}, End: ${end.toISOString()}, Now: ${now.toISOString()}`
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
      let serverEvents = response.data.data || [];

      for (let event of serverEvents) {
        console.log(`Event ${event.Id} raw dates - Start: ${event.start_date}, End: ${event.end_date}`);
        
        try {
          // Parse dates from SQL format and convert to consistent format
          const startDate = parseServerDate(event.start_date);
          const endDate = parseServerDate(event.end_date);
          
          // Store in a consistent format for the app to use
          event.start_date = startDate.toISOString();
          event.end_date = endDate.toISOString();
          
          console.log(`Event ${event.Id} normalized dates - Start: ${event.start_date}, End: ${event.end_date}`);
        } catch (dateError) {
          console.error(`Error parsing dates for event ${event.Id}:`, dateError);
          // Fallback
          event.start_date = new Date().toISOString();
          event.end_date = new Date(Date.now() + 86400000).toISOString();
        }
        
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

    try {
      // Convert dates to proper ISO format without additional parsing that might cause issues
      const startDate = new Date(newEvent.start_date);
      const endDate = new Date(newEvent.end_date);
      
      console.log("Start date (raw):", newEvent.start_date);
      console.log("End date (raw):", newEvent.end_date);
      console.log("Start date (parsed):", startDate.toISOString());
      console.log("End date (parsed):", endDate.toISOString());
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(
          "Invalid start_date or end_date:",
          newEvent.start_date,
          newEvent.end_date
        );
        Alert.alert("Feil", "Ugyldig datoformat for startdato eller sluttdato.");
        throw new Error("Invalid date format for start_date or end_date");
      }

      const serverEventData = {
        title: newEvent.title,
        description: newEvent.description || "",
        activity: newEvent.activity || "",
        goal: newEvent.goalValue || 0,
        start_date: startDate.toISOString(), // Always send as ISO string
        end_date: endDate.toISOString(),     // Always send as ISO string
        location: newEvent.location || "",
        event_type: newEvent.eventType || "individual",
        total_participants: Number(newEvent.participantCount) || 0,
        team_count: Number(newEvent.teamCount) || 0,
        members_per_team: Number(newEvent.membersPerTeam) || 0,
        auto_join: newEvent.auto_join || false,
      };
      
      console.log("Sending to server:", serverEventData);

      const response = await apiClient.post("/events", serverEventData);
      console.log("Server response:", response.data);
      
      const eventId = response.data.eventId;
      
      // Auto-join the user to their own event if flag is set
      if (newEvent.auto_join && eventId) {
        try {
          await apiClient.post(`/events/${eventId}/participants`, {
            user_role: 'creator' // Add role information
          });
          console.log("User automatically joined event as creator");
        } catch (joinError) {
          console.error("Error auto-joining event:", joinError);
          // Continue even if auto-join fails - event is still created
        }
      }
      
      const eventWithId = {
        ...newEvent,
        Id: eventId,
        participants: [],
        isLocalOnly: false,
        status: startDate > new Date() ? "upcoming" : "active",
      };

      setEvents((prevEvents) => {
        const updatedEvents = [...prevEvents, eventWithId];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      
      return eventWithId;
    } catch (error) {
      console.error("Failed to add event:", error);
      
      if (!navigator.onLine) {
        const eventId = `local_${Date.now()}`;
        const eventWithId = {
          ...newEvent,
          Id: eventId,
          isLocalOnly: true,
          participants: [],
          status: startDate > new Date() ? "upcoming" : "active",
        };
        
        setEvents((prevEvents) => {
          const updatedEvents = [...prevEvents, eventWithId];
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
          return updatedEvents;
        });
        
        Alert.alert(
          "Offline modus",
          "Hendelsen ble lagret lokalt. Den vil bli synkronisert når du er online igjen."
        );
        
        return eventWithId;
      }
      
      Alert.alert(
        "Feil ved oppretting",
        error.response?.data?.message || "Kunne ikke opprette hendelsen."
      );
      throw error;
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

    if (event.isLocalOnly) {
      console.log("Syncing local event before update:", updatedEvent.Id);
      await syncLocalEvents();
      const syncedEvent = events.find((e) => e.Id === updatedEvent.Id);
      if (syncedEvent.isLocalOnly) {
        console.warn("Sync failed, updating locally:", updatedEvent.Id);
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.Id === updatedEvent.Id
              ? { ...updatedEvent, isLocalOnly: true }
              : e
          )
        );
        return;
      }
    }

    try {
      await apiClient.get(`/events/${updatedEvent.Id}`);
      const serverEventData = {
        title: updatedEvent.title,
        description: updatedEvent.description || "",
        activity: updatedEvent.selectedActivity?.name || "",
        goal: updatedEvent.goalValue || 0,
        start_date: parseDate(updatedEvent.start_date).toISOString(),
        end_date: parseDate(updatedEvent.end_date).toISOString(),
        location: updatedEvent.location || "",
        event_type: updatedEvent.eventType || "individual",
        total_participants: Number(updatedEvent.participantCount) || 0,
        team_count: Number(updatedEvent.teamCount) || 0,
        members_per_team: Number(updatedEvent.membersPerTeam) || 0,
      };

      console.log(
        "Sending update to /events/",
        updatedEvent.Id,
        "with data:",
        serverEventData
      );
      await apiClient.put(`/events/${updatedEvent.Id}`, serverEventData);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.Id === updatedEvent.Id
            ? {
                ...updatedEvent,
                participants: event.participants,
                status: event.status,
                isLocalOnly: false,
              }
            : event
        )
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("Failed to update event on server:", error);
      Alert.alert(
        "Feil ved oppdatering",
        error.response?.data?.message ||
          "Kunne ikke oppdatere hendelsen på serveren."
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.Id === updatedEvent.Id
            ? {
                ...updatedEvent,
                participants: event.participants,
                status: event.status,
                isLocalOnly: event.isLocalOnly,
              }
            : event
        )
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      throw error;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const event = events.find((e) => e.Id === eventId);
      if (!event) throw new Error("Event not found locally");

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
          "Kunne ikke slette hendelsen."
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
        try {
          const response = await apiClient.delete(`/events/${eventId}`);
          if (!response.data.success) {
            failedEvents.push({ id: eventId, message: response.data.message });
          }
        } catch (deleteError) {
          console.error(`Error deleting event ${eventId}:`, deleteError);
          failedEvents.push({ id: eventId, message: deleteError.message });
        }
      }
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.status !== "past")
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
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
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.status !== "past")
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
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
