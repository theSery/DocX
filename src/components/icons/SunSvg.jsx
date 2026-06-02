import Svg, { Circle, Line } from 'react-native-svg';

const SunSvg = ({ width = 18, height = 18, fill = '#1D3D81' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={4} stroke={fill} strokeWidth={2} />
    <Line x1={12} y1={2} x2={12} y2={5} stroke={fill} strokeWidth={2} strokeLinecap="round" />
    <Line x1={12} y1={19} x2={12} y2={22} stroke={fill} strokeWidth={2} strokeLinecap="round" />
    <Line x1={2} y1={12} x2={5} y2={12} stroke={fill} strokeWidth={2} strokeLinecap="round" />
    <Line x1={19} y1={12} x2={22} y2={12} stroke={fill} strokeWidth={2} strokeLinecap="round" />
    <Line
      x1={4.93}
      y1={4.93}
      x2={7.05}
      y2={7.05}
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Line
      x1={16.95}
      y1={16.95}
      x2={19.07}
      y2={19.07}
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Line
      x1={4.93}
      y1={19.07}
      x2={7.05}
      y2={16.95}
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Line
      x1={16.95}
      y1={7.05}
      x2={19.07}
      y2={4.93}
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default SunSvg;
