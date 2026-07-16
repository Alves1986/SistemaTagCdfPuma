import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Search, Settings, LogOut, User, AlertTriangle, Flame, ChevronDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedArea, setSelectedArea, areas } = useArea();
  const [notasAbertas, setNotasAbertas] = useState(0);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotasCount();
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target as Node)) {
        setShowAreaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotasCount = async () => {
    try {
      const tags = await api.getAllTags();
      const count = tags.filter(tag => tag.nota_manutencao).length;
      setNotasAbertas(count);
    } catch (error) {
      console.error('Erro ao carregar contagem de notas:', error);
    }
  };

  const handleAlertBarClick = () => {
    navigate('/admin?filter=com_nota');
  };

  const badgeCount = notasAbertas > 99 ? '99+' : notasAbertas;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-primary via-primary to-[#002040] shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm shadow-sm border border-white/20">
                <img src="/logo.svg" alt="Klabin Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-[0.95rem] tracking-wide text-primary-foreground font-bold drop-shadow-sm">
                  KLABIN · SISTEMA TAG
                </div>
                <div className="text-[0.7rem] tracking-[0.2em] text-primary-foreground/80 uppercase font-medium">
                  {user?.area || 'OPERAÇÕES INDUSTRIAIS'}
                </div>
              </div>
            </div>

            {/* Area selector */}
            <div className="relative flex-shrink-0" ref={areaDropdownRef}>
              <button
                onClick={() => setShowAreaDropdown(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-foreground/30 text-primary-foreground/90 text-sm font-medium transition-colors hover:bg-white/10 hover:border-primary-foreground/50"
              >
                <span>{selectedArea}</span>
                <ChevronDown size={13} className={`transition-transform duration-150 ${showAreaDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showAreaDropdown && (
                <div className="absolute left-0 top-full mt-1.5 bg-card rounded border border-border shadow-lg z-50 min-w-[140px]">
                  {areas.map(area => (
                    <button
                      key={area}
                      onClick={() => { setSelectedArea(area); setShowAreaDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                        selectedArea === area ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Center nav */}
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-150 text-sm font-medium ${
                  location.pathname === '/'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10'
                }`}
              >
                <Search size={16} />
                <span className="hidden sm:inline">Buscar</span>
              </Link>
              <Link
                to="/admin"
                className={`relative flex items-center gap-2 px-4 py-2 rounded transition-all duration-150 text-sm font-medium ${
                  location.pathname === '/admin'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10'
                }`}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Gestão</span>
                {notasAbertas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[0.6rem] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow-sm">
                    {badgeCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Right: user + logout */}
            <div className="flex items-center gap-3">
              <Link to="/profile" className="hidden md:flex items-center gap-2 pr-3 border-r border-primary-foreground/20 hover:opacity-80 transition-opacity" title="Meu Perfil">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-primary-foreground/10 text-primary-foreground overflow-hidden">
                  {user?.foto_url ? (
                    <img src={user.foto_url} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <User size={15} />
                  )}
                </div>
                <div className="leading-tight">
                  <p className="text-primary-foreground text-sm font-medium leading-none">{user?.nome}</p>
                  <p className="text-xs mt-0.5 text-primary-foreground/70">{user?.cargo}</p>
                </div>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                title="Sair"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance alert bar — clicável */}
        {notasAbertas > 0 && (
          <button
            onClick={handleAlertBarClick}
            className="w-full border-t flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 transition-colors text-left group"
          >
            <div className="max-w-7xl mx-auto w-full flex items-center gap-2 sm:px-6 lg:px-8">
              <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
              <span className="text-sm text-amber-500 font-medium flex-1">
                <span className="font-bold">{notasAbertas}</span>{' '}
                equipamento{notasAbertas > 1 ? 's' : ''} com nota de manutenção aberta
              </span>
              <ArrowRight size={14} className="text-amber-500 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>
            Sistema TAG — {user?.area || 'Operações Industriais'} © {new Date().getFullYear()} <span className="hidden sm:inline">|</span> Criado por Anderson Alves
          </p>
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            KLABIN S/A
          </span>
        </div>
      </footer>
    </div>
  );
}
