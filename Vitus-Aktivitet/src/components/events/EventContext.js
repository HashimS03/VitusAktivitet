import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../utils/apiClient";
import { Alert } from "react-native";
import { useUserContext } from "../context/UserContext";

const STORAGE_KEY = "events";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasJoinedEvent, setHasJoinedEvent] = useState(false);
  const { token } = useUserContext(); // Get token from UserContext

  const parseDate = (dateString) => {
    try {
      if (!dateString) {
        console.warn("Date string is undefined or null, returning current UTC date");
        return new Date(Date.UTC(1970, 0, 1)); // Default to a safe past date
      }

      let parsedDate;
      if (!dateString.includes("T")) {
        // Format like "2025-05-11"
        parsedDate = new Date(`${dateString}T00:00:00Z`); // Normalize to UTC
      } else if (dateString.includes(" ")) {
        // Format like "2025-05-11 12:00:00"
        parsedDate = new Date(dateString.replace(" ", "T") + "Z"); // Normalize to UTC
      } else {
        parsedDate = new Date(dateString);
      }

      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid date string: ${dateString}, returning default UTC date`);
        return new Date(Date.UTC(1970, 0, 1)); // Safe fallback
      }

      // Normalize to UTC
      const utcDate = new Date(Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
        parsedDate.getUTCHours(),
        parsedDate.getUTCMinutes(),
        parsedDate.getUTCSeconds()
      ));
      console.log(`Parsed date ${dateString} as UTC ${utcDate.toISOString()}`);
      return utcDate;
    } catch (e) {
      console.warn(`Error parsing date string: ${dateString}, returning default UTC date`, e);
      return new Date(Date.UTC(1970, 0, 1)); // Safe fallback
    }
  };

  const updateEventStatus = (eventsList) => {
    const now = new Date(); // Local time
    const nowUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    ));
    console.log(`Current time (local): ${now.toISOString()}, UTC: ${nowUTC.toISOString()}`);

    return eventsList.map((event) => {
      try {
        const start = parseDate(event.start_date);
        const end = parseDate(event.end_date);

        const startISO = start.toISOString();
        const endISO = end.toISOString();
        const nowISO = nowUTC.toISOString();

        let status;
        if (startISO > nowISO) {
          status = "upcoming";
        } else if (endISO < nowISO) {
          status = "past";
        } else {
          status = "active";
        }

        console.log(
          `Event ${event.Id} status: ${status}, Start: ${startISO}, End: ${endISO}, Now (UTC): ${nowISO}`
        );
        return { ...event, status };
      } catch (e) {
        console.error(`Error processing dates for event ${event.Id}:`, e);
        return { ...event, status: "upcoming" }; // Fallback to upcoming to avoid misplacement
      }
    });
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("Load events response:", response.data);
      let serverEvents = response.data.data || [];

      for (let event of serverEvents) {
        try {
          event.start_date = parseDate(event.start_date).toISOString();
          event.end_date = parseDate(event.end_date).toISOString();
          event.goalValue = event.goal || 0; // Ensure goalValue is set
          event.currentValue = event.current_progress || 0; // Ensure currentValue is set

          const participantsResponse = await apiClient.get(`/events/${event.Id}/participants`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          console.log(`Participants for event ${event.Id}:`, participantsResponse.data);
          event.isTeamEvent = participantsResponse.data.isTeamEvent || false;
          event.team_count = participantsResponse.data.team_count || 0;
          event.members_per_team = participantsResponse.data.members_per_team || 0;
          event.total_participants = participantsResponse.data.total_participants || 0;
          event.activity = event.activity || "enheter"; // Default activity unit
          event.participants = (participantsResponse.data.participants || []).map(
            (participant) => {
              const userId = participant.user_id ? String(participant.user_id).trim() : null;
              return {
                user_id: userId,
                name: participant.name || "Ukjent",
                team_id: participant.team_id || null,
                individual_progress: participant.individual_progress || 0,
                team_progress: participant.team_progress || 0,
              };
            }
          );
          event.isLocalOnly = false;
        } catch (participantError) {
          console.error(`Failed to load participants for event ${event.Id}:`, participantError);
          event.isTeamEvent = false;
          event.team_count = 0;
          event.members_per_team = 0;
          event.total_participants = 0;
          event.activity = "enheter";
          event.participants = [];
          event.isLocalOnly = false;
        }
      }

      const updatedEvents = updateEventStatus(serverEvents);
      setEvents(updatedEvents);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      console.log("Updated events with IDs:", updatedEvents.map(e => ({ id: e.Id, title: e.title, status: e.status })));
    } catch (serverError) {
      console.error("Failed to load events from server:", serverError.response?.data || serverError.message);
      try {
        const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedEvents) {
          const parsedEvents = JSON.parse(storedEvents);
          const updatedEvents = updateEventStatus(parsedEvents);
          setEvents(updatedEvents);
          console.log("Loaded events from storage with IDs:", updatedEvents.map(e => ({ id: e.Id, title: e.title, status: e.status })));
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
            console.log("Attempting to sync local event:", event.Id, event.title);
            const serverEventData = {
              title: event.title || "Ukjent tittel",
              description: event.description || "",
              activity: event.activity || "enheter",
              goal: event.goalValue || 0,
              start_date: event.start_date,
              end_date: event.end_date,
              location: event.location || "",
              event_type: event.isTeamEvent ? "team" : "individual",
              total_participants: Number(event.total_participants) || 0,
              team_count: Number(event.team_count) || 0,
              members_per_team: Number(event.members_per_team) || 0,
            };

            const response = await apiClient.post("/events", serverEventData, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setEvents((prevEvents) =>
              prevEvents.map((e) =>
                e.Id === event.Id ? { ...e, Id: response.data.eventId, isLocalOnly: false } : e
              )
            );
            console.log(`Synced local event ${event.Id} to server as ${response.data.eventId}`);
          }
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      }
    } catch (error) {
      console.error("Failed to sync local events:", error);
    }
  };

  const joinEvent = (eventData) => {
    console.log("Joining event with data:", eventData);
    setHasJoinedEvent(true);

    const start = parseDate(eventData.start_date);
    const end = parseDate(eventData.end_date);
    const updatedEvent = {
      ...eventData,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      goalValue: eventData.goalValue || 0, // Ensure goalValue is set
      currentValue: eventData.currentValue || 0, // Ensure currentValue is set
      activity: eventData.activity || "enheter", // Default activity unit
      status: updateEventStatus([{ ...eventData, start_date: start.toISOString(), end_date: end.toISOString() }])[0].status,
    };

    setEvents((prevEvents) => {
      const updatedEvents = updateEventStatus([...prevEvents, updatedEvent]);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      console.log("Joined event IDs:", updatedEvents.map(e => ({ id: e.Id, title: e.title, status: e.status })));
      return updatedEvents;
    });

    loadEvents();
  };

  const addEvent = async (newEvent) => {
    console.log("Received newEvent:", newEvent);

    if (!newEvent.title || !newEvent.start_date || !newEvent.end_date || !newEvent.eventType) {
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
      throw new Error("Missing required fields: title, start_date, end_date, and eventType are required");
    }

    const startDate = parseDate(newEvent.start_date);
    const endDate = parseDate(newEvent.end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid start_date or end_date:", newEvent.start_date, newEvent.end_date);
      Alert.alert("Feil", "Ugyldig datoformat for startdato eller sluttdato.");
      throw new Error("Invalid date format for start_date or end_date");
    }

    let eventWithId;
    try {
      const serverEventData = {
        title: newEvent.title,
        description: newEvent.description || "",
        activity: newEvent.activity || "enheter",
        goal: newEvent.goalValue || 0,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: newEvent.location || "",
        event_type: newEvent.eventType || "individual",
        total_participants: Number(newEvent.total_participants) || 0,
        team_count: Number(newEvent.team_count) || 0,
        members_per_team: Number(newEvent.members_per_team) || 0,
      };
      console.log("Sending to server:", serverEventData);

      const response = await apiClient.post("/events", serverEventData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("Server response:", response.data);
      eventWithId = {
        ...newEvent,
        Id: response.data.eventId,
        goalValue: newEvent.goalValue || 0,
        currentValue: 0,
        activity: newEvent.activity || "enheter",
        participants: [],
        isLocalOnly: false,
        status: startDate > new Date() ? "upcoming" : "active",
      };
    } catch (error) {
      console.error("Failed to add event to server:", error);
      await syncLocalEvents();
      eventWithId = {
        ...newEvent,
        Id: Date.now().toString(),
        goalValue: newEvent.goalValue || 0,
        currentValue: 0,
        activity: newEvent.activity || "enheter",
        participants: [],
        isLocalOnly: true,
        status: startDate > new Date() ? "upcoming" : "active",
      };
      Alert.alert(
        "Feil ved oppretting",
        "Kunne ikke opprette hendelsen på serveren. Lagret lokalt."
      );
    }

    setEvents((prevEvents) => {
      const updatedEvents = [...prevEvents, eventWithId];
      console.log("After adding event, events array:", updatedEvents.map(e => ({ id: e.Id, title: e.title, status: e.status })));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      return updatedEvents;
    });

    return eventWithId;
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
            e.Id === updatedEvent.Id ? { ...updatedEvent, isLocalOnly: true } : e
          )
        );
        return;
      }
    }

    try {
      await apiClient.get(`/events/${updatedEvent.Id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const serverEventData = {
        title: updatedEvent.title,
        description: updatedEvent.description || "",
        activity: updatedEvent.activity || "enheter",
        goal: updatedEvent.goalValue || 0,
        start_date: parseDate(updatedEvent.start_date).toISOString(),
        end_date: parseDate(updatedEvent.end_date).toISOString(),
        location: updatedEvent.location || "",
        event_type: updatedEvent.isTeamEvent ? "team" : "individual",
        total_participants: Number(updatedEvent.total_participants) || 0,
        team_count: Number(updatedEvent.team_count) || 0,
        members_per_team: Number(updatedEvent.members_per_team) || 0,
      };

      console.log("Sending update to /events/", updatedEvent.Id, "with data:", serverEventData);
      await apiClient.put(`/events/${updatedEvent.Id}`, serverEventData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.Id === updatedEvent.Id
            ? { ...updatedEvent, participants: event.participants, status: event.status, isLocalOnly: false }
            : event
        )
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error("Failed to update event on server:", error);
      Alert.alert(
        "Feil ved oppdatering",
        error.response?.data?.message || "Kunne ikke oppdatere hendelsen på serveren."
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.Id === updatedEvent.Id
            ? { ...updatedEvent, participants: event.participants, status: event.status, isLocalOnly: event.isLocalOnly }
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

      const response = await apiClient.delete(`/events/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
      console.error("Failed to delete event:", error.response?.data, error.message);
      Alert.alert(
        "Feil ved sletting",
        error.response?.data?.message || error.message || "Kunne ikke slette hendelsen."
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
          const response = await apiClient.delete(`/events/${eventId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!response.data.success) {
            failedEvents.push({ id: eventId, message: response.data.message });
          }
        } catch (deleteError) {
          console.error(`Error deleting event ${eventId}:`, deleteError);
          failedEvents.push({ id: eventId, message: deleteError.message });
        }
      }
      setEvents((prevEvents) => prevEvents.filter((event) => event.status !== "past"));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      if (failedEvents.length > 0) {
        Alert.alert(
          "Noen slettinger mislyktes",
          `Kunne ikke slette følgende hendelser: ${failedEvents.map((e) => `ID ${e.id}: ${e.message}`).join("\n")}`
        );
      } else {
        Alert.alert("Suksess", "Alle tidligere hendelser er slettet");
      }
    } catch (error) {
      console.error("Failed to clear past events:", error);
      setEvents((prevEvents) => prevEvents.filter((event) => event.status !== "past"));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      Alert.alert(
        "Feil",
        "Kunne ikke slette alle tidligere hendelser. Noen kan ha blitt fjernet lokalt."
      );
      throw error;
    }
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
        loadEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};