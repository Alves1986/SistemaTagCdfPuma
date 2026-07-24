import { NavLink, useLocation } from 'react-router';
import { Search, BookOpen, Sparkles, Activity, Settings, Wrench, Users, User, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import * as api from '../services/api';
import { useEffect, useState } from 'react';

interface RailItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  group?: string;
}

/**
 * Dark command rail (Tactical shell) — fixed left navigation.
 * Visible on all protected routes. Industrial: square corners, mono labels,
 * active item gets a green left bar.
 */
export function CommandRail() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notasAbertas, setNotasAbertas] = useState(0);
  const isManutencao = user?.gerencia === 'Manutenção';

  useEffect(() => {
    api.getAllTags().then(tags => {
      const c = (tags || []).filter(t => t.notas_manutencao && t.notas_manutencao.length > 0).length;
      setNotasAbertas(c);
    }).catch(() => {});
  }, [location.pathname]);

  const main: RailItem[] = [
    { to: '/', label: 'CONSULTA', icon: <Search size={18} /> },
    { to: '/base-kos', label: 'BASE KOS', icon: <BookOpen size={18} /> },
    { to: '/bibliotecario', label: 'BIBLIOTECÁRIO', icon: <Sparkles size={18} />, group: 'IA' },
    { to: '/admin/dashboard', label: 'TELEMETRIA', icon: <Activity size={18} />, group: 'OPS' },
  ];

  const gestao: RailItem[] = [
    { to: '/admin', label: 'GESTÃO', icon: <Settings size={18} /> },
    { to: '/admin/manutencao', label: 'MANUTENÇÃO', icon: <Wrench size={18} /> },
    { to: '/admin/team', label: 'EQUIPE', icon: <Users size={18} /> },
    { to: '/profile', label: 'PERFIL', icon: <User size={18} /> },
  ];

  const badgeCount = notasAbertas > 99 ? '99+' : notasAbertas;

  return (
    <>
      {/* Desktop / tablet: fixed left rail (Tactical shell) */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-[#001B36] text-sidebar-foreground border-r-2 border-accent flex-col sticky top-0 h-screen tactical">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2 px-4 border-b-2 border-accent/40">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <span className="text-[#001B36] font-black text-sm leading-none">K</span>
          </div>
          <span className="text-sm font-bold tracking-[0.14em] mono text-accent">KOS</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <RailGroup label="FLUXOS">
            {main.map(item => (
              <RailLink key={item.to} item={item} badge={item.to === '/admin/manutencao' ? badgeCount : undefined} />
            ))}
          </RailGroup>
          <RailGroup label="GESTÃO">
            {gestao.map(item => (
              <RailLink key={item.to} item={item} />
            ))}
          </RailGroup>
        </nav>

        {/* Footer / user */}
        <div className="border-t-2 border-accent/40 p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[0.6rem] mono tracking-widest text-sidebar-foreground/60 uppercase truncate">
              {user?.nome || 'OPERADOR'}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-start gap-2 px-2 py-2 text-sidebar-foreground/70 hover:text-accent hover:bg-white/5 transition-colors border border-transparent hover:border-accent/40"
            title="Sair"
          >
            <LogOut size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile: bottom navigation bar (native pattern, full width) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-6 items-stretch bg-[#001B36] border-t-2 border-accent tactical pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(0,0,0,0.4)]">
        {[...main, gestao[1], gestao[3]].map(item => (
          <RailBottom item={item} key={item.to} badge={item.to === '/admin/manutencao' ? badgeCount : undefined} />
        ))}
      </nav>
    </>
  );
}

function RailBottom({ item, badge }: { item: RailItem; badge?: number | string }) {
  // Rótulos curtos p/ caber 6 itens sem espremer no mobile
  const shortLabel: Record<string, string> = {
    'BIBLIOTECÁRIO': 'IA KOS',
    'MANUTENÇÃO': 'MANUT.',
    'TELEMETRIA': 'TELEM.',
  };
  const label = shortLabel[item.label] || item.label;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center gap-1 min-h-[56px] py-1.5 px-0.5 transition-colors ${
          isActive ? 'text-accent bg-accent/10 border-t-2 border-accent -mt-0.5' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground border-t-2 border-transparent'
        }`
      }
    >
      <span className="relative">
        {item.icon}
        {badge ? (
          <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[0.55rem] font-bold leading-none min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-1 ring-1 ring-[#001B36]">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="text-[0.5rem] font-bold uppercase tracking-tight leading-none text-center truncate max-w-full">{label}</span>
    </NavLink>
  );
}

function RailGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="px-3 lg:px-4 py-1 text-[0.6rem] font-bold tracking-[0.2em] text-sidebar-foreground/40 uppercase mono hidden lg:block">
        {label}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function RailLink({ item, badge }: { item: RailItem; badge?: number | string }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `relative flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 mx-1 border-l-2 transition-colors ${
          isActive
            ? 'bg-accent/15 border-accent text-accent'
            : 'border-transparent text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground'
        }`
      }
    >
      {item.icon}
      <span className="hidden lg:inline text-xs font-bold uppercase tracking-[0.1em]">{item.label}</span>
      {badge ? (
        <span className="absolute top-1 right-1 lg:right-2 bg-destructive text-destructive-foreground text-[0.6rem] font-bold min-w-[16px] h-4 flex items-center justify-center px-0.5">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}
