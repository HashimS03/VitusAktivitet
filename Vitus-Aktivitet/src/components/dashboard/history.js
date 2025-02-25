"use client"

import React, { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StatusBar,
  Dimensions,
  PanResponder,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { Svg, Rect, Line, Text as SvgText } from "react-native-svg"
import { useTheme } from "../context/ThemeContext"

const screenWidth = Dimensions.get("window").width
const chartWidth = screenWidth - 40
const chartHeight = 300

// Updated sample data
const sampleData = {
  day: {
    total: 2577,
    labels: ["00", "06", "12", "18"],
    values: [
      1500, 1701, 811, 101, 701, 800, 343, 800, 1701, 800, 540, 171, 800, 1104, 303, 501, 131, 1500, 1100, 234, 800,
      1701, 1701, 800,
    ],
    maxValue: 2000,
  },
  week: {
    total: 15678,
    labels: ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
    values: [2500, 1800, 2300, 2100, 2800, 1900, 2278],
    maxValue: 3000,
    average: 15678 / 7, // Gjennomsnittlig antall skritt per dag i uken
  },
  month: {
    total: 89432,
    labels: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
    values: Array.from({ length: 31 }, () => Math.floor(Math.random() * 3000) + 1000),
    maxValue: 4000,
    average: 89432 / 31, // Gjennomsnittlig antall skritt per dag i måneden
  },
  year: {
    total: 258903,
    labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"],
    values: [8500, 7800, 9300, 8100, 9800, 11900, 10278, 9500, 8800, 9300, 8100, 7800].map((val) =>
      Math.round(val / 32),
    ), // Gjennomsnittlig antall skritt per måned i året
    maxValue: 400,
    average: 258903 / 12, // Gjennomsnittlig antall skritt per måned i året
  },
}

const PeriodSelector = ({ selectedPeriod, onSelect, theme }) => {
  const periods = [
    { key: "day", label: "D" },
    { key: "week", label: "W" },
    { key: "month", label: "M" },
    { key: "year", label: "Y" },
  ]

  return (
    <View style={[styles.periodSelector, { backgroundColor: theme.surface }]}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && [styles.periodButtonActive, { backgroundColor: theme.primary }],
          ]}
          onPress={() => onSelect(period.key)}
        >
          <Text
            style={[
              styles.periodButtonText,
              { color: theme.text },
              selectedPeriod === period.key && [styles.periodButtonTextActive, { color: theme.background }],
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const Chart = ({ data, period, theme }) => {
  const barWidth = period === "month" ? 6 : period === "day" ? 8 : 10
  const totalBars = data.values.length
  const leftPadding = 45 // Increased left padding for y-axis labels
  const spacing = (chartWidth - (leftPadding + 20)) / (totalBars - 1)

  const getXAxisLabels = () => {
    if (period === "month") {
      return data.labels
        .filter((_, index) => index % 5 === 0 || index === data.labels.length - 1)
        .map((label) => ({
          value: label,
          position: (Number.parseInt(label) - 1) * spacing,
        }))
    }

    if (period === "day") {
      return [0, 6, 12, 18].map((hour) => ({
        value: hour.toString().padStart(2, "0"),
        position: (hour * spacing * 24) / data.values.length,
      }))
    }

    return data.labels.map((label, index) => ({
      value: label,
      position: index * spacing,
    }))
  }

  return (
    <View>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Vertical grid lines for monthly view */}
        {period === "month" &&
          data.labels
            .filter((_, index) => index % 5 === 0)
            .map((_, index) => (
              <Line
                key={`grid-${index}`}
                x1={leftPadding + index * 5 * spacing}
                y1={20}
                x2={leftPadding + index * 5 * spacing}
                y2={chartHeight - 30}
                stroke="#EEEEEE"
                strokeWidth="1"
              />
            ))}

        {/* Horizontal grid lines */}
        {[0, data.maxValue / 2, data.maxValue].map((value, index) => (
          <React.Fragment key={index}>
            <Line
              x1={leftPadding}
              y1={chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)}
              x2={chartWidth - 10}
              y2={chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)}
              stroke={theme.border}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <SvgText
              x="15"
              y={chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)}
              fill={theme.textSecondary}
              fontSize="10"
              textAnchor="start"
            >
              {value}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Bars */}
        {data.values.map((value, index) => {
          const barHeight = (value / data.maxValue) * (chartHeight - 80)
          const x = leftPadding + index * spacing
          const y = chartHeight - 40 - barHeight

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
          )
        })}

        {/* X-axis labels */}
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
  )
}

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
    <Text style={[styles.tooltipTime, { color: theme.background }]}>{label}</Text>
    <Text style={[styles.tooltipValue, { color: theme.background }]}>
      {period === "year" ? `${value} avg/mnd` : value}
    </Text>
  </Animated.View>
)

const HistoryScreen = () => {
  const navigation = useNavigation()
  const [selectedPeriod, setSelectedPeriod] = useState("day")
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipData, setTooltipData] = useState(null)
  const tooltipPosition = useRef(new Animated.ValueXY()).current
  const { theme } = useTheme()

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { moveX, moveY } = gestureState
        const chartX = moveX - 20 // Juster for padding og marginer
        const chartY = moveY - 100 // Juster for header og andre elementer

        // Finn hvilken søyle som er nærmest touch-posisjonen
        const spacing = (chartWidth - 65) / (sampleData[selectedPeriod].values.length - 1)
        const index = Math.round((chartX - 45) / spacing)

        if (index >= 0 && index < sampleData[selectedPeriod].values.length) {
          const value = sampleData[selectedPeriod].values[index]
          let label
          switch (selectedPeriod) {
            case "day":
              label = `${index.toString().padStart(2, "0")}:00`
              break
            case "week":
              label = sampleData.week.labels[index]
              break
            case "month":
              label = `Dag ${index + 1}`
              break
            case "year":
              label = sampleData.year.labels[index]
              break
          }

          setTooltipData({ value, label })
          setTooltipVisible(true)

          Animated.spring(tooltipPosition, {
            toValue: {
              x: 45 + index * spacing - 50,
              y: chartHeight - 40 - (value / sampleData[selectedPeriod].maxValue) * (chartHeight - 80) - 70,
            },
            useNativeDriver: true,
          }).start()
        }
      },
      onPanResponderRelease: () => {
        setTooltipVisible(false)
      },
    }),
  ).current

  // Hent dagens dato for månedlig og årlig visning
  const today = new Date()
  const currentMonth = today.toLocaleString("default", { month: "long" })
  const currentYear = today.getFullYear()

  const getMainStats = () => {
    switch (selectedPeriod) {
      case "day":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>TOTAL</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{sampleData.day.total}</Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>Today</Text>
          </View>
        )
      case "week":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>DAGLIG GJENNOMSNITT</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{Math.round(sampleData.week.average)}</Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>Denne uken</Text>
          </View>
        )
      case "month":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>DAGLIG GJENNOMSNITT</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{Math.round(sampleData.month.average)}</Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>
              {currentMonth} {currentYear}
            </Text>
          </View>
        )
      case "year":
        return (
          <View style={styles.statsContainer}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>DAGLIG GJENNOMSNITT</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>{Math.round(sampleData.year.average)}</Text>
            <Text style={[styles.totalTime, { color: theme.text }]}>{currentYear}</Text>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Historie</Text>
      </View>

      {/* Period Selector */}
      <PeriodSelector selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} theme={theme} />

      {/* Main Stats */}
      {getMainStats()}

      {/* Chart */}
      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <Chart data={sampleData[selectedPeriod]} period={selectedPeriod} theme={theme} />
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

      {/* Stats Summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="walk" size={20} color={theme.primary} />
          <Text style={[styles.summaryValue, { color: theme.text }]}>258 903</Text>
          <Text style={[styles.summaryLabel, { color: theme.text }]}>Totale skritt</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="fire" size={20} color={theme.primary} />
          <Text style={[styles.summaryValue, { color: theme.text }]}>25</Text>
          <Text style={[styles.summaryLabel, { color: theme.text }]}>Best streak</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

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
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginLeft: 10,
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
})

export default HistoryScreen

