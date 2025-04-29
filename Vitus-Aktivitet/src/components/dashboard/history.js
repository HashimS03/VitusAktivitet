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
import axios from "axios";
import { SERVER_CONFIG } from "../../config/serverConfig";


// Constants
const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 40;
const chartHeight = 300;
const JWT_SECRET = process.env.JWT_SECRET || "vitus-aktivitet-secret-key-2023";

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
        const todayData = stepData.find(
          (entry) => entry.timestamp.split("T")[0] === todayString
        );
        const total = todayData ? todayData.step_count : 0;
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
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);

        const values = Array(7).fill(0);
        stepData.forEach((entry) => {
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          const diffTime = entryDate - startOfWeek;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            values[diffDays] = entry.step_count;
          }
        });

        const total = values.reduce((sum, val) => sum + val, 0);
        return {
          total,
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values,
          maxValue: Math.round(Math.max(...values, 10000)),
          average: Math.round(total / 7),
        };
      }
      case "month": {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
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
          maxValue: Math.max(...values, 10000),
          average: Math.round(total / daysInMonth),
        };
      }
      case "year": {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const monthlyTotals = Array(12).fill(0);
        yearData.forEach((entry) => {
          const monthIndex = new Date(entry.date).getMonth();
          monthlyTotals[monthIndex] += entry.steps;
        });
        const total = monthlyTotals.reduce((sum, val) => sum + val, 0);
        const values = monthlyTotals.map((total, i) =>
          daysInMonth[i] ? Math.round(total / daysInMonth[i]) : 0
        );
        return {
          total,
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          values,
          maxValue: Math.round(Math.max(...values, 10000)),
          average: Math.round(total / 365),
        };
      }
      default:
        return {
          total: 0,
          labels: ["No data"],
          values: [0],
          maxValue: 2000,
        };
    }
  } catch (error) {
    console.error("Feil ved henting av step history:", error);
    return {
      total: 0,
      labels: ["No data"],
      values: [0],
      maxValue: 2000,
    };
  }
};

const fetchStreaks = async () => {
  try {
    const storedCurrentStreak = await AsyncStorage.getItem("currentStreak");
    const storedBestStreak = await AsyncStorage.getItem("bestStreak");

    const currentStreak = storedCurrentStreak
      ? parseInt(storedCurrentStreak)
      : 0;
    const bestStreak = storedBestStreak ? parseInt(storedBestStreak) : 0;

    return { currentStreak, bestStreak };
  } catch (error) {
    console.error("Feil ved henting av streaks:", error);
    return { currentStreak: 0, bestStreak: 0 };
  }
};

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [streaks, setStreaks] = useState({ currentStreak: 0, bestStreak: 0 });
  const [totalSteps, setTotalSteps] = useState(0);
  const tooltipPosition = useRef(new Animated.ValueXY()).current;
  const { theme } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchStepHistory(selectedPeriod);
      const streakData = await fetchStreaks();
      const statsResponse = await axios.get(
        `${SERVER_CONFIG.getBaseUrl()}/user-statistics`,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setPeriodData(data);
      setStreaks(streakData);
      setTotalSteps(statsResponse.data.data.total_steps || 0);
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
            {totalSteps.toLocaleString()}
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
            Beste streak
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
