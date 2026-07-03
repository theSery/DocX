import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const SendSvg = ({ width = 20, height = 20, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.4 20.4 22 12 3.4 3.6l-.9 7.2 11.5 1.2-11.5 1.2.9 7.2z"
      fill={fill}
    />
  </Svg>
);

export default SendSvg;
