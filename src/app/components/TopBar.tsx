import { useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import { GERENCIAS, normalizeGerencia } from '../utils/hierarchy';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, CloudSun } from 'lucide-react';
import { TechLabel } from './ui/TechLabel';

const SECTION_TITLES: Record<string, string> = {
  '/': 'CONSULTA // SISTEMA TAG',
  '/base-kos': 'BASE KOS // CONHECIMENTO TÉCNICO',
  '/bibliotecario': 'BIBLIOTECÁRIO // IA KOS',
  '/admin': 'GESTÃO',
  '/admin/dashboard': 'TELEMETRIA // OPS',
  '/admin/manutencao': 'MANUTENÇÃO',
  '/admin/team': 'EQUIPE',
  '/profile': 'PERFIL',
};

/**
 * Context topbar (Swiss/light) — section title + gerencia/area filters + profile.
 * Extracted from the former Layout.tsx.
 */
export function TopBar() {
  const location = useLocation();
  const { user } = useAuth();
  const { selectedGerencia, setSelectedGerencia, selectedArea, setSelectedArea, areas } = useArea();
  const [showG, setShowG] = useState(false);
  const [showA, setShowA] = useState(false);
  const gRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const isManutencao = user?.gerencia === 'Manutenção';
  const canChange = user?.cargo && !['Operador Lider', 'Operador III', 'Operador II'].includes(user.cargo);

  const title = SECTION_TITLES[location.pathname] || 'SISTEMA TAG';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (gRef.current && !gRef.current.contains(e.target as Node)) setShowG(false);
      if (aRef.current && !aRef.current.contains(e.target as Node)) setShowA(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-2 border-primary">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="text-sm lg:text-base font-bold uppercase tracking-[0.05em] text-primary truncate mono">
            {title}
          </h1>
          <TechLabel className="hidden md:inline">REV 2.6</TechLabel>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          {/* Filters */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative" ref={gRef}>
              <button
                onClick={() => canChange && setShowG(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/5 transition-colors"
              >
                <span>{selectedGerencia}</span>
                {canChange && <ChevronDown size={13} className={showG ? 'rotate-180' : ''} />}
              </button>
              {canChange && showG && (
                <div className="absolute right-0 top-full mt-1.5 bg-card border-2 border-border shadow-[var(--shadow-hard)] z-50 min-w-[200px]">
                  {(isManutencao ? GERENCIAS : [user?.gerencia ? normalizeGerencia(user.gerencia) : selectedGerencia]).map(g => (
                    <button key={g} onClick={() => { setSelectedGerencia(g); setShowG(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted ${selectedGerencia === g ? 'text-primary font-semibold bg-primary/5' : ''}`}>
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={aRef}>
              <button
                onClick={() => canChange && setShowA(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/5 transition-colors"
              >
                <span>{selectedArea}</span>
                {canChange && <ChevronDown size={13} className={showA ? 'rotate-180' : ''} />}
              </button>
              {canChange && showA && (
                <div className="absolute right-0 top-full mt-1.5 bg-card border-2 border-border shadow-[var(--shadow-hard)] z-50 min-w-[140px]">
                  {areas.map(a => (
                    <button key={a} onClick={() => { setSelectedArea(a); setShowA(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted ${selectedArea === a ? 'text-primary font-semibold bg-primary/5' : ''}`}>
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weather */}
          <div className="hidden lg:flex items-center gap-2 px-3 border-l-2 border-primary/20 text-primary/80">
            <CloudSun size={18} />
            <div className="leading-tight">
              <p className="text-xs font-bold">24°C</p>
              <p className="text-[0.6rem] uppercase mono">Ortigueira</p>
            </div>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-3 border-l-2 border-primary/20">
            <div className="w-7 h-7 border border-primary/30 flex items-center justify-center bg-primary/5 text-primary overflow-hidden">
              {user?.foto_url ? <img src={user.foto_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{user?.nome?.[0] || 'U'}</span>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
