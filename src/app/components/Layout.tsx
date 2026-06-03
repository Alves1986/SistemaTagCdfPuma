import { Outlet, Link, useLocation } from 'react-router';
import { Search, Settings, LogOut, User, AlertTriangle, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import * as api from '../services/api';

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notasAbertas, setNotasAbertas] = useState(0);

  useEffect(() => {
    loadNotasCount();
  }, [location.pathname]);

  const loadNotasCount = async () => {
    try {
      const tags = await api.getAllTags();
      const count = tags.filter(tag => tag.nota_manutencao).length;
      setNotasAbertas(count);
    } catch (error) {
      console.error('Erro ao carregar contagem de notas:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F4F5F7' }}>
      {/* Top bar */}
      <header style={{ backgroundColor: '#003865' }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 flex items-center justify-center rounded"
                style={{ backgroundColor: '#00A551' }}
              >
                <Flame size={20} className="text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-white font-semibold tracking-wide" style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                  KLABIN · SISTEMA TAG
                </div>
                <div style={{ color: '#7ab3d4', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  CALDEIRA DE FORÇA
                </div>
              </div>
            </div>

            {/* Center nav */}
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-150 text-sm font-medium ${
                  location.pathname === '/'
                    ? 'text-white'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
                style={location.pathname === '/' ? { backgroundColor: '#00A551' } : {}}
              >
                <Search size={16} />
                <span className="hidden sm:inline">Buscar</span>
              </Link>
              <Link
                to="/admin"
                className={`relative flex items-center gap-2 px-4 py-2 rounded transition-all duration-150 text-sm font-medium ${
                  location.pathname === '/admin'
                    ? 'text-white'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
                style={location.pathname === '/admin' ? { backgroundColor: '#00A551' } : {}}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Gestão</span>
                {notasAbertas > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ backgroundColor: '#e74c3c', fontSize: '0.6rem' }}
                  >
                    {notasAbertas > 9 ? '9+' : notasAbertas}
                  </span>
                )}
              </Link>
            </nav>

            {/* Right: user + logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 pr-3 border-r border-white/20">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white"
                  style={{ backgroundColor: '#004f8b' }}
                >
                  <User size={15} />
                </div>
                <div className="leading-tight">
                  <p className="text-white text-sm font-medium leading-none">{user?.nome}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7ab3d4' }}>{user?.cargo}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors text-blue-200 hover:text-white hover:bg-white/10"
                title="Sair"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance alert bar */}
        {notasAbertas > 0 && (
          <div
            className="border-t flex items-center gap-2 px-4 py-2"
            style={{ backgroundColor: '#7a2000', borderColor: '#a83000' }}
          >
            <div className="max-w-7xl mx-auto w-full flex items-center gap-2 sm:px-6 lg:px-8">
              <AlertTriangle size={15} className="text-orange-300 flex-shrink-0" />
              <span className="text-sm text-orange-200">
                <span className="font-semibold">{notasAbertas}</span>{' '}
                equipamento{notasAbertas > 1 ? 's' : ''} com nota de manutenção aberta
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white" style={{ borderColor: '#D1D5DB' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-xs" style={{ color: '#5A5A5A' }}>
            Sistema TAG — Caldeira de Força © {new Date().getFullYear()}
          </span>
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#003865' }}
          >
            KLABIN S/A
          </span>
        </div>
      </footer>
    </div>
  );
}
