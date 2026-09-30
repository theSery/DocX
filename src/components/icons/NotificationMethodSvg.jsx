import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const NotificationMethodSvg = ({ width, height, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
    <Path
      d="M8.5 13.2a7.5 7.5 0 0 1 15 0c0 4.1.55 6.3 1.35 7.7.28.48-.07 1.1-.62 1.1H7.77c-.55 0-.9-.62-.62-1.1.8-1.4 1.35-3.6 1.35-7.7z"
      stroke={fill}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Path
      d="M13.2 23.4a2.8 2.8 0 0 0 5.6 0"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default NotificationMethodSvg;
