import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../utils/apiClient";
import { Alert } from "react-native";

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
      if (!dateString) {
        console.warn("Date string is undefined or null");
        return new Date();
      }
      if (!dateString.includes("T")) {
        // Hvis ingen tid er spesifisert, sett til midnatt lokal tid
        return new Date(`${dateString}T00:00:00`);
      }
      return new Date(dateString);
    } catch (e) {
      console.warn(`Invalid date string: ${dateString}`);
      return new Date();
    }
  };

  const updateEventStatus = (eventsList) => {
    const now = new Date();
    return eventsList.map((event) => {
      try {
        let start = parseDate(event.start_date);
        let end = parseDate(event.end_date);

        // Valider datoer
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn(
            `Invalid dates for event ${event.Id}: Start=${event.start_date}, End=${event.end_date}`
          );
          return { ...event, status: "past" };
        }

        // Konverter til ISO for sammenligning
        const startISO = start.toISOString();
        const endISO = end.toISOString();
        const nowISO = now.toISOString();

        let status;
        if (startISO > nowISO) {
          status = "upcoming";
        } else if (endISO < nowISO) {
          status = "past";
        } else {
          status = "active";
        }

        console.log(
          `Event ${event.Id} status: ${status}, Start: ${startISO}, End: ${endISO}, Now: ${nowISO}`
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
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch events");
      }
      let serverEvents = response.data.data || [];

      for (let event of serverEvents) {
        console.log(
          `Event ${event.Id} dates - Start: ${event.start_date}, End=${event.end_date}`
        );
        // Parse datoer fra serveren
        event.start_date = parseDate(event.start_date).toISOString();
        event.end_date = parseDate(event.end_date).toISOString();

        try {
          const participantsResponse = await apiClient.get(
            `/events/${event.Id}/participants`
          );
          if (!participantsResponse.data.success) {
            console.error(`Failed to load participants for event ${event.Id}:`, participantsResponse.data.message);
            event.isTeamEvent = false;
            event.participants = [];
            event.team_count = 0;
            event.members_per_team = 0;
            event.total_participants = 0;
          } else {
            event.isTeamEvent = participantsResponse.data.isTeamEvent || false;
            event.team_count = participantsResponse.data.team_count || 0;
            event.members_per_team = participantsResponse.data.members_per_team || 0;
            event.total_participants = participantsResponse.data.total_participants || 0;
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
        } catch (participantError) {
          console.error(`Error fetching participants for event ${event.Id}:`, participantError);
          event.isTeamEvent = false;
          event.participants = [];
          event.team_count = 0;
          event.members_per_team = 0;
          event.total_participants = 0;
        }
        event.isLocalOnly = false;
      }

      const updatedEvents = updateEventStatus(serverEvents);
      setEvents(updatedEvents);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    } catch (serverError) {
      console.error("Failed to load events from server:", {
        message: serverError.message,
        response: serverError.response ? serverError.response.data : null,
        status: serverError.response ? serverError.response.status : null,
      });
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

    const startDate = parseDate(newEvent.start_date);
    const endDate = parseDate(newEvent.end_date);
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
      console.log("Sending to server:", serverEventData);

      const response = await apiClient.post("/events", serverEventData);
      console.log("Server response:", response.data);
      const eventWithId = {
        ...newEvent,
        Id: response.data.eventId,
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
      console.error("Failed to add event to server:", error);
      await syncLocalEvents();
      const eventWithId = {
        ...newEvent,
        Id: Date.now().toString(),
        participants: [],
        isLocalOnly: true,
        status: startDate > new Date() ? "upcoming" : "active",
      };
      setEvents((prevEvents) => {
        const updatedEvents = [...prevEvents, eventWithId];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      Alert.alert(
        "Feil ved oppretting",
        "Kunne ikke opprette hendelsen på serveren. Lagret lokalt."
      );
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