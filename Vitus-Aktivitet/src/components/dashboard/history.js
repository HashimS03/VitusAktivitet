import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext'; // Import theme context

const screenWidth = Dimensions.get('window').width - 40;

const weekData = {
  labels: ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'],
  values: [6500, 3200, 6800, 5200, 4000, 2000, 6500],
};

const maxBarHeight = 200;
const maxValue = Math.max(...weekData.values);
const barWidth = 26;
const spacing = (screenWidth - 60) / weekData.labels.length;
const yAxisLabels = ['7K', '6K', '5K', '4K', '3K', '2K', '1K', '0'];
const yAxisSpacing = maxBarHeight / (yAxisLabels.length - 1);

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('Uke');
  const { theme, isDarkMode } = useTheme(); // Get theme from context

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Historikk</Text>
        </View>

        {/* Stats Card (White in Light Mode, Dark Grey in Dark Mode) */}
        <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="walk" size={24} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.primary }]}>258 903</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Total Skritt gjennom tiden</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={24} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.primary }]}>25</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Høyeste Streak gjennom tiden</Text>
          </View>
        </View>

        {/* Chart Section (White in Light Mode, Dark Grey in Dark Mode) */}
        <View style={[styles.chartContainer, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
          <View style={styles.statisticsHeader}>
            <Text style={[styles.statisticsTitle, { color: theme.text }]}>Statistikk</Text>
            <TouchableOpacity style={[styles.periodButton, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="equalizer" size={20} color="#fff" />
              <Text style={styles.periodButtonText}>Uke</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartWrapper}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              {yAxisLabels.map((label, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.yLabel, 
                    { top: index * yAxisSpacing - 10, color: theme.text }
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>

            <Svg width={screenWidth} height={240}>
              {/* Bars */}
              {weekData.values.map((value, index) => {
                const barHeight = (value / maxValue) * maxBarHeight;
                const x = 30 + index * spacing;
                const y = 200 - barHeight;

                return (
                  <Rect
                    key={index}
                    x={x}
                    y={y}
                    rx={8}
                    ry={8}
                    width={barWidth}
                    height={barHeight}
                    fill={theme.primary} // Dynamic Accent Color
                  />
                );
              })}
            </Svg>

            {/* X-axis labels */}
            <View style={styles.xAxis}>
              {weekData.labels.map((label, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.xLabel, 
                    { left: 30 + index * spacing + (barWidth / 2) - 12, color: theme.text }
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles (White Containers for Light Mode, Dark Grey for Dark Mode)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  chartContainer: {
    margin: 20,
    padding: 15,
    paddingBottom: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 340,
  },
  statisticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statisticsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  periodButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chartWrapper: {
    position: 'relative',
    marginLeft: 0,
    marginTop: 0,
    height: 250,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: maxBarHeight,
    justifyContent: 'space-between',
  },
  yLabel: {
    fontSize: 12,
    position: 'absolute',
    left: 0,
  },
  xAxis: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
  },
  xLabel: {
    fontSize: 14,
    position: 'absolute',
    textAlign: 'center',
  },
});

export default HistoryScreen;
