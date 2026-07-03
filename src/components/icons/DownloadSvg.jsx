import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const DownloadSvg = ({ width = 20, height = 20, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3a1 1 0 0 1 1 1v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L11 13.586V4a1 1 0 0 1 1-1z"
      fill={fill}
    />
    <Path
      d="M4 17a1 1 0 0 1 1 1v2h14v-2a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"
      fill={fill}
    />
  </Svg>
);

export default DownloadSvg;
