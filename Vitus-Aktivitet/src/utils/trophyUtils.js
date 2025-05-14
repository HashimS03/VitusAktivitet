import { DASHBOARD_CONSTANTS } from '../constants/dashboard';

/**
 * Calculate trophy level and progress based on user metrics
 * @param {Object} trophy - The trophy data object
 * @param {Object} metrics - User metrics
 * @returns {Object} Trophy level info
 */
export const calculateTrophyProgress = (trophy, metrics) => {
  const { 
    stepCount = 0, 
    currentStreak = 0, 
    totalSteps = 0, 
    participatedEvents = [], 
    completedEvents = [], 
    leaderboardRank = 999, 
    privacyExplored = false 
  } = metrics;
  
  let level = 0;
  let currentProgress = 0;
  let nextGoal = trophy?.levels?.[0]?.goal || 0;
  const TROPHY = DASHBOARD_CONSTANTS.TROPHY_LEVELS;

  switch (trophy.name) {
    case "Step Master":
    case "Skritt Mester":
      currentProgress = stepCount;
      if (stepCount >= TROPHY.STEP_MASTER.GOLD) {
        level = 3;
        nextGoal = TROPHY.STEP_MASTER.GOLD;
      } else if (stepCount >= TROPHY.STEP_MASTER.SILVER) {
        level = 2;
        nextGoal = TROPHY.STEP_MASTER.GOLD;
      } else if (stepCount >= TROPHY.STEP_MASTER.BRONZE) {
        level = 1;
        nextGoal = TROPHY.STEP_MASTER.SILVER;
      } else {
        nextGoal = TROPHY.STEP_MASTER.BRONZE;
      }
      break;
      
    case "Event Enthusiast":
    case "Elsker hendelser":
      currentProgress = participatedEvents.length;
      if (participatedEvents.length >= TROPHY.EVENT_ENTHUSIAST.GOLD) {
        level = 3;
        nextGoal = TROPHY.EVENT_ENTHUSIAST.GOLD;
      } else if (participatedEvents.length >= TROPHY.EVENT_ENTHUSIAST.SILVER) {
        level = 2;
        nextGoal = TROPHY.EVENT_ENTHUSIAST.GOLD;
      } else if (participatedEvents.length >= TROPHY.EVENT_ENTHUSIAST.BRONZE) {
        level = 1;
        nextGoal = TROPHY.EVENT_ENTHUSIAST.SILVER;
      } else {
        nextGoal = TROPHY.EVENT_ENTHUSIAST.BRONZE;
      }
      break;
      
    case "Streak":
    case "Streak Star":
      currentProgress = currentStreak;
      if (currentStreak >= TROPHY.STREAK.GOLD) {
        level = 3;
        nextGoal = TROPHY.STREAK.GOLD;
      } else if (currentStreak >= TROPHY.STREAK.SILVER) {
        level = 2;
        nextGoal = TROPHY.STREAK.GOLD;
      } else if (currentStreak >= TROPHY.STREAK.BRONZE) {
        level = 1;
        nextGoal = TROPHY.STREAK.SILVER;
      } else {
        nextGoal = TROPHY.STREAK.BRONZE;
      }
      break;
      
    case "Event Champion":
    case "Hendleses Konge":
      currentProgress = completedEvents.length;
      if (completedEvents.length >= TROPHY.EVENT_CHAMPION.GOLD) {
        level = 3;
        nextGoal = TROPHY.EVENT_CHAMPION.GOLD;
      } else if (completedEvents.length >= TROPHY.EVENT_CHAMPION.SILVER) {
        level = 2;
        nextGoal = TROPHY.EVENT_CHAMPION.GOLD;
      } else if (completedEvents.length >= TROPHY.EVENT_CHAMPION.BRONZE) {
        level = 1;
        nextGoal = TROPHY.EVENT_CHAMPION.SILVER;
      } else {
        nextGoal = TROPHY.EVENT_CHAMPION.BRONZE;
      }
      break;
      
    case "Leaderboard Legend":
    case "Ledertavle Legende":
      currentProgress = Math.min(leaderboardRank, 10);
      if (leaderboardRank <= TROPHY.LEADERBOARD_LEGEND.GOLD) {
        level = 3;
        nextGoal = TROPHY.LEADERBOARD_LEGEND.GOLD;
      } else if (leaderboardRank <= TROPHY.LEADERBOARD_LEGEND.SILVER) {
        level = 2;
        nextGoal = TROPHY.LEADERBOARD_LEGEND.GOLD;
      } else if (leaderboardRank <= TROPHY.LEADERBOARD_LEGEND.BRONZE) {
        level = 1;
        nextGoal = TROPHY.LEADERBOARD_LEGEND.SILVER;
      } else {
        nextGoal = TROPHY.LEADERBOARD_LEGEND.BRONZE;
      }
      break;
      
    case "Step Titan":
    case "Skritt Titan":
      currentProgress = totalSteps;
      if (totalSteps >= TROPHY.STEP_TITAN.GOLD) {
        level = 3;
        nextGoal = TROPHY.STEP_TITAN.GOLD;
      } else if (totalSteps >= TROPHY.STEP_TITAN.SILVER) {
        level = 2;
        nextGoal = TROPHY.STEP_TITAN.GOLD;
      } else if (totalSteps >= TROPHY.STEP_TITAN.BRONZE) {
        level = 1;
        nextGoal = TROPHY.STEP_TITAN.SILVER;
      } else {
        nextGoal = TROPHY.STEP_TITAN.BRONZE;
      }
      break;
      
    case "Privacy Sleuth":
    case "Personverns Detektiv":
      currentProgress = privacyExplored ? 1 : 0;
      level = privacyExplored ? 1 : 0;
      nextGoal = 1;
      break;
  }
  
  return { level, currentProgress, nextGoal };
};

/**
 * Get the appropriate trophy color based on level
 * @param {Number} level - Trophy level (0-3)
 * @param {String} trophyName - Name of trophy
 * @param {Object} theme - Current theme
 * @returns {String} Color code
 */
export const getTrophyColor = (level, trophyName, theme) => {
  if (level === 0) return theme.textSecondary;
  if (level === 1 && trophyName !== "Privacy Sleuth" && trophyName !== "Personverns Detektiv") return "#CD7F32"; // Bronze
  if (level === 2) return "#C0C0C0"; // Silver
  return "#FFD700"; // Gold
};