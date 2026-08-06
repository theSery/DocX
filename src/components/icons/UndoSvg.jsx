import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const UndoSvg = ({ width = 22, height = 22, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.5 7.5L5 12l4.5 4.5"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 12h9.5a4.5 4.5 0 1 1 0 9H12"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default UndoSvg;
