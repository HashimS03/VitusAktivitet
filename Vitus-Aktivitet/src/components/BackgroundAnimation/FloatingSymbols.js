"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { View, Image, Animated, Easing, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext"; // Import Theme Support

const { width, height } = Dimensions.get("window");

const FloatingSymbol = ({ symbol, startPosition, size, onAnimationComplete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 5000 + Math.random() * 5000; // Random duration between 5-10 seconds
    const moveX = (Math.random() - 0.5) * 100; // Random X movement between -50 and 50
    const moveY = (Math.random() - 0.5) * 100; // Random Y movement between -50 and 50

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: moveX,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: moveY,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration - 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        onAnimationComplete();
      }
    });
  }, [translateX, translateY, opacity, onAnimationComplete]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: startPosition.x,
        top: startPosition.y,
        transform: [{ translateX }, { translateY }],
        opacity,
      }}
    >
      <Image source={symbol} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
};

const FloatingSymbols = () => {
  const { accentColor } = useTheme(); // Get active accent color
  const [symbols, setSymbols] = useState([]);
  const symbolCounter = useRef(0);
  const timerRef = useRef(null);

  // Map accent colors to the correct symbol images
  const symbolImages = {
    "#48CAB2": require("../../../assets/cross_teal_v2.png"),
    "#FF6B6B": require("../../../assets/cross_red_v2.png"),
    "#FFD93D": require("../../../assets/cross_gold_v2.png"),
    "#4C82FB": require("../../../assets/cross_blue_v2.png"),
    "#8A4FFF": require("../../../assets/cross_purple_v2.png"),
  };

  // Get the correct image for the selected accent color
  const selectedSymbol = symbolImages[accentColor] || require("../../../assets/cross_teal_v2.png");

  const createSymbol = useCallback(() => {
    const startPosition = {
      x: Math.random() * width,
      y: Math.random() * height,
    };
    const size = Math.floor(Math.random() * (30 - 20 + 1) + 20); // Random size between 20 and 30

    const newSymbol = {
      id: symbolCounter.current++,
      symbol: selectedSymbol,
      startPosition,
      size,
    };

    setSymbols((prevSymbols) => {
      if (prevSymbols.length >= 15) return prevSymbols;
      return [...prevSymbols, newSymbol];
    });
  }, [selectedSymbol]);

  const removeSymbol = useCallback(
    (id) => {
      setSymbols((prevSymbols) => prevSymbols.filter((symbol) => symbol.id !== id));
    },
    [setSymbols]
  );

  useEffect(() => {
    // Clear existing symbols when the accent color changes
    setSymbols([]);

    // Initialize with a few symbols
    for (let i = 0; i < 8; i++) {
      createSymbol();
    }

    // Set up interval to add new symbols
    timerRef.current = setInterval(() => {
      createSymbol();
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [createSymbol, accentColor]); // Re-run when `accentColor` changes

  return (
    <View style={{ position: "absolute", width, height }}>
      {symbols.map((symbol) => (
        <FloatingSymbol
          key={symbol.id}
          symbol={symbol.symbol}
          startPosition={symbol.startPosition}
          size={symbol.size}
          onAnimationComplete={() => removeSymbol(symbol.id)}
        />
      ))}
    </View>
  );
};

export default FloatingSymbols;
