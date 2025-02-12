"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { View, Image, Animated, Easing, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const FloatingSymbol = ({
  symbol,
  startPosition,
  size,
  onAnimationComplete,
}) => {
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
      <Image
        source={symbol}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const FloatingSymbols = () => {
  const [symbols, setSymbols] = useState([]);
  const symbolCounter = useRef(0);
  const timerRef = useRef(null);

  const symbols_images = [
    require("../../../assets/cross_teal_v2.png"),
    require("../../../assets/cross_teal_v2.png"),
    require("../../../assets/cross_teal_v2.png"),
    // Add more symbols as needed
  ];

  const createSymbol = useCallback(() => {
    const startPosition = {
      x: Math.random() * width,
      y: Math.random() * height,
    };
    const size = Math.floor(Math.random() * (30 - 20 + 1) + 20); // Tilfeldig størrelse mellom 20 og 30

    const newSymbol = {
      id: symbolCounter.current++,
      symbol: symbols_images[Math.floor(Math.random() * symbols_images.length)],
      startPosition,
      size,
    };

    setSymbols((prevSymbols) => {
      if (prevSymbols.length >= 15) return prevSymbols;
      return [...prevSymbols, newSymbol];
    });
  }, [symbols_images, setSymbols]); // Fixed dependency

  const removeSymbol = useCallback(
    (id) => {
      setSymbols((prevSymbols) =>
        prevSymbols.filter((symbol) => symbol.id !== id)
      );
    },
    [setSymbols]
  );

  useEffect(() => {
    // Initialiser med noen symboler
    for (let i = 0; i < 8; i++) {
      createSymbol();
    }

    // Sett opp intervallet for å legge til nye symboler
    timerRef.current = setInterval(() => {
      createSymbol();
    }, 2000); // Prøv å legge til et nytt symbol hvert sekund

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [createSymbol]);

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
