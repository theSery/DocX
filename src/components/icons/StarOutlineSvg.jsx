import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const StarOutlineSvg = ({ width = 20, height = 20, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l2.39 4.84L20 8.27l-4 3.9.94 5.5L12 15.77l-4.94 2.9.94-5.5-4-3.9 5.61-.43L12 2z"
      fill={fill}
    />
  </Svg>
);

export default StarOutlineSvg;
