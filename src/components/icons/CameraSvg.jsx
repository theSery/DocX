
import * as React from "react";
import Svg, { Polygon, Circle } from "react-native-svg";
const CameraSvg = ({ width, height , fill}) => (
  <Svg
  width={width}
  height={height}
  fill={fill}
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 32 32"
    // enableBackground="new 0 0 32 32"
    xmlSpace="preserve"
    // {...props}
  >
    <Polygon
      fill="none"
      stroke="#000000"
      strokeWidth={2}
      strokeMiterlimit={10}
      points="21.5,9 20,7 12,7 10.5,9 4,9 4,25 28,25  28,9 "
    />
    <Circle
      fill="none"
      stroke="#000000"
      strokeWidth={2}
      strokeMiterlimit={10}
      cx={16}
      cy={17}
      r={5}
    />
    <Circle cx={8} cy={12} r={1} />
  </Svg>
);
export default CameraSvg;
