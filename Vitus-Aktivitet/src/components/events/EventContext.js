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
    const nowUTC = new Date(now.toISOString()); // Normalize to UTC
    const updatedUpcoming = [];
    const updatedActive = [];
    const updatedPast = [];

    console.log("Categorizing events at (UTC):", nowUTC.toISOString());

    events.forEach((event) => {
      // Ensure dates are treated as UTC
      const startDate = new Date(event.start_date.endsWith("Z") ? event.start_date : `${event.start_date}Z`);
      const endDate = new Date(event.end_date.endsWith("Z") ? event.end_date : `${event.end_date}Z`);

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn(`Invalid date for event ${event.id}: start=${event.start_date}, end=${event.end_date}`);
        return;
      }

      console.log(
        `Event ${event.id}: start=${startDate.toISOString()}, end=${endDate.toISOString()}, now=${nowUTC.toISOString()}`
      );

      // Prioritize active events: startDate <= now <= endDate
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
        console.warn(`Event ${event.id} not categorized: start=${startDate.toISOString()}, end=${endDate.toISOString()}`);
      }
    });

    // Update states only if there’s a change
    setUpcomingEvents((prev) => {
      const newUpcoming = JSON.stringify(updatedUpcoming) !== JSON.stringify(prev) ? updatedUpcoming : prev;
      console.log(`Upcoming events count: ${newUpcoming.length}`);
      return newUpcoming;
    });
    setActiveEvents((prev) => {
      const newActive = JSON.stringify(updatedActive) !== JSON.stringify(prev) ? updatedActive : prev;
      console.log(`Active events count: ${newActive.length}`);
      return newActive;
    });
    setPastEvents((prev) => {
      const newPast = JSON.stringify(updatedPast) !== JSON.stringify(prev) ? updatedPast : prev;
      console.log(`Past events count: ${newPast.length}`);
      return newPast;
    });
  };

  // Add a new event
  const addEvent = (newEvent) => {
    setEvents((prevEvents) => {
      const updatedEvents = [...prevEvents, { ...newEvent, id: Date.now().toString() }];
      console.log("Added event:", newEvent);
      return updatedEvents;
    });
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
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    console.log("Deleted event with id:", eventId);
  };

  // Clear all past events
  const clearPastEvents = () => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => {
        const endDate = new Date(event.end_date.endsWith("Z") ? event.end_date : `${event.end_date}Z`);
        return !isNaN(endDate.getTime()) && endDate >= new Date();
      })
    );
    console.log("Cleared past events");
  };

  // Categorize events on mount and whenever events change
  useEffect(() => {
    categorizeEvents();
  }, [events]);

  // Periodic check for time-based updates
  useEffect(() => {
    const interval = setInterval(() => {
      categorizeEvents();
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

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