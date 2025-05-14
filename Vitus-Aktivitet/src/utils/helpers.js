import AsyncStorage from "@react-native-async-storage/async-storage";

// Update streaks based on step count
export const updateStreaks = async (stepCount, dailyGoal, isNewDayReset = false) => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const storedLastDate = await AsyncStorage.getItem("lastCompletionDate");
  const storedStreak = parseInt((await AsyncStorage.getItem("currentStreak")) || "0", 10);
  const storedBestStreak = parseInt((await AsyncStorage.getItem("bestStreak")) || "0", 10);

  let currentStreak = storedStreak;
  let lastCompletionDate = storedLastDate || null;

  const hasReachedGoal = stepCount >= dailyGoal;

  if (isNewDayReset && lastCompletionDate && lastCompletionDate !== todayString) {
    const lastDate = new Date(lastCompletionDate);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) currentStreak = 0;
  } else if (hasReachedGoal && lastCompletionDate !== todayString) {
    const diffDays = lastCompletionDate
      ? Math.floor((today - new Date(lastCompletionDate)) / (1000 * 60 * 60 * 24))
      : null;
    
    if (!lastCompletionDate || diffDays === 1) currentStreak += 1;
    else if (diffDays > 1) currentStreak = 1;
    
    lastCompletionDate = todayString;
  }

  const bestStreak = Math.max(currentStreak, storedBestStreak);

  await AsyncStorage.setItem("currentStreak", currentStreak.toString());
  await AsyncStorage.setItem("bestStreak", bestStreak.toString());
  
  if (lastCompletionDate) {
    await AsyncStorage.setItem("lastCompletionDate", lastCompletionDate);
  }

  return { currentStreak, bestStreak };
};

// Queue a request for later processing
export const queueRequest = async (method, url, data) => {
  const queue = JSON.parse(await AsyncStorage.getItem("requestQueue") || "[]");
  queue.push({ method, url, data, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem("requestQueue", JSON.stringify(queue));
};