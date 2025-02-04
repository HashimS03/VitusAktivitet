import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  ActivityIndicator
} from 'react-native';
import { Settings, TrendingUp, TrendingDown } from 'lucide-react-native';

const TEAL_COLOR = '#00BFA5';

const Leaderboard = () => {
  const [selectedSegment, setSelectedSegment] = useState('I DAG');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leaderboard data from API
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/leaderboard/'); // Replace with your actual API URL
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      // Sort and extract top three
      const sortedData = [...data].sort((a, b) => b.points - a.points);
      setTopThree(sortedData.slice(0, 3));
      setLeaderboardData(sortedData.slice(3));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleSegmentChange = (segment) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedSegment(segment);
  };

  const renderTopThree = () => (
    <View style={styles.topThreeContainer}>
      {topThree.map((item, index) => {
        const isWinner = index === 1;
        const medals = ['🥇', '🥈', '🥉'];
        return (
          <View 
            key={item.id} 
            style={[styles.topThreeItem, isWinner && styles.winnerItem]}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: item.avatar }} 
                style={[styles.topThreeAvatar, isWinner && styles.winnerAvatar]} 
              />
              <Text style={styles.medalIcon}>{medals[index]}</Text>
            </View>
            <Text style={styles.topThreeName}>{item.name}</Text>
            <Text style={styles.topThreePoints}>
              {item.points.toLocaleString()} Poeng
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <Animated.View style={[styles.leaderboardRow, { opacity: fadeAnim }]}>
      <View style={styles.rankContainer}>
        {item.change > 0 ? (
          <TrendingUp size={16} color="#4CAF50" />
        ) : (
          <TrendingDown size={16} color="#F44336" />
        )}
        <Text style={[
          styles.changeText, 
          item.change > 0 ? styles.positive : styles.negative
        ]}>
          {Math.abs(item.change)}
        </Text>
      </View>

      <View style={styles.playerInfo}>
        <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
        <View>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerRank}>Rank #{index + 4}</Text>
        </View>
      </View>

      <Text style={styles.pointsText}>
        {item.points.toLocaleString()} Poeng
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedSegment === 'I DAG' && styles.segmentButtonActive,
          ]}
          onPress={() => handleSegmentChange('I DAG')}
        >
          <Text style={[
            styles.segmentText,
            selectedSegment === 'I DAG' && styles.segmentTextActive,
          ]}>
            I DAG
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedSegment === 'MÅNED' && styles.segmentButtonActive,
          ]}
          onPress={() => handleSegmentChange('MÅNED')}
        >
          <Text style={[
            styles.segmentText,
            selectedSegment === 'MÅNED' && styles.segmentTextActive,
          ]}>
            MÅNED
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={TEAL_COLOR} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          ListHeaderComponent={renderTopThree}
          data={leaderboardData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLeaderboardItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#000' },
  settingsButton: { padding: 8, borderRadius: 12, backgroundColor: '#F5F5F5' },
  segmentContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#F5F5F5', borderRadius: 25, padding: 4, marginBottom: 24 },
  segmentButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 21 },
  segmentButtonActive: { backgroundColor: TEAL_COLOR },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#666' },
  segmentTextActive: { color: '#FFF' },
  topThreeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 32 },
  topThreeItem: { alignItems: 'center', flex: 1, paddingVertical: 16 },
  winnerItem: { transform: [{ scale: 1.1 }] },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  topThreeAvatar: { width: 80, height: 80, borderRadius: 40 },
  winnerAvatar: { width: 90, height: 90, borderRadius: 45 },
  medalIcon: { position: 'absolute', bottom: -5, right: -5, fontSize: 24 },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 20 }
});

export default Leaderboard;
