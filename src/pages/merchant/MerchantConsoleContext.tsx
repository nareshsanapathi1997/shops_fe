import { createContext, useContext } from 'react';
import type { MerchantConsoleValue } from './useMerchantConsoleState';

export const MerchantConsoleContext = createContext<MerchantConsoleValue | null>(null);

export function useMerchantConsole(): MerchantConsoleValue {
  const value = useContext(MerchantConsoleContext);
  if (!value) throw new Error('useMerchantConsole must be used inside MerchantConsoleContext.Provider');
  return value;
}
