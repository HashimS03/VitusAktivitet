import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { X } from "lucide-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export const EnhancedTutorial = ({
  visible,
  currentStep,
  totalSteps,
  message,
  onNext,
  onBack,
  onSkip,
  highlightPosition,
  theme,
  accentColor,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      pulseAnim.setValue(1);
    }
  }, [visible, currentStep]);

  if (!visible) return null;

  const highlightWidth = highlightPosition.width || 100;
  const highlightHeight = highlightPosition.height || 100;

  const tooltipWidth = 280;
  const tooltipHeight = 150;

  // Calculate tooltip position
  let tooltipLeft = highlightPosition.left + highlightWidth / 2 - tooltipWidth / 2;
  let tooltipTop = highlightPosition.top + highlightHeight + 20;

  // Adjust if tooltip would go off screen
  if (tooltipLeft < 20) tooltipLeft = 20;
  if (tooltipLeft + tooltipWidth > SCREEN_WIDTH - 20)
    tooltipLeft = SCREEN_WIDTH - tooltipWidth - 20;

  if (tooltipTop + tooltipHeight > SCREEN_HEIGHT - 150) {
    tooltipTop = highlightPosition.top - tooltipHeight - 20;
  }
  if (tooltipTop < 50)
    tooltipTop = highlightPosition.top + highlightHeight + 20;

  return (
    <View style={styles.tutorialContainer}>
      <Svg
        height={SCREEN_HEIGHT}
        width={SCREEN_WIDTH}
        style={styles.highlightSvg}
      >
        <Defs>
          <LinearGradient id="highlightGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.2" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0.15" />
          </LinearGradient>
          <LinearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          fill="rgba(0,0,0,0.75)"
          zIndex={999}
        />
        <Rect
          x={highlightPosition.left - 10}
          y={highlightPosition.top - 10}
          width={highlightWidth + 20}
          height={highlightHeight + 20}
          fill="transparent"
          stroke="transparent"
          strokeWidth={0}
          zIndex={1001}
        />
      </Svg>

      <Animated.View
        style={[
          styles.tutorialTooltip,
          {
            backgroundColor: theme.surface,
            left: tooltipLeft,
            top: tooltipTop,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            elevation: 10,
            zIndex: 1002,
          },
        ]}
      >
        <View style={styles.tooltipHeader}>
          <Text style={[styles.stepIndicator, { color: accentColor }]}>
            {currentStep + 1}/{totalSteps}
          </Text>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <X size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.tutorialMessage, { color: theme.text }]}>
          {message}
        </Text>
        <View style={styles.tooltipFooter}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[
                styles.tutorialButton,
                { backgroundColor: theme.border, marginRight: 8 },
              ]}
              onPress={onBack}
            >
              <Text style={[styles.tutorialButtonText, { color: theme.text }]}>
                Tilbake
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.tutorialButton, { backgroundColor: accentColor }]}
            onPress={onNext}
          >
            <Text style={styles.tutorialButtonText}>
              {currentStep < totalSteps - 1 ? "Neste" : "Fullfør"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  tutorialContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  highlightSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 999,
  },
  tutorialTooltip: {
    position: "absolute",
    width: 280,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    zIndex: 1002,
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: "bold",
  },
  skipButton: {
    padding: 4,
  },
  tutorialMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  tooltipFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  tutorialButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tutorialButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  }
});