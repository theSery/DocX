import { View } from 'react-native';

import { RadioGroupContext } from './RadioGroupContext';

/**
 * @param {{
 *   value?: string | number | null;
 *   onChange?: (value: string | number | null) => void;
 *   children?: React.ReactNode;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function RadioGroup({ value, onChange, children, style }) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange }}>
      <View style={style}>{children}</View>
    </RadioGroupContext.Provider>
  );
}
