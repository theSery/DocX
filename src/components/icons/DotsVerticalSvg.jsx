import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

const DotsVerticalSvg = ({ width = 4, height = 14, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 4 14" fill="none">
    <Circle cx="2" cy="2" r="1.6" fill={fill} />
    <Circle cx="2" cy="7" r="1.6" fill={fill} />
    <Circle cx="2" cy="12" r="1.6" fill={fill} />
  </Svg>
);

export default DotsVerticalSvg;
