import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
const Chevron = ({ width, height, fill, rotate = 0  }) => (
  <Svg
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 52 52"
    // enableBackground="new 0 0 52 52"
    // xmlSpace="preserve"
    transform={[{ rotate: `${rotate}deg` }]}
  >
    <G>
      <Path d="M17.9,4.4l20.7,20.5c0.6,0.6,0.6,1.6,0,2.2L17.9,47.6c-0.6,0.6-1.6,0.6-2.2,0l-2.2-2.2 c-0.6-0.6-0.6-1.6,0-2.2l16.3-16.1c0.6-0.6,0.6-1.6,0-2.2L13.6,8.8c-0.6-0.6-0.6-1.6,0-2.2l2.2-2.2C16.4,3.9,17.3,3.9,17.9,4.4z" />
    </G>
  </Svg>
);
export default Chevron;
