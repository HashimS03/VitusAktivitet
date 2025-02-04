import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import UpcomingEvents from './upcomming-events';
import YourEvents from './your-events';
import PastEvents from './past-events';

export default function EventsNavigation() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return <UpcomingEvents setActiveTab={setActiveTab} activeTab={activeTab} />;
      case 'your':
        return <YourEvents setActiveTab={setActiveTab} activeTab={activeTab} />;
      case 'past':
        return <PastEvents setActiveTab={setActiveTab} activeTab={activeTab} />;
      default:
        return <UpcomingEvents setActiveTab={setActiveTab} activeTab={activeTab} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});