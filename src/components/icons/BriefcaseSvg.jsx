

import * as React from "react";
import Svg, { Path } from "react-native-svg";
const BriefcaseSvg = ({ width, height, fill }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    // {...props}
  >
    <Path d="M16 16H16.0133Z" fill="#1D3D81" />
    <Path
      d="M16 16H16.0133"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21.3337 7.99996V5.33329C21.3337 4.62605 21.0527 3.94777 20.5526 3.44767C20.0525 2.94758 19.3742 2.66663 18.667 2.66663H13.3337C12.6264 2.66663 11.9481 2.94758 11.448 3.44767C10.9479 3.94777 10.667 4.62605 10.667 5.33329V7.99996"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M29.3337 17.3334C25.3774 19.9453 20.7411 21.3378 16.0003 21.3378C11.2596 21.3378 6.62327 19.9453 2.66699 17.3334"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M26.667 8H5.33366C3.8609 8 2.66699 9.19391 2.66699 10.6667V24C2.66699 25.4728 3.8609 26.6667 5.33366 26.6667H26.667C28.1397 26.6667 29.3337 25.4728 29.3337 24V10.6667C29.3337 9.19391 28.1397 8 26.667 8Z"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default BriefcaseSvg;
