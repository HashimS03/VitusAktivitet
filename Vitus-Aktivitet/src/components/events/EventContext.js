import React, { createContext, useState } from "react";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [activeEvents, setActiveEvents] = useState([]);

  const addEvent = (newEvent) => {
    setActiveEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <EventContext.Provider value={{ activeEvents, addEvent }}>
      {children}
    </EventContext.Provider>
  );
};
