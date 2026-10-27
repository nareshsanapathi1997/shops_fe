import { createContext, useContext } from 'react';
import type { StorefrontValue } from './useStorefrontState';

export const StorefrontContext = createContext<StorefrontValue | null>(null);

export function useStorefront(): StorefrontValue {
  const value = useContext(StorefrontContext);
  if (!value) throw new Error('useStorefront must be used inside StorefrontContext.Provider');
  return value;
}
