import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const ALL_AREAS = ['CDF II', 'ETAC II', 'CDF I', 'ETAC I'] as const;
export type Area = typeof ALL_AREAS[number];

interface AreaContextType {
  selectedArea: Area;
  setSelectedArea: (area: Area) => void;
  areas: readonly Area[];
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

export function AreaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedArea, setSelectedArea] = useState<Area>('CDF II');
  const [availableAreas, setAvailableAreas] = useState<Area[]>([...ALL_AREAS]);

  useEffect(() => {
    if (user?.area === 'CDF1 / ETAC1') {
      setAvailableAreas(['CDF I', 'ETAC I']);
      if (!['CDF I', 'ETAC I'].includes(selectedArea)) {
        setSelectedArea('CDF I');
      }
    } else if (user?.area === 'CDF2 / ETAC2') {
      setAvailableAreas(['CDF II', 'ETAC II']);
      if (!['CDF II', 'ETAC II'].includes(selectedArea)) {
        setSelectedArea('CDF II');
      }
    } else {
      setAvailableAreas([...ALL_AREAS]);
    }
  }, [user?.area]);

  return (
    <AreaContext.Provider value={{ selectedArea, setSelectedArea, areas: availableAreas }}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  const ctx = useContext(AreaContext);
  if (!ctx) throw new Error('useArea must be used within AreaProvider');
  return ctx;
}
