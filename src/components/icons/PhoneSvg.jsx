import * as React from "react";
import Svg, { Path } from "react-native-svg";
const PhoneSvg = ({ width, height, fill }) => (
  <Svg
    fill={fill}
    width={width}
    height={height}
    viewBox="-6 -2 24 24"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMinYMin"
    className="jam jam-phone"
    // {...props}
  >
    <Path d="M3 0h6a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm3 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </Svg>
);
export default PhoneSvg;
