

import * as React from "react";
import Svg, { Path } from "react-native-svg";
const ArrowSvg = ({ width, height, fill = "#1D3D81", rotate = 0 }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 14 14"
    fill={fill}
    transform={[{ rotate: `${rotate}deg` }]}
  >
    <Path
      d="M6.07747 0.244078C6.40291 -0.0813593 6.93042 -0.0813593 7.25586 0.244078L13.0892 6.07741C13.4146 6.40285 13.4146 6.93036 13.0892 7.2558L7.25586 13.0891C6.93042 13.4146 6.40291 13.4146 6.07747 13.0891C5.75204 12.7637 5.75204 12.2362 6.07747 11.9107L10.4883 7.49994H0.833333C0.373096 7.49994 0 7.12684 0 6.6666C0 6.20637 0.373096 5.83327 0.833333 5.83327H10.4883L6.07747 1.42246C5.75204 1.09703 5.75204 0.569515 6.07747 0.244078Z"
      fill={fill}
    />
  </Svg>
);
export default ArrowSvg;