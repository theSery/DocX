import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const BellSvg = ({ width = 20, height = 20, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M7.5 16.5C7.78 17.16 8.44 17.67 9.2 17.67H10.8C11.56 17.67 12.22 17.16 12.5 16.5M15 13.5V9.5C15 6.74 13.01 4.46 10.4 3.84C10.14 3.28 9.57 2.9 8.92 2.9C8.27 2.9 7.7 3.28 7.44 3.84C4.83 4.46 2.84 6.74 2.84 9.5V13.5L1.5 15.17V15.83H18.5V15.17L17.16 13.5H15Z"
      stroke={fill}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BellSvg;
