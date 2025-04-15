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
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      console.warn("User not logged in");
      return {
        total: 0,
        labels: ["Ingen data"],
        values: [0],
        maxValue: 2000,
        error: "User not logged in",
      };
    }

    const response = await fetch(
      `https://apphractivity01-dqcuh0g2epgsgfeq.westeurope-01.azurewebsites.net/user-history?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const result = await response.json();
    if (!result.success) {
      console.error("Failed to fetch step history:", result.message);
      return {
        total: 0,
        labels: ["Ingen data"],
        values: [0],
        maxValue: 2000,
        error: result.message,
      };
    }

    return { ...result.data, error: null };
  } catch (error) {
    console.error("Feil ved henting av step history:", error.message);
    return {
      total: 0,
      labels: ["Ingen data"],
      values: [0],
      maxValue: 2000,
      error:
        "Kunne ikke koble til serveren. Sjekk internettforbindelsen eller prøv igjen senere.",
    };
  }
};

const fetchStreaks = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      console.warn("User not logged in");
      return { currentStreak: 0, bestStreak: 0, error: "User not logged in" };
    }

    const response = await fetch(
      `https://apphractivity01-dqcuh0g2epgsgfeq.westeurope-01.azurewebsites.net/user-history?period=day`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const result = await response.json();
    if (!result.success) {
      console.error("Failed to fetch user history:", result.message);
      return { currentStreak: 0, bestStreak: 0, error: result.message };
    }

    const currentStreak =
      result.data.values[result.data.values.length - 1] || 0;

    const historyResponse = await fetch(
      `https://apphractivity01-dqcuh0g2epgsgfeq.westeurope-01.azurewebsites.net/user-history?period=year`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const historyResult = await historyResponse.json();
    if (!historyResult.success) {
      console.error("Failed to fetch user history:", historyResult.message);
      return { currentStreak, bestStreak: 0, error: historyResult.message };
    }

    const bestStreak = Math.max(
      ...historyResult.data.values.map(() => currentStreak),
      0
    );

    return { currentStreak, bestStreak, error: null };
  } catch (error) {
    console.error("Feil ved henting av streaks:", error.message);
    return {
      currentStreak: 0,
      bestStreak: 0,
      error:
        "Kunne ikke koble til serveren. Sjekk internettforbindelsen eller prøv igjen senere.",
    };
  }
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
      const streakData = await fetchStreaks();
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
