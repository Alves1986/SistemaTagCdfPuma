import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

import { getAreasByGerencia, normalizeGerencia, getAllOperationalAreas, Area } from '../utils/hierarchy';

// Derivado dinamicamente do HIERARQUIA (excluindo Manutenção)
export const ALL_AREAS = getAllOperationalAreas();

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
      const normalized = raw === 'Manutenção'
        ? 'Recuperação e Utilidades'
        : normalizeGerencia(raw);
      setSelectedGerencia(normalized);

      // Limpa áreas legadas inválidas
      const validAreas = getAllOperationalAreas();
      const userAreas = (user.areas_coordenadas || []).filter(a => validAreas.includes(a as Area)) as Area[];
      
      // Define as áreas visíveis ESTRITAMENTE para o que o usuário tem cadastrado
      let areasDoUsuario: Area[] = [];
      if (userAreas.length === 0) {
        // Fallback apenas caso o cadastro antigo esteja totalmente quebrado
        areasDoUsuario = [getAreasByGerencia(normalized)[0]];
      } else {
        areasDoUsuario = userAreas;
      }

      setAvailableAreas(areasDoUsuario);
      setSelectedArea(areasDoUsuario[0]);
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    if (!initialized) return;

    const validAreas = getAllOperationalAreas();
    const userAreas = (user?.areas_coordenadas || []).filter(a => validAreas.includes(a as Area)) as Area[];
    
    // Novamente, respeitando ESTRITAMENTE o cadastro do usuário
    let newAreas: Area[] = userAreas.length > 0 ? userAreas : [getAreasByGerencia(selectedGerencia)[0]];
    
    setAvailableAreas(newAreas);

    // Se a área atual não está na nova lista, muda para a primeira
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
