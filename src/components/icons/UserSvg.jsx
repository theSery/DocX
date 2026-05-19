import * as React from "react";
import Svg, { Path } from "react-native-svg";

const UserSvg = ({ width, height, fill = "#1D3D81" }) => (
  <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
    <Path
      d="M25.3337 28V25.3333C25.3337 23.9188 24.7718 22.5623 23.7716 21.5621C22.7714 20.5619 21.4148 20 20.0003 20H12.0003C10.5858 20 9.22928 20.5619 8.22909 21.5621C7.2289 22.5623 6.66699 23.9188 6.66699 25.3333V28"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.0003 14.6667C18.9458 14.6667 21.3337 12.2789 21.3337 9.33333C21.3337 6.38781 18.9458 4 16.0003 4C13.0548 4 10.667 6.38781 10.667 9.33333C10.667 12.2789 13.0548 14.6667 16.0003 14.6667Z"
      stroke={fill}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default UserSvg;
