import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const SadIcon = ({ width = 24, height = 24, fill }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={12}
      r={9}
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={9.5} cy={9.5} r={1.5} fill={fill} />
    <Circle cx={14.5} cy={9.5} r={1.5} fill={fill} />
    <Path
      d="M7.53803 15.6064C8.79314 14.5681 10.3711 14 12 14C13.6289 14 15.2069 14.5681 16.462 15.6064"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SadIcon;
