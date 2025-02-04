import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Settings } from 'lucide-react-native';

const TEAL_COLOR = '#00BFA5';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leaderboard data from Azure Backend
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://your-backend.azurewebsites.net/leaderboard'); // Change to Azure backend URL
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid API response');
      }

      // Sort and extract top three
      const sortedData = [...data].sort((a, b) => b.points - a.points);
      setTopThree(sortedData.slice(0, 3));
      setLeaderboardData(sortedData.slice(3));

    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const renderTopThree = () => (
    <View style={styles.topThreeContainer}>
      {topThree.map((item, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        return (
          <View key={item.id} style={styles.topThreeItem}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.avatar }} style={styles.topThreeAvatar} />
              <Text style={styles.medalIcon}>{medals[index]}</Text>
            </View>
            <Text style={styles.topThreeName}>{item.name}</Text>
            <Text style={styles.topThreePoints}>{item.points.toLocaleString()} Poeng</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#666" />
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
          renderItem={({ item }) => (
            <View style={styles.leaderboardRow}>
              <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.pointsText}>{item.points.toLocaleString()} Poeng</Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
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
  topThreeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 32 },
  topThreeItem: { alignItems: 'center', flex: 1, paddingVertical: 16 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  topThreeAvatar: { width: 80, height: 80, borderRadius: 40 },
  medalIcon: { position: 'absolute', bottom: -5, right: -5, fontSize: 24 },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 20 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', padding: 16, marginHorizontal: 20, borderRadius: 12, marginBottom: 8 },
  listAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  playerName: { fontSize: 16, fontWeight: '600', color: '#000' },
  pointsText: { fontSize: 16, fontWeight: '600', color: TEAL_COLOR }
});

export default Leaderboard;
