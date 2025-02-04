// First, let's update the leaderboard with more entries and improved styling...
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
} from 'react-native';
import { Settings, TrendingUp, TrendingDown } from 'lucide-react-native';

const TEAL_COLOR = '#00BFA5';

const Leaderboard = () => {
  const [selectedSegment, setSelectedSegment] = useState('I DAG');
  const [fadeAnim] = useState(new Animated.Value(1));

  const leaderboardData = [
    {
      id: '4',
      name: 'Sjartan',
      points: 950,
      change: +2,
      avatar: require('../../../assets/figure/avatar1.jpg'),
    },
    {
      id: '5',
      name: 'Ahmed',
      points: 920,
      change: -1,
      avatar: require('../../../assets/figure/avatar2.jpg'),
    },
    {
      id: '6',
      name: 'Emma',
      points: 880,
      change: +3,
      avatar: require('../../../assets/figure/avatar3.jpg'),
    },
    {
      id: '7',
      name: 'Lars',
      points: 850,
      change: -2,
      avatar: require('../../../assets/figure/avatar4.jpeg'),
    },
    {
      id: '8',
      name: 'Sofia',
      points: 820,
      change: +1,
      avatar: require('../../../assets/figure/avatar5.jpeg'),
    },
    {
      id: '9',
      name: 'Magnus',
      points: 780,
      change: -3,
      avatar: require('../../../assets/figure/avatar6.jpg'),
    },
    {
      id: '10',
      name: 'Isabella',
      points: 750,
      change: +4,
      avatar: require('../../../assets/figure/avatar7.jpeg'),
    }
  ];

  const topThree = [
    {
      id: '2',
      name: 'Hashem',
      points: 1500,
      avatar: require('../../../assets/figure/hashem.png'),
      medal: '🥈'
    },
    {
      id: '1',
      name: 'Ho Daniel',
      points: 2000,
      avatar: require('../../../assets/figure/daniel.png'),
      medal: '🥇'
    },
    {
      id: '3',
      name: 'Sarim',
      points: 1200,
      avatar: require('../../../assets/figure/sarim.png'),
      medal: '🥉'
    }
  ];

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
        return (
          <View 
            key={item.id} 
            style={[
              styles.topThreeItem,
              isWinner && styles.winnerItem
            ]}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={item.avatar} 
                style={[
                  styles.topThreeAvatar,
                  isWinner && styles.winnerAvatar
                ]} 
              />
              <Text style={styles.medalIcon}>{item.medal}</Text>
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
        <Image source={item.avatar} style={styles.listAvatar} />
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

      <FlatList
        ListHeaderComponent={renderTopThree}
        data={leaderboardData}
        keyExtractor={(item) => item.id}
        renderItem={renderLeaderboardItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 21,
  },
  segmentButtonActive: {
    backgroundColor: TEAL_COLOR,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: '#FFF',
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  topThreeItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
  },
  winnerItem: {
    transform: [{ scale: 1.1 }],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  topThreeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  winnerAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  medalIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    fontSize: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topThreeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  topThreePoints: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
  },
  changeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  playerRank: {
    fontSize: 12,
    color: '#666',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEAL_COLOR,
  },
});

export default Leaderboard;