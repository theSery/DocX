import Svg, { Path } from 'react-native-svg';

const MoonSvg = ({ width = 18, height = 18, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default MoonSvg;
