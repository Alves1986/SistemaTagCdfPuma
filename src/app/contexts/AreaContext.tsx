import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

import { getAreasByGerencia, normalizeGerencia, getAllOperationalAreas } from '../utils/hierarchy';

// Derivado dinamicamente do HIERARQUIA (excluindo Manutenção)
export const ALL_AREAS = getAllOperationalAreas();
export type Area = string;

interface AreaContextType {
  selectedGerencia: string;
  setSelectedGerencia: (g: string) => void;
  selectedArea: Area;
  setSelectedArea: (area: Area) => void;
  areas: readonly Area[];
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

export function AreaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedGerencia, setSelectedGerencia] = useState<string>('Recuperação e Utilidades');
  const [selectedArea, setSelectedArea] = useState<Area>('CDR1/EVAP1');
  const [availableAreas, setAvailableAreas] = useState<Area[]>(getAreasByGerencia('Recuperação e Utilidades'));
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user?.gerencia && !initialized) {
      const raw = user.gerencia;
      // Normaliza: Manutenção inicializa em gerência operacional; demais normalizam aliases
      const normalized = raw === 'Manutenção'
        ? 'Recuperação e Utilidades'
        : normalizeGerencia(raw);
      setSelectedGerencia(normalized);
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    const newAreas = getAreasByGerencia(selectedGerencia);
    setAvailableAreas(newAreas);
    
    // Se a área selecionada não faz parte da nova gerência, muda para a primeira área da gerência
    if (!newAreas.includes(selectedArea) && newAreas.length > 0) {
      setSelectedArea(newAreas[0]);
    }
  }, [selectedGerencia]);

  return (
    <AreaContext.Provider value={{ 
      selectedGerencia, setSelectedGerencia, 
      selectedArea, setSelectedArea, 
      areas: availableAreas 
    }}>
      {children}
    </AreaContext.Provider>
  );
}

export function useArea() {
  const ctx = useContext(AreaContext);
  if (!ctx) throw new Error('useArea must be used within AreaProvider');
  return ctx;
}
