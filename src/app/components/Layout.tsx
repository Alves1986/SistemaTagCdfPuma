import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Search, Settings, LogOut, User, AlertTriangle, Flame, ChevronDown, ArrowRight, Wrench, Activity, CloudSun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useArea } from '../contexts/AreaContext';
import { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { GERENCIAS, normalizeGerencia } from '../utils/hierarchy';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { selectedGerencia, setSelectedGerencia, selectedArea, setSelectedArea, areas } = useArea();
  const [notasAbertas, setNotasAbertas] = useState(0);
  const [showGerenciaDropdown, setShowGerenciaDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const gerenciaDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const isManutencao = user?.gerencia === 'Manutenção';

  useEffect(() => {
    loadNotasCount();
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target as Node)) {
        setShowAreaDropdown(false);
      }
      if (gerenciaDropdownRef.current && !gerenciaDropdownRef.current.contains(e.target as Node)) {
        setShowGerenciaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotasCount = async () => {
    try {
      const tags = await api.getAllTags();
      const count = tags.filter(tag => tag.notas_manutencao && tag.notas_manutencao.length > 0).length;
      setNotasAbertas(count);
    } catch (error) {
      console.error('Erro ao carregar contagem de notas:', error);
    }
  };

  const handleAlertBarClick = () => {
    if (isManutencao) {
      navigate('/admin/manutencao');
    } else {
      navigate('/admin?filter=com_nota');
    }
  };

  const badgeCount = notasAbertas > 99 ? '99+' : notasAbertas;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-primary via-primary to-[#002040] shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 py-3 w-full">
            {/* Brand */}
            <div className="flex items-center gap-3 flex-shrink-0 w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm shadow-sm border border-white/20">
                  <img src="/logo.svg" alt="Klabin Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
                </div>
                <div className="leading-tight">
                  <div className="text-[0.95rem] tracking-wide text-primary-foreground font-bold drop-shadow-sm">
                    SISTEMA TAG
                  </div>
                  <div className="text-[0.7rem] tracking-[0.2em] text-primary-foreground/80 uppercase font-medium mt-0.5">
                    {user?.coordenacao || user?.areas_coordenadas?.[0] || user?.area || 'OPERAÇÕES INDUSTRIAIS'}
                  </div>
                </div>
              </div>
              
              {/* Right: user + logout on mobile (moved up) */}
              <div className="flex sm:hidden items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Meu Perfil">
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-primary-foreground/10 text-primary-foreground overflow-hidden flex-shrink-0">
                    {user?.foto_url ? (
                      <img src={user.foto_url} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User size={15} />
                    )}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            {/* Filters container */}
            <div className="flex flex-row items-center justify-center gap-2 flex-shrink-0 w-auto order-3 sm:order-none">
              
              {/* Gerencia selector */}
              <div className="relative flex-shrink-0" ref={gerenciaDropdownRef}>
                <button
                  onClick={() => setShowGerenciaDropdown(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-foreground/30 text-primary-foreground/90 text-sm font-medium transition-colors hover:bg-white/10 hover:border-primary-foreground/50"
                >
                  <span>{selectedGerencia}</span>
                  <ChevronDown size={13} className={`transition-transform duration-150 ${showGerenciaDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showGerenciaDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 bg-card rounded border border-border shadow-lg z-50 min-w-[200px]">
                    {(isManutencao ? GERENCIAS : [user?.gerencia ? normalizeGerencia(user.gerencia) : selectedGerencia]).map(gerencia => (
                      <button
                        key={gerencia}
                        onClick={() => { setSelectedGerencia(gerencia); setShowGerenciaDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                          selectedGerencia === gerencia ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                        }`}
                      >
                        {gerencia}
                      </button>
                    ))}
                  </div>
                )}
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
            </div>

            {/* Center nav */}
            <nav className="flex items-center justify-center gap-1 w-auto lg:flex-shrink-0">
              {!isManutencao && (
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
              )}
              {!isManutencao && (
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
                </Link>
              )}
              
              <Link
                to="/admin/manutencao"
                className={`relative flex items-center gap-2 px-4 py-2 rounded transition-all duration-150 text-sm font-medium ${
                  location.pathname === '/admin/manutencao'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10'
                }`}
              >
                <Wrench size={16} />
                <span className="hidden sm:inline">Notas Abertas</span>
                {notasAbertas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[0.6rem] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 shadow-sm">
                    {badgeCount}
                  </span>
                )}
              </Link>
            </nav>

            <div className="hidden sm:flex items-center gap-2 lg:gap-4 lg:flex-shrink-0">
              {/* Weather Placeholder */}
              <div className="flex items-center gap-2 pr-4 border-r border-primary-foreground/20 text-primary-foreground/80 hover:text-primary-foreground transition-colors cursor-pointer" title="Previsão do Tempo (Em breve)">
                <CloudSun size={18} />
                <div className="leading-tight hidden lg:block">
                  <p className="text-xs font-semibold">24°C</p>
                  <p className="text-[0.65rem]">Ortigueira</p>
                </div>
              </div>
              
              <Link to="/profile" className="flex items-center gap-2 pr-3 border-r border-primary-foreground/20 hover:opacity-80 transition-opacity" title="Meu Perfil">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-primary-foreground/10 text-primary-foreground overflow-hidden flex-shrink-0">
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
                className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium hidden md:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full">
            <Outlet />
          </div>
          
          {/* Right Sidebar Dashboard */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 sticky top-6">
            <div className="bg-card rounded-lg border border-border shadow-sm p-5">
               <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                 <Activity size={16} />
                 Visão da Área
               </h3>
               <p className="text-xs text-muted-foreground mb-4">
                 Resumo operacional diário. Integração com IA para leitura da programação semanal em breve.
               </p>
               <div className="space-y-3">
                 <div className="bg-muted/50 border border-border p-3 rounded-md flex justify-between items-center">
                   <p className="text-xs text-muted-foreground uppercase font-semibold">Saúde dos Equipamentos</p>
                   <p className="text-lg font-bold text-green-600">95%</p>
                 </div>
                 <div className="bg-muted/50 border border-border p-3 rounded-md flex justify-between items-center">
                   <p className="text-xs text-muted-foreground uppercase font-semibold">Notas Abertas</p>
                   <p className="text-lg font-bold text-destructive">{notasAbertas}</p>
                 </div>
                 <div className="bg-primary/5 border border-primary/20 p-3 rounded-md mt-2">
                   <p className="text-xs text-primary uppercase font-semibold mb-1">Próxima Manutenção</p>
                   <p className="text-sm font-medium text-foreground">Caldeira - Parada Geral (15/08)</p>
                 </div>
               </div>
            </div>
          </aside>
        </div>
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
