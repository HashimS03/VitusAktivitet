import { Dimensions } from 'react-native';

export const DASHBOARD_CONSTANTS = {
  SCREEN_WIDTH: Dimensions.get("window").width,
  SCREEN_HEIGHT: Dimensions.get("window").height,
  DAILY_STEP_GOAL: 7500,
  PROGRESS_RING_SIZE: 300,
  PROGRESS_RING_THICKNESS: 30,
  TOTAL_TUTORIAL_STEPS: 8,
  
  // Trophy related constants
  TROPHY_LEVELS: {
    STEP_MASTER: {
      BRONZE: 5000,
      SILVER: 10000,
      GOLD: 15000
    },
    STEP_TITAN: {
      BRONZE: 50000,
      SILVER: 100000,
      GOLD: 250000
    },
    STREAK: {
      BRONZE: 5,
      SILVER: 10,
      GOLD: 15
    },
    EVENT_ENTHUSIAST: {
      BRONZE: 1,
      SILVER: 5,
      GOLD: 10
    },
    EVENT_CHAMPION: {
      BRONZE: 1,
      SILVER: 3,
      GOLD: 5
    },
    LEADERBOARD_LEGEND: {
      BRONZE: 10,
      SILVER: 5,
      GOLD: 1
    }
  }
};