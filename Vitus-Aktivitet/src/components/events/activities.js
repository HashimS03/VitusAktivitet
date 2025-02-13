// First, let's create a new component for predefined activities
// activities.js
export const PREDEFINED_ACTIVITIES = [
  {
    id: 1,
    name: "Planke",
    type: "duration",
    icon: "human", // MaterialCommunityIcons name
    description: "Hold plankestilling så lenge som mulig",
    defaultGoal: 60, // seconds
    unit: "sekunder",
  },
  {
    id: 2,
    name: "Push-ups",
    type: "count",
    icon: "arm-flex",
    description: "Gjør så mange push-ups som mulig",
    defaultGoal: 50,
    unit: "repetisjoner",
  },
  {
    id: 3,
    name: "Løping",
    type: "distance",
    icon: "run",
    description: "Løp den angitte distansen",
    defaultGoal: 5,
    unit: "kilometer",
  },
  // Add more activities as needed
];
