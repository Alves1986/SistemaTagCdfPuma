import { createContext, useContext, useState, ReactNode } from 'react';

export const AREAS = ['CDF II', 'ETAC II', 'CDF I', 'ETAC I'] as const;
export type Area = typeof AREAS[number];

interface AreaContextType {
  selectedArea: Area;
  setSelectedArea: (area: Area) => void;
  areas: readonly Area[];
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

export function AreaProvider({ children }: { children: ReactNode }) {
  const [selectedArea, setSelectedArea] = useState<Area>('CDF II');

  return (
    <AreaContext.Provider value={{ selectedArea, setSelectedArea, areas: AREAS }}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  const ctx = useContext(AreaContext);
  if (!ctx) throw new Error('useArea must be used within AreaProvider');
  return ctx;
}
