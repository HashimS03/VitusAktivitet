import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Color from "color";

export const CustomProgressCircle = ({ progress, accentColor, size, thickness }) => {
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const transparentAccentColor = Color(accentColor).alpha(0.2).toString();

  return (
    <Svg height={size} width={size}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={accentColor} stopOpacity="1" />
          <Stop offset="1" stopColor={accentColor} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={transparentAccentColor}
        strokeWidth={thickness}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#grad)"
        strokeWidth={thickness}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};