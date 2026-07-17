import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

import { getAreasByGerencia } from '../utils/hierarchy';

export const ALL_AREAS = ['CDF II', 'ETAC II', 'CDF I', 'ETAC I'] as const;
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
  const [selectedArea, setSelectedArea] = useState<Area>('CDF II');
  const [availableAreas, setAvailableAreas] = useState<Area[]>([...ALL_AREAS]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user?.gerencia && !initialized) {
      // Usuários de Manutenção inicializam na gerência operacional padrão
      const gerenciaInicial = user.gerencia === 'Manutenção'
        ? 'Recuperação e Utilidades'
        : user.gerencia;
      setSelectedGerencia(gerenciaInicial);
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
