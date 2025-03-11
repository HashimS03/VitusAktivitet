import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const STORAGE_KEY = "@events";

  // Load events from AsyncStorage on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedEvents) {
          setEvents(JSON.parse(storedEvents));
        } else {
          // Initial test data (optional)
          const initialEvents = [
            {
              id: "1",
              title: "Event 1",
              start_date: "2025-03-01T00:00:00Z",
              end_date: "2025-03-05T00:00:00Z",
              goalValue: 100,
              currentValue: 50,
            },
            {
              id: "2",
              title: "Event 2",
              start_date: "2025-03-06T00:00:00Z",
              end_date: "2025-03-10T00:00:00Z",
              goalValue: 200,
              currentValue: 150,
            },
          ];
          setEvents(initialEvents);
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };
    loadEvents();
  }, []);

  // Save events to AsyncStorage whenever events change
  useEffect(() => {
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      } catch (error) {
        console.error("Failed to save events:", error);
      }
    };
    saveEvents();
  }, [events]);

  // Function to categorize events based on current time
  const categorizeEvents = () => {
    const now = new Date();
    const nowUTC = new Date(now.toISOString());
    const updatedUpcoming = [];
    const updatedActive = [];
    const updatedPast = [];

    console.log("Categorizing events at (UTC):", nowUTC.toISOString());

    events.forEach((event) => {
      const startDate = new Date(
        event.start_date.endsWith("Z")
          ? event.start_date
          : `${event.start_date}Z`
      );
      const endDate = new Date(
        event.end_date.endsWith("Z") ? event.end_date : `${event.end_date}Z`
      );

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn(
          `Invalid date for event ${event.id}: start=${event.start_date}, end=${event.end_date}`
        );
        return;
      }

      console.log(
        `Event ${
          event.id
        }: start=${startDate.toISOString()}, end=${endDate.toISOString()}, now=${nowUTC.toISOString()}`
      );

      if (startDate <= nowUTC && nowUTC <= endDate) {
        updatedActive.push(event);
        console.log(`Event ${event.id} categorized as active`);
      } else if (startDate > nowUTC) {
        updatedUpcoming.push(event);
        console.log(`Event ${event.id} categorized as upcoming`);
      } else if (endDate < nowUTC) {
        updatedPast.push(event);
        console.log(`Event ${event.id} categorized as past`);
      } else {
        console.warn(
          `Event ${
            event.id
          } not categorized: start=${startDate.toISOString()}, end=${endDate.toISOString()}`
        );
      }
    });

    setUpcomingEvents((prev) => {
      const newUpcoming =
        JSON.stringify(updatedUpcoming) !== JSON.stringify(prev)
          ? updatedUpcoming
          : prev;
      console.log(`Upcoming events count: ${newUpcoming.length}`);
      return newUpcoming;
    });
    setActiveEvents((prev) => {
      const newActive =
        JSON.stringify(updatedActive) !== JSON.stringify(prev)
          ? updatedActive
          : prev;
      console.log(`Active events count: ${newActive.length}`);
      return newActive;
    });
    setPastEvents((prev) => {
      const newPast =
        JSON.stringify(updatedPast) !== JSON.stringify(prev)
          ? updatedPast
          : prev;
      console.log(`Past events count: ${newPast.length}`);
      return newPast;
    });
  };

  // Schedule the next categorization based on the closest upcoming or ending event
  const scheduleNextCategorization = () => {
    const now = new Date();
    const nowUTC = new Date(now.toISOString());
    let nextEventTime = null;

    events.forEach((event) => {
      const startDate = new Date(
        event.start_date.endsWith("Z")
          ? event.start_date
          : `${event.start_date}Z`
      );
      const endDate = new Date(
        event.end_date.endsWith("Z") ? event.end_date : `${event.end_date}Z`
      );

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

      if (startDate > nowUTC && (!nextEventTime || startDate < nextEventTime)) {
        nextEventTime = startDate;
      }
      if (endDate > nowUTC && (!nextEventTime || endDate < nextEventTime)) {
        nextEventTime = endDate;
      }
    });

    if (nextEventTime) {
      const delay = nextEventTime - nowUTC;
      console.log(
        `Scheduling next categorization in ${
          delay / 1000
        } seconds at ${nextEventTime.toISOString()}`
      );
      return setTimeout(() => {
        categorizeEvents();
        scheduleNextCategorization();
      }, delay);
    } else {
      console.log("No upcoming events, falling back to 1-minute interval");
      return setInterval(() => {
        categorizeEvents();
      }, 60000);
    }
  };

  // Add a new event
  const addEvent = (newEvent) => {
    setEvents((prevEvents) => [
      ...prevEvents,
      { ...newEvent, id: Date.now().toString() },
    ]);
    console.log("Added event:", newEvent);
  };

  // Update an existing event
  const updateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    console.log("Updated event:", updatedEvent);
  };

  // Delete an event
  const deleteEvent = (eventId) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    );
    console.log("Deleted event with id:", eventId);
  };

  // Clear all past events
  const clearPastEvents = () => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => {
        const endDate = new Date(
          event.end_date.endsWith("Z") ? event.end_date : `${event.end_date}Z`
        );
        return !isNaN(endDate.getTime()) && endDate >= new Date();
      })
    );
    console.log("Cleared past events");
  };

  // Categorize events on mount and whenever events change
  useEffect(() => {
    categorizeEvents();
  }, [events]);

  // Manage dynamic scheduling of categorization
  useEffect(() => {
    categorizeEvents();
    let timer = scheduleNextCategorization();

    return () => {
      if (typeof timer === "number") {
        clearTimeout(timer);
      } else {
        clearInterval(timer);
      }
    };
  }, [events]);

  return (
    <EventContext.Provider
      value={{
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
