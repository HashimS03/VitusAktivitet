"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Svg, Rect, Line, Text as SvgText } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PanResponder } from "react-native";

// Constants
const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 40;
const chartHeight = 300;

const PeriodSelector = ({ selectedPeriod, onSelect, theme }) => {
  const periods = [
    { key: "day", label: "D" },
    { key: "week", label: "W" },
    { key: "month", label: "M" },
    { key: "year", label: "Y" },
  ];

  return (
    <View style={[styles.periodSelector, { backgroundColor: theme.surface }]}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && [
              styles.periodButtonActive,
              { backgroundColor: theme.primary },
            ],
          ]}
          onPress={() => onSelect(period.key)}
        >
          <Text
            style={[
              styles.periodButtonText,
              { color: theme.text },
              selectedPeriod === period.key && [
                styles.periodButtonTextActive,
                { color: theme.background },
              ],
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Chart = ({ data, period, theme }) => {
  const barWidth = period === "month" ? 6 : period === "day" ? 8 : 10;
  const totalBars = data.values.length;
  const leftPadding = 45;
  const spacing = (chartWidth - (leftPadding + 20)) / (totalBars - 1);

  const getXAxisLabels = () => {
    if (period === "month") {
      return data.labels
        .filter(
          (_, index) => index % 5 === 0 || index === data.labels.length - 1
        )
        .map((label) => ({
          value: label,
          position: (Number.parseInt(label) - 1) * spacing,
        }));
    }
    if (period === "day") {
      return [0, 6, 12, 18].map((hour) => ({
        value: hour.toString().padStart(2, "0"),
        position: (hour * spacing * 24) / data.values.length,
      }));
    }
    return data.labels.map((label, index) => ({
      value: label,
      position: index * spacing,
    }));
  };

  return (
    <View>
      <Svg width={chartWidth} height={chartHeight}>
        {[0, data.maxValue / 2, data.maxValue].map((value, index) => (
          <React.Fragment key={index}>
            <Line
              x1={leftPadding}
              y1={
                chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)
              }
              x2={chartWidth - 10}
              y2={
                chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)
              }
              stroke={theme.border}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <SvgText
              x="15"
              y={
                chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)
              }
              fill={theme.textSecondary}
              fontSize="10"
              textAnchor="start"
            >
              {value}
            </SvgText>
          </React.Fragment>
        ))}
        {data.values.map((value, index) => {
          const barHeight = (value / data.maxValue) * (chartHeight - 80);
          const x = leftPadding + index * spacing;
          const y = chartHeight - 40 - barHeight;
          return (
            <Rect
              key={index}
              x={x - barWidth / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={theme.primary}
              rx={barWidth / 2}
            />
          );
        })}
        {getXAxisLabels().map((label, index) => (
          <SvgText
            key={index}
            x={leftPadding + label.position}
            y={chartHeight - 10}
            fill={theme.textSecondary}
            fontSize="10"
            textAnchor="middle"
          >
            {label.value}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

const Tooltip = ({ value, label, position, period, theme }) => (
  <Animated.View
    style={[
      styles.tooltip,
      {
        transform: [{ translateX: position.x }, { translateY: position.y }],
        backgroundColor: theme.primary,
      },
    ]}
  >
    <Text style={[styles.tooltipTime, { color: theme.background }]}>
      {label}
    </Text>
    <Text style={[styles.tooltipValue, { color: theme.background }]}>
      {period === "year" ? `${value} avg/mnd` : value}
    </Text>
  </Animated.View>
);

const fetchStepHistory = async (period) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const stepKeys = allKeys.filter((key) => key.startsWith("stepHistory_"));
    const stepData = await AsyncStorage.multiGet(stepKeys);

    const stepsByDate = stepData.map(([key, value]) => ({
      date: key.replace("stepHistory_", ""),
      steps: JSON.parse(value) || 0,
    }));

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    switch (period) {
      case "day": {
        const todayData = stepsByDate.find(
          (entry) => entry.date === todayString
        );
        const total = todayData ? todayData.steps : 0;
        const hourlySteps = Array(24).fill(0);
        if (todayData) {
          const currentHour = today.getHours();
          hourlySteps[currentHour] = total;
        }
        return {
          total,
          labels: Array.from({ length: 24 }, (_, i) => `${i}`.padStart(2, "0")),
          values: hourlySteps,
          maxValue: Math.max(total, 2000),
        };
      }
      case "week": {
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        const weekData = stepsByDate.filter(
          (entry) => new Date(entry.date) >= startOfWeek
        );
        const values = Array(7).fill(0);
        weekData.forEach((entry) => {
          const dayIndex = new Date(entry.date).getDay();
          values[dayIndex] = (values[dayIndex] || 0) + entry.steps;
        });
        const total = values.reduce((sum, val) => sum + val, 0);
        return {
          total,
          labels: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
          values,
          maxValue: Math.max(...values, 3000),
          average: total / 7,
        };
      }
      case "month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthData = stepsByDate.filter(
          (entry) => new Date(entry.date) >= startOfMonth
        );
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate();
        const values = Array(daysInMonth).fill(0);
        monthData.forEach((entry) => {
          const dayIndex = new Date(entry.date).getDate() - 1;
          values[dayIndex] = (values[dayIndex] || 0) + entry.steps;
        });
        const total = values.reduce((sum, val) => sum + val, 0);
        return {
          total,
          labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
          values,
          maxValue: Math.max(...values, 4000),
          average: total / daysInMonth,
        };
      }
      case "year": {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const yearData = stepsByDate.filter(
          (entry) => new Date(entry.date) >= startOfYear
        );
        const monthlyTotals = Array(12).fill(0);
        yearData.forEach((entry) => {
          const monthIndex = new Date(entry.date).getMonth();
          monthlyTotals[monthIndex] += entry.steps;
        });
        const total = monthlyTotals.reduce((sum, val) => sum + val, 0);
        const dailyAverage = total / 365;
        return {
          total,
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "Mai",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Okt",
            "Nov",
            "Des",
          ],
          values: monthlyTotals.map((val) => Math.round(val / 30)),
          maxValue: Math.round(
            Math.max(...monthlyTotals.map((val) => val / 30), 400)
          ),
          average: Math.round(dailyAverage),
        };
      }
      default:
        return {
          total: 0,
          labels: [],
          values: [],
          maxValue: 2000,
        };
    }
  } catch (error) {
    console.error("Feil ved henting av step history:", error);
    return {
      total: 0,
      labels: ["Ingen data"],
      values: [0],
      maxValue: 2000,
    };
  }
};

const calculateStreaks = async () => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const allKeys = await AsyncStorage.getAllKeys();
  const stepKeys = allKeys.filter((key) => key.startsWith("stepHistory_"));
  const stepData = await AsyncStorage.multiGet(stepKeys);
  const dailyGoal = JSON.parse(await AsyncStorage.getItem("dailyGoal")) || 7500;

  const stepsByDate = stepData
    .map(([key, value]) => ({
      date: key.replace("stepHistory_", ""),
      steps: JSON.parse(value) || 0,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let currentStreak = 0;
  let bestStreak = 0;
  let lastDate = null;

  const storedStreak = await AsyncStorage.getItem("currentStreak");
  const storedLastDate = await AsyncStorage.getItem("lastCompletionDate");
  const storedBestStreak = await AsyncStorage.getItem("bestStreak");

  currentStreak = storedStreak ? parseInt(storedStreak) : 0;
  bestStreak = storedBestStreak ? parseInt(storedBestStreak) : 0;
  lastDate = storedLastDate ? new Date(storedLastDate) : null;

  for (let i = 0; i < stepsByDate.length; i++) {
    const { date, steps } = stepsByDate[i];
    const currentDate = new Date(date);
    const isGoalMet = steps >= dailyGoal;

    if (lastDate) {
      const diffTime = currentDate - lastDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1 && isGoalMet) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = isGoalMet ? 1 : 0;
      }
    } else if (isGoalMet) {
      currentStreak = 1;
    }

    if (isGoalMet) {
      lastDate = currentDate;
    }

    bestStreak = Math.max(bestStreak, currentStreak);
  }

  const todayData = stepsByDate.find((entry) => entry.date === todayString);
  const todaySteps = todayData ? todayData.steps : 0;

  if (lastDate) {
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1 && todaySteps >= dailyGoal) {
      currentStreak += 1;
      lastDate = today;
    } else if (diffDays > 1) {
      currentStreak = todaySteps >= dailyGoal ? 1 : 0;
      lastDate = todaySteps >= dailyGoal ? today : null;
    }
  } else if (todaySteps >= dailyGoal) {
    currentStreak = 1;
    lastDate = today;
  }

  await AsyncStorage.setItem("currentStreak", currentStreak.toString());
  await AsyncStorage.setItem("bestStreak", bestStreak.toString());
  if (lastDate) {
    await AsyncStorage.setItem(
      "lastCompletionDate",
      lastDate.toISOString().split("T")[0]
    );
  }

  return { currentStreak, bestStreak };
};

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [streaks, setStreaks] = useState({ currentStreak: 0, bestStreak: 0 });
  const tooltipPosition = useRef(new Animated.ValueXY()).current;
  const { theme } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStepHistory(selectedPeriod);
      const streakData = await calculateStreaks();
      setPeriodData(data);
      setStreaks(streakData);
    };
    loadData();
  }, [selectedPeriod]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (!periodData) return;
        const { moveX, moveY } = gestureState;
        const chartX = moveX - 20;
        const chartY = moveY - 100;
        const spacing = (chartWidth - 65) / (periodData.values.length - 1);
        const index = Math.round((chartX - 45) / spacing);

        if (index >= 0 && index < periodData.values.length) {
          const value = periodData.values[index];
          let label;
          switch (selectedPeriod) {
            case "day":
              label = `${index.toString().padStart(2, "0")}:00`;
              break;
            case "week":
              label = periodData.labels[index];
              break;
            case "month":
              label = `Dag ${index + 1}`;
              break;
            case "year":
              label = periodData.labels[index];
              break;
          }

          setTooltipData({ value, label });
          setTooltipVisible(true);

          Animated.spring(tooltipPosition, {
            toValue: {
              x: 45 + index * spacing - 50,
              y:
                chartHeight -
                40 -
                (value / periodData.maxValue) * (chartHeight - 80) -
                70,
            },
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderRelease: () => {
        setTooltipVisible(false);
      },
    })
  ).current;

  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const getMainStats = () => {
    if (!periodData) return null;
    switch (selectedPeriod) {
      case "day":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              TOTAL
            </Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              {periodData.total}
            </Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>Today</Text>
          </View>
        );
      case "week":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              DAGLIG GJENNOMSNITT
            </Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              {Math.round(periodData.average)}
            </Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>
              Denne uken
            </Text>
          </View>
        );
      case "month":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              DAGLIG GJENNOMSNITT
            </Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              {Math.round(periodData.average)}
            </Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>
              {currentMonth} {currentYear}
            </Text>
          </View>
        );
      case "year":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              DAGLIG GJENNOMSNITT
            </Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              {Math.round(periodData.average)}
            </Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>
              {currentYear}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (!periodData) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onSelect={setSelectedPeriod}
        theme={theme}
      />
      {getMainStats()}
      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <Chart data={periodData} period={selectedPeriod} theme={theme} />
        {tooltipVisible && tooltipData && (
          <Tooltip
            value={tooltipData.value}
            label={tooltipData.label}
            position={tooltipPosition}
            period={selectedPeriod}
            theme={theme}
          />
        )}
      </View>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="walk" size={20} color={theme.primary} />
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {periodData.total}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.text }]}>
            Totale skritt
          </Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="fire" size={20} color={theme.primary} />
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {streaks.bestStreak}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.text }]}>
            Best streak
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  periodSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 20,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 16,
  },
  periodButtonActive: {
    backgroundColor: "#50C3AA",
  },
  periodButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  statsContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  totalLabel: {
    fontSize: 12,
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 42,
    fontWeight: "bold",
    marginVertical: 5,
  },
  totalTime: {
    fontSize: 16,
  },
  chartContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  tooltip: {
    position: "absolute",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 80,
  },
  tooltipTime: {
    fontSize: 12,
    opacity: 0.8,
  },
  tooltipValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  summaryLabel: {
    fontSize: 12,
  },
});

export default HistoryScreen;