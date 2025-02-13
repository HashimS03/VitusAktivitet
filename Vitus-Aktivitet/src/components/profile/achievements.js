import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useTheme } from "../context/ThemeContext"; // 🌙 Import Theme

const Achievement = ({ icon, level, count, theme }) => (
  <View style={[styles.achievementCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
    <Image source={icon} style={styles.achievementIcon} />
    <Text style={[styles.achievementLevel, { color: theme.text }]}>Level {level}</Text>
    <Text style={[styles.achievementCount, { color: theme.textSecondary }]}>{count}</Text>
  </View>
);

const Certification = ({ icon, title, level, progress, theme }) => (
  <View style={[styles.certificationCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
    <Image source={icon} style={styles.certificationIcon} />
    <View style={styles.certificationInfo}>
      <Text style={[styles.certificationTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.certificationLevel, { color: theme.textSecondary }]}>Level {level}</Text>
    </View>
  </View>
);

const Achievements = () => {
  const { theme } = useTheme(); // Get theme values

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Level Progress Section */}
      <View style={[styles.levelCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
        <View style={[styles.levelIcon, { backgroundColor: theme.primary }]}>
          <Text style={{ color: theme.onPrimary }}>🏆</Text>
        </View>
        <Text style={[styles.levelTitle, { color: theme.text }]}>Level 2</Text>
        <Text style={[styles.levelSubtitle, { color: theme.textSecondary }]}>500 Points to next level</Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: "75%", backgroundColor: theme.accent }]} />
        </View>
        <View style={styles.levelNumbers}>
          <Text style={{ color: theme.textSecondary }}>2</Text>
          <Text style={{ color: theme.textSecondary }}>3</Text>
        </View>
      </View>

      {/* Trophies Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>TROPHIES 12</Text>
          <Text style={[styles.seeAll, { color: theme.textSecondary }]}>{">"}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Achievement icon={require("../../../assets/trophy-gold.png")} level={6} count={3} theme={theme} />
          <Achievement icon={require("../../../assets/trophy-gold.png")} level={4} count={7} theme={theme} />
          <Achievement icon={require("../../../assets/trophy-gold.png")} level={9} count={2} theme={theme} />
        </ScrollView>
      </View>

      {/* Certifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>CERTIFICATIONS 8</Text>
        <View style={styles.certificationsList}>
          <Certification icon={require("../../../assets/trophy-gold.png")} title="1000 Steps" level={3} progress="5/5" theme={theme} />
          <Certification icon={require("../../../assets/trophy-gold.png")} title="30 Streak" level={9} progress="5/5" theme={theme} />
          <Certification icon={require("../../../assets/trophy-gold.png")} title="1st Place" level={5} progress="3/5" theme={theme} />
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
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
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
  },
  seeAll: {
    fontSize: 16,
  },
  achievementCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
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
  },
  certificationsList: {
    gap: 12,
  },
  certificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
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
  },
});

export default Achievements;
