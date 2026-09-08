import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const CitizenshipSvg = ({ width, height, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
    <Circle
      cx="16"
      cy="16"
      r="11"
      stroke={fill}
      strokeWidth={2}
    />
    <Path
      d="M5 16h22"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M16 5c2.8 2.9 4.4 6.7 4.4 11S18.8 24.1 16 27c-2.8-2.9-4.4-6.7-4.4-11S13.2 7.9 16 5z"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CitizenshipSvg;
