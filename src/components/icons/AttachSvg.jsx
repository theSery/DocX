import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const AttachSvg = ({ width = 18, height = 18, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
    <Path
      d="M10.2 3.2L5.4 8C4.2 9.2 4.2 11.1 5.4 12.3C6.6 13.5 8.5 13.5 9.7 12.3L14.5 7.5C16.3 5.7 16.3 2.8 14.5 1C12.7 -0.8 9.8 -0.8 8 1L3.2 5.8C1 8 1 11.6 3.2 13.8"
      stroke={fill}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export default AttachSvg;
