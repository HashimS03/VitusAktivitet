import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import Stats from "./stats";
import Achievements from "./achievements";
import Activity from "./activity";

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("Stats");

  const renderContent = () => {
    switch (activeTab) {
      case "Stats":
        return <Stats setActiveTab={setActiveTab} activeTab={activeTab} />;
      case "Achievements":
        return (
          <Achievements setActiveTab={setActiveTab} activeTab={activeTab} />
        );
      case "Activity":
        return <Activity setActiveTab={setActiveTab} activeTab={activeTab} />;
      default:
        return <Stats setActiveTab={setActiveTab} activeTab={activeTab} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {["Stats", "Achievements", "Activity"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#00BFFF",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
  },
  activeTabText: {
    color: "#00BFFF",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
});
