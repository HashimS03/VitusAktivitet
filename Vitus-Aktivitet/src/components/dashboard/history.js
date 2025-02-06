import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Rect } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width - 40;

const weekData = {
  labels: ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'],
  values: [6500, 3200, 6800, 5200, 4000, 2000, 6500],
};

const maxBarHeight = 200; // Increased height
const maxValue = Math.max(...weekData.values);
const barWidth = 26;
const spacing = (screenWidth - 60) / weekData.labels.length;

const yAxisLabels = ['7K', '6K', '5K', '4K', '3K', '2K', '1K', '0'];
const yAxisSpacing = maxBarHeight / (yAxisLabels.length - 1);

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('Uke');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Historikk</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="walk" size={24} color="#000" />
            <Text style={styles.statNumber}>258 903</Text>
            <Text style={styles.statLabel}>Total Skritt gjennom tiden</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={24} color="#000" />
            <Text style={styles.statNumber}>25</Text>
            <Text style={styles.statLabel}>Høyeste Streak gjennom tiden</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.statisticsHeader}>
            <Text style={styles.statisticsTitle}>Statistikk</Text>
            <TouchableOpacity style={styles.periodButton}>
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
                    { top: index * yAxisSpacing - 10 }
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
                const y = 200 - barHeight; // Adjusted y position

                return (
                  <Rect
                    key={index}
                    x={x}
                    y={y}
                    rx={8}
                    ry={8}
                    width={barWidth}
                    height={barHeight}
                    fill="#48CAB2"
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
                    { left: 30 + index * spacing + (barWidth / 2) - 12 }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#fff',
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
    color: '#48CAB2',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    margin: 20,
    padding: 15,
    paddingBottom: 25, // Added padding at bottom
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 340, // Increased container height
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
    backgroundColor: '#48CAB2',
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
    height: 250, // Increased wrapper height
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
    color: '#BDBDBD',
    position: 'absolute',
    left: 0,
  },
  xAxis: {
    position: 'absolute',
    bottom: 35, // Reduced space between bars and labels
    left: 0,
    right: 0,
  },
  xLabel: {
    fontSize: 14,
    color: '#666',
    position: 'absolute',
    textAlign: 'center',
  },
});

export default HistoryScreen;