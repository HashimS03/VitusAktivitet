import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";

const Achievement = ({ icon, level, count, title }) => (
  <View style={styles.achievementCard}>
    <Image source={icon} style={styles.achievementIcon} />
    <Text style={styles.achievementLevel}>Level {level}</Text>
    <Text style={styles.achievementCount}>{count}</Text>
  </View>
);

const Certification = ({ icon, title, level, progress }) => (
  <View style={styles.certificationCard}>
    <Image source={icon} style={styles.certificationIcon} />
    <View style={styles.certificationInfo}>
      <Text style={styles.certificationTitle}>{title}</Text>
      <Text style={styles.certificationLevel}>Level {level}</Text>
    </View>
  </View>
);

const Achievements = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Level Progress Section */}
      <View style={styles.levelCard}>
        <View style={styles.levelIcon}>
          <Text>🏆</Text>
        </View>
        <Text style={styles.levelTitle}>Level 2</Text>
        <Text style={styles.levelSubtitle}>500 Points to next level</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "75%" }]} />
        </View>
        <View style={styles.levelNumbers}>
          <Text>2</Text>
          <Text>3</Text>
        </View>
      </View>

      {/* Trophies Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TROPHIES 12</Text>
          <Text style={styles.seeAll}>{">"}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Achievement
            icon={require("../../../assets/trophy-gold.png")}
            level={6}
            count={3}
          />
          <Achievement
            icon={require("../../../assets/trophy-gold.png")}
            level={4}
            count={7}
          />
          <Achievement
            icon={require("../../../assets/trophy-gold.png")}
            level={9}
            count={2}
          />
        </ScrollView>
      </View>

      {/* Certifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CERTIFICATIONS 8</Text>
        <View style={styles.certificationsList}>
          <Certification
            icon={require("../../../assets/trophy-gold.png")}
            title="1000 Steps"
            level={3}
            progress="5/5"
          />
          <Certification
            icon={require("../../../assets/trophy-gold.png")}
            title="30 Streak"
            level={9}
            progress="5/5"
          />
          <Certification
            icon={require("../../../assets/trophy-gold.png")}
            title="1st Place"
            level={5}
            progress="3/5"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  levelCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: "#9e9fa1",
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00ADB5",
    borderRadius: 4,
  },
  levelNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9e9fa1",
  },
  seeAll: {
    fontSize: 16,
    color: "#9e9fa1",
  },
  achievementCard: {
    width: 100,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  achievementLevel: {
    fontSize: 14,
    fontWeight: "600",
  },
  achievementCount: {
    fontSize: 12,
    color: "#9e9fa1",
  },
  certificationsList: {
    gap: 12,
  },
  certificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  certificationIcon: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  certificationInfo: {
    flex: 1,
  },
  certificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  certificationLevel: {
    fontSize: 14,
    color: "#9e9fa1",
  },
});

export default Achievements;
