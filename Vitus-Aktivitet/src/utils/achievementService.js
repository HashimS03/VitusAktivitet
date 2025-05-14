import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

// Sync achievements with server based on your database schema
export const syncAchievements = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return false;
    
    // For each trophy type, create a database record
    const trophyTypes = [
      "Skritt Mester", "Elsker hendelser", "Streak", 
      "Hendleses Konge", "Ledertavle Legende", "Skritt Titan", 
      "Personverns Detektiv"
    ];
    
    // Get all metrics
    const stepCount = parseInt(await AsyncStorage.getItem("stepCount") || "0", 10);
    const currentStreak = parseInt(await AsyncStorage.getItem("currentStreak") || "0", 10);
    const totalSteps = parseInt(await AsyncStorage.getItem("totalSteps") || "0", 10);
    const participatedEvents = JSON.parse(await AsyncStorage.getItem("participatedEvents") || "[]");
    const completedEvents = JSON.parse(await AsyncStorage.getItem("completedEvents") || "[]");
    const leaderboardRank = parseInt(await AsyncStorage.getItem("leaderboardRank") || "999", 10);
    const privacyExplored = await AsyncStorage.getItem("privacyExplored") === "true";
    
    // Calculate trophy levels based on metrics
    const trophyLevels = {};
    
    // Skritt Mester
    if (stepCount >= 15000) trophyLevels["Skritt Mester"] = 3;
    else if (stepCount >= 10000) trophyLevels["Skritt Mester"] = 2;
    else if (stepCount >= 5000) trophyLevels["Skritt Mester"] = 1;
    else trophyLevels["Skritt Mester"] = 0;
    
    // Elsker hendelser
    if (participatedEvents.length >= 10) trophyLevels["Elsker hendelser"] = 3;
    else if (participatedEvents.length >= 5) trophyLevels["Elsker hendelser"] = 2;
    else if (participatedEvents.length >= 1) trophyLevels["Elsker hendelser"] = 1;
    else trophyLevels["Elsker hendelser"] = 0;
    
    // Streak
    if (currentStreak >= 15) trophyLevels["Streak"] = 3;
    else if (currentStreak >= 10) trophyLevels["Streak"] = 2;
    else if (currentStreak >= 5) trophyLevels["Streak"] = 1;
    else trophyLevels["Streak"] = 0;
    
    // Hendleses Konge
    if (completedEvents.length >= 5) trophyLevels["Hendleses Konge"] = 3;
    else if (completedEvents.length >= 3) trophyLevels["Hendleses Konge"] = 2;
    else if (completedEvents.length >= 1) trophyLevels["Hendleses Konge"] = 1;
    else trophyLevels["Hendleses Konge"] = 0;
    
    // Ledertavle Legende
    if (leaderboardRank <= 1) trophyLevels["Ledertavle Legende"] = 3;
    else if (leaderboardRank <= 5) trophyLevels["Ledertavle Legende"] = 2;
    else if (leaderboardRank <= 10) trophyLevels["Ledertavle Legende"] = 1;
    else trophyLevels["Ledertavle Legende"] = 0;
    
    // Skritt Titan
    if (totalSteps >= 250000) trophyLevels["Skritt Titan"] = 3;
    else if (totalSteps >= 100000) trophyLevels["Skritt Titan"] = 2;
    else if (totalSteps >= 50000) trophyLevels["Skritt Titan"] = 1;
    else trophyLevels["Skritt Titan"] = 0;
    
    // Personverns Detektiv
    if (privacyExplored) trophyLevels["Personverns Detektiv"] = 1;
    else trophyLevels["Personverns Detektiv"] = 0;
    
    // Get progress points for each trophy
    const trophyPoints = {
      "Skritt Mester": stepCount,
      "Elsker hendelser": participatedEvents.length,
      "Streak": currentStreak,
      "Hendleses Konge": completedEvents.length,
      "Ledertavle Legende": leaderboardRank,
      "Skritt Titan": totalSteps,
      "Personverns Detektiv": privacyExplored ? 1 : 0
    };
    
    // Sync each trophy with the server
    for (const trophy of trophyTypes) {
      await apiClient.post("/user/achievement", {
        userId: userId,
        title: trophy,
        trophy_level: trophyLevels[trophy],
        poeng: trophyPoints[trophy],
        status: trophyLevels[trophy] > 0 ? 1 : 0,
        description: `Level ${trophyLevels[trophy]} achieved`
      });
    }
    
    console.log("✅ Achievements synced with server");
    return true;
  } catch (error) {
    console.error("❌ Error syncing achievements:", error);
    return false;
  }
};

// Fetch achievements from server
export const fetchServerAchievements = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return null;
    
    const response = await apiClient.get(`/user/${userId}/achievements`);
    
    if (response.data && response.data.success) {
      const achievements = response.data.achievements;
      
      // Extract metrics from achievements
      let stepCount = 0;
      let currentStreak = 0;
      let totalSteps = 0;
      let participatedEvents = [];
      let completedEvents = [];
      let leaderboardRank = 999;
      let privacyExplored = false;
      
      for (const achievement of achievements) {
        switch (achievement.title) {
          case "Skritt Mester":
            stepCount = achievement.poeng;
            break;
          case "Elsker hendelser":
            if (achievement.poeng > 0) {
              participatedEvents = Array.from({ length: achievement.poeng }, (_, i) => i + 1);
            }
            break;
          case "Streak":
            currentStreak = achievement.poeng;
            break;
          case "Hendleses Konge":
            if (achievement.poeng > 0) {
              completedEvents = Array.from({ length: achievement.poeng }, (_, i) => i + 1);
            }
            break;
          case "Ledertavle Legende":
            leaderboardRank = achievement.poeng;
            break;
          case "Skritt Titan":
            totalSteps = achievement.poeng;
            break;
          case "Personverns Detektiv":
            privacyExplored = achievement.poeng > 0;
            break;
        }
      }
      
      // Update local storage
      await AsyncStorage.setItem("stepCount", String(stepCount));
      await AsyncStorage.setItem("currentStreak", String(currentStreak));
      await AsyncStorage.setItem("totalSteps", String(totalSteps));
      await AsyncStorage.setItem("participatedEvents", JSON.stringify(participatedEvents));
      await AsyncStorage.setItem("completedEvents", JSON.stringify(completedEvents));
      await AsyncStorage.setItem("leaderboardRank", String(leaderboardRank));
      await AsyncStorage.setItem("privacyExplored", privacyExplored ? "true" : "false");
      
      console.log("✅ Loaded achievements from server");
      return {
        stepCount,
        currentStreak,
        totalSteps,
        participatedEvents,
        completedEvents,
        leaderboardRank,
        privacyExplored
      };
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching server achievements:", error);
    return null;
  }
};

// Update a specific achievement type
export const updateAchievement = async (type, value) => {
  try {
    let updated = false;
    
    switch(type) {
      case 'steps':
        await AsyncStorage.setItem("stepCount", String(value));
        updated = true;
        break;
      case 'streak':
        await AsyncStorage.setItem("currentStreak", String(value));
        updated = true;
        break;
      case 'participateEvent': {
        let events = JSON.parse(await AsyncStorage.getItem("participatedEvents") || "[]");
        if (!events.includes(value)) {
          events.push(value);
          await AsyncStorage.setItem("participatedEvents", JSON.stringify(events));
          updated = true;
        }
        break;
      }
      case 'completeEvent': {
        let events = JSON.parse(await AsyncStorage.getItem("completedEvents") || "[]");
        if (!events.includes(value)) {
          events.push(value);
          await AsyncStorage.setItem("completedEvents", JSON.stringify(events));
          updated = true;
        }
        break;
      }
      case 'leaderboardRank':
        await AsyncStorage.setItem("leaderboardRank", String(value));
        updated = true;
        break;
      case 'totalSteps':
        await AsyncStorage.setItem("totalSteps", String(value));
        updated = true;
        break;
      case 'privacyExplored':
        await AsyncStorage.setItem("privacyExplored", "true");
        updated = true;
        break;
    }
    
    // Sync with server if updated
    if (updated) {
      await syncAchievements();
    }
    
    return updated;
  } catch (error) {
    console.error("Error updating achievement:", error);
    return false;
  }
};