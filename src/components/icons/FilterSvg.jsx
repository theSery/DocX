
import * as React from "react";
import Svg, { Line, Circle } from "react-native-svg";
const FilterSvg = ({ width, height, fill = "#1D3D81" }) => (
    <Svg
    width={width}
    height={height}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    strokeWidth={3}
    stroke={fill}
    fill="none"
  >
    <Line x1={50.69} y1={32} x2={56.32} y2={32} />
    <Line x1={7.68} y1={32} x2={38.69} y2={32} />
    <Line x1={26.54} y1={15.97} x2={56.32} y2={15.97} />
    <Line x1={7.68} y1={15.97} x2={14.56} y2={15.97} />
    <Line x1={35} y1={48.03} x2={56.32} y2={48.03} />
    <Line x1={7.68} y1={48.03} x2={23} y2={48.03} />
    <Circle cx={20.55} cy={15.66} r={6} />
    <Circle cx={44.69} cy={32} r={6} />
    <Circle cx={29} cy={48.03} r={6} />
  </Svg>
);
export default FilterSvg;
