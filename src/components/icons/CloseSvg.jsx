import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CloseSvg = ({ width, height, fill, ...props }) => (
  <Svg
    width={width}
    height={height}
    fill={fill}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    // {...props}
  >
    <Path
      style={{
        fill: fill,
        stroke: "#222222",
        strokeWidth: 4,
      }}
      d="M 20,4 3,21 33,50 3,80 20,97 49,67 79,97 95,80 65,50 95,20 80,4 50,34 z"
    />
  </Svg>
);
export default CloseSvg;