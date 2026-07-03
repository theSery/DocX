import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const StarSvg = ({ width = 20, height = 20, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 1.5L12.35 7.15L18.5 7.85L13.75 11.95L15.2 18L10 14.85L4.8 18L6.25 11.95L1.5 7.85L7.65 7.15L10 1.5Z"
      stroke={fill}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </Svg>
);

export default StarSvg;
