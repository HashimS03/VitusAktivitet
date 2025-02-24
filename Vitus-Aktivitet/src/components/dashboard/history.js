import React, { useState, useRef } from "react";
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Svg, Rect, Line, Text as SvgText } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 40;
const chartHeight = 300;

// Updated sample data
const sampleData = {
  day: {
    total: 2577,
    labels: ["00", "06", "12", "18"],
    values: [
      1500, 1701, 811, 101, 701, 800, 343, 800, 1701, 800, 540, 171, 800, 1104,
      303, 501, 131, 1500, 1100, 234, 800, 1701, 1701, 800,
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
    values: Array.from(
      { length: 31 },
      () => Math.floor(Math.random() * 3000) + 1000
    ),
    maxValue: 4000,
    average: 89432 / 31, // Gjennomsnittlig antall skritt per dag i måneden
  },
  year: {
    total: 258903,
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
    values: [
      8500, 7800, 9300, 8100, 9800, 11900, 10278, 9500, 8800, 9300, 8100, 7800,
    ].map((val) => Math.round(val / 32)), // Gjennomsnittlig antall skritt per måned i året
    maxValue: 400,
    average: 258903 / 12, // Gjennomsnittlig antall skritt per måned i året
  },
};

const PeriodSelector = ({ selectedPeriod, onSelect }) => {
  const periods = [
    { key: "day", label: "D" },
    { key: "week", label: "W" },
    { key: "month", label: "M" },
    { key: "year", label: "Y" },
  ];

  return (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive,
          ]}
          onPress={() => onSelect(period.key)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Chart = ({ data, period }) => {
  const barWidth = period === "month" ? 6 : period === "day" ? 8 : 10;
  const totalBars = data.values.length;
  const leftPadding = 45; // Increased left padding for y-axis labels
  const spacing = (chartWidth - (leftPadding + 20)) / (totalBars - 1);

  const getXAxisLabels = () => {
    if (period === "month") {
      return data.labels
        .filter(
          (_, index) => index % 5 === 0 || index === data.labels.length - 1
        )
        .map((label) => ({
          value: label,
          position: (parseInt(label) - 1) * spacing,
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
              y1={
                chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)
              }
              x2={chartWidth - 10}
              y2={
                chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)
              }
              stroke="#333333"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <SvgText
              x="15"
              y={
                chartHeight - 40 - (value / data.maxValue) * (chartHeight - 80)
              }
              fill="#666666"
              fontSize="10"
              textAnchor="start"
            >
              {value}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Bars */}
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
              fill="#50C3AA"
              rx={barWidth / 2}
            />
          );
        })}

        {/* X-axis labels */}
        {getXAxisLabels().map((label, index) => (
          <SvgText
            key={index}
            x={leftPadding + label.position}
            y={chartHeight - 10}
            fill="#666666"
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

const Tooltip = ({ value, label, position, period }) => (
  <Animated.View
    style={[
      styles.tooltip,
      {
        transform: [{ translateX: position.x }, { translateY: position.y }],
      },
    ]}
  >
    <Text style={styles.tooltipTime}>{label}</Text>
    <Text style={styles.tooltipValue}>
      {period === "year" ? `${value} avg/mnd` : value}
    </Text>
  </Animated.View>
);

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const tooltipPosition = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { moveX, moveY } = gestureState;
        const chartX = moveX - 20; // Juster for padding og marginer
        const chartY = moveY - 100; // Juster for header og andre elementer

        // Finn hvilken søyle som er nærmest touch-posisjonen
        const spacing =
          (chartWidth - 65) / (sampleData[selectedPeriod].values.length - 1);
        const index = Math.round((chartX - 45) / spacing);

        if (index >= 0 && index < sampleData[selectedPeriod].values.length) {
          const value = sampleData[selectedPeriod].values[index];
          let label;
          switch (selectedPeriod) {
            case "day":
              label = `${index.toString().padStart(2, "0")}:00`;
              break;
            case "week":
              label = sampleData.week.labels[index];
              break;
            case "month":
              label = `Dag ${index + 1}`;
              break;
            case "year":
              label = sampleData.year.labels[index];
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
                (value / sampleData[selectedPeriod].maxValue) *
                  (chartHeight - 80) -
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

  // Hent dagens dato for månedlig og årlig visning
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  const getMainStats = () => {
    switch (selectedPeriod) {
      case "day":
        return (
          <View style={styles.statsContainer}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{sampleData.day.total}</Text>
            <Text style={styles.totalTime}>Today</Text>
          </View>
        );
      case "week":
        return (
          <View style={styles.statsContainer}>
            <Text style={styles.totalLabel}>DAGLIG GJENNOMSNITT</Text>
            <Text style={styles.totalValue}>
              {Math.round(sampleData.week.average)}
            </Text>
            <Text style={styles.totalTime}>Denne uken</Text>
          </View>
        );
      case "month":
        return (
          <View style={styles.statsContainer}>
            <Text style={styles.totalLabel}>DAGLIG GJENNOMSNITT</Text>
            <Text style={styles.totalValue}>
              {Math.round(sampleData.month.average)}
            </Text>
            <Text style={styles.totalTime}>
              {currentMonth} {currentYear}
            </Text>
          </View>
        );
      case "year":
        return (
          <View style={styles.statsContainer}>
            <Text style={styles.totalLabel}>DAGLIG GJENNOMSNITT</Text>
            <Text style={styles.totalValue}>
              {Math.round(sampleData.year.average)}
            </Text>
            <Text style={styles.totalTime}>{currentYear}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color="#50C3AA"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Historie</Text>
      </View>

      {/* Period Selector */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onSelect={setSelectedPeriod}
      />

      {/* Main Stats */}
      {getMainStats()}

      {/* Chart */}
      <View style={styles.chartContainer} {...panResponder.panHandlers}>
        <Chart data={sampleData[selectedPeriod]} period={selectedPeriod} />
        {tooltipVisible && tooltipData && (
          <Tooltip
            value={tooltipData.value}
            label={tooltipData.label}
            position={tooltipPosition}
            period={selectedPeriod}
          />
        )}
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="walk" size={20} color="#50C3AA" />
          <Text style={styles.summaryValue}>258 903</Text>
          <Text style={styles.summaryLabel}>Totale skritt</Text>
        </View>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="fire" size={20} color="#50C3AA" />
          <Text style={styles.summaryValue}>25</Text>
          <Text style={styles.summaryLabel}>Best streak</Text>
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
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#000000",
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
    color: "#666666",
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
    color: "#666666",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#50C3AA",
    marginVertical: 5,
  },
  totalTime: {
    fontSize: 16,
    color: "#666666",
  },
  chartContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "#50C3AA",
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
    color: "#FFFFFF",
    opacity: 0.8,
  },
  tooltipValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
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
    backgroundColor: "#ffffff",
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
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  summaryLabel: {
    color: "#666666",
    fontSize: 12,
  },
});

export default HistoryScreen;
