import React, { createContext, useState } from "react";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [activeEvents, setActiveEvents] = useState([]);

  const addEvent = (newEvent) => {
    setActiveEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  const updateEvent = (updatedEvent) => {
    setActiveEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const deleteEvent = (eventId) => {
    setActiveEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    );
  };

  return (
    <EventContext.Provider value={{ activeEvents, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
};