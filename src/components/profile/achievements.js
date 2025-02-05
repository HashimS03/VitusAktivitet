import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

const Trophy = ({ level, count, color }) => (
  <View style={styles.trophyCard}>
    <View style={[styles.trophyIcon, { backgroundColor: color }]} />
    <Text style={styles.trophyTitle}>Level {level}</Text>
    <View style={styles.trophyCount}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  </View>
);

const Certification = ({ title, level, icon }) => (
  <View style={styles.certCard}>
    <View style={[styles.certIcon, { backgroundColor: icon.color }]} />
    <Text style={styles.certTitle}>{title}</Text>
    <Text style={styles.certLevel}>Level {level}</Text>
  </View>
);

const AchievementsTab = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.medalIcon} />
          <View>
            <Text style={styles.levelTitle}>Level 2</Text>
            <Text style={styles.levelSubtitle}>500 Points to next level</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.levelNumber}>2</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.levelNumber}>3</Text>
        </View>
        <Text style={styles.pointsText}>5500/6000</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TROPHIES 12</Text>
          <ChevronRight size={20} color="#9e9fa1" />
        </TouchableOpacity>
        <View style={styles.trophyGrid}>
          <Trophy level={6} count={3} color="#FFD700" />
          <Trophy level={4} count={7} color="#C0C0C0" />
          <Trophy level={9} count={2} color="#CD7F32" />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CERTIFICATIONS 8</Text>
          <ChevronRight size={20} color="#9e9fa1" />
        </TouchableOpacity>
        <View style={styles.certGrid}>
          <Certification
            title="1000 Steps"
            level={3}
            icon={{ color: "#4CAF50" }}
          />
          <Certification
            title="30 Streak"
            level={9}
            icon={{ color: "#FF9800" }}
          />
          <Certification
            title="1st Place"
            level={5}
            icon={{ color: "#2196F3" }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  medalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    marginRight: 12,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  levelSubtitle: {
    fontSize: 14,
    color: "#9e9fa1",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  progressFill: {
    width: "92%",
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 4,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  pointsText: {
    fontSize: 14,
    color: "#9e9fa1",
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9e9fa1",
  },
  trophyGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
  },
  trophyCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  trophyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trophyCount: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "600",
  },
  certGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 16,
  },
  certCard: {
    width: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  certIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  certTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  certLevel: {
    fontSize: 12,
    color: "#9e9fa1",
  },
});

export default AchievementsTab;
