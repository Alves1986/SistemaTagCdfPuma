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

      // Define as áreas visíveis a partir do que o usuário selecionou no cadastro
      const areasDoUsuario = user.areas_coordenadas?.length
        ? user.areas_coordenadas
        : getAreasByGerencia(normalized);   // fallback: todas da gerência

      setAvailableAreas(areasDoUsuario);
      setSelectedArea(areasDoUsuario[0] ?? '');
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => {
    // Quando muda a gerência manualmente no header, recarrega as áreas da gerência
    // (Não executa na inicialização, pois areas_coordenadas já foram definidas no effect acima)
    if (!initialized) return;
    const newAreas = user?.areas_coordenadas?.length && user.gerencia && normalizeGerencia(user.gerencia) === selectedGerencia
      ? user.areas_coordenadas
      : getAreasByGerencia(selectedGerencia);
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
