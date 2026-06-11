import { createContext, useContext } from 'react';

export const RadioGroupContext = createContext(null);

export function useRadioGroup() {
  return useContext(RadioGroupContext);
}
