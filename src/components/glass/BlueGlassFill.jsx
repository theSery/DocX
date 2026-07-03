import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BLUE_GLASS_BUTTON } from './glassConfig';

export function BlueGlassFill({ gradientId = 'blueGlassFill', blueColor }) {
  const { center, mid, edge } = BLUE_GLASS_BUTTON.fill;
  const fillCenter = blueColor ?? center;
  const fillMid = blueColor ?? mid;
  const fillEdge = blueColor ? blueColor : edge;

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient
          id={gradientId}
          cx="38%"
          cy="30%"
          rx="72%"
          ry="72%"
          fx="32%"
          fy="24%">
          <Stop offset="0%" stopColor={fillCenter} />
          <Stop offset="58%" stopColor={fillMid} />
          <Stop offset="100%" stopColor={fillEdge} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
}
