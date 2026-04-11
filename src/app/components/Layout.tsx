import { Outlet, Link, useLocation } from 'react-router';
import { Search, Settings, LogOut, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockTags } from '../mockData';

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Contar equipamentos com nota de manutenção aberta
  const notasAbertas = mockTags.filter(tag => tag.nota_manutencao).length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Sistema TAG - Caldeira</h1>
                <p className="text-sm text-blue-100">Gestão de Equipamentos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Navigation */}
              <nav className="flex gap-2">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/'
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-500'
                  }`}
                >
                  <Search size={20} />
                  <span className="hidden sm:inline">Buscar</span>
                </Link>
                <Link
                  to="/admin"
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-500'
                  }`}
                >
                  <Settings size={20} />
                  <span className="hidden sm:inline">Gestão</span>
                  {notasAbertas > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notasAbertas}
                    </span>
                  )}
                </Link>
              </nav>

              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 border-l border-blue-500 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.nome}</p>
                  <p className="text-xs text-blue-200">{user?.cargo}</p>
                </div>
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

          {/* Alerta de Notas Abertas */}
          {notasAbertas > 0 && (
            <div className="mt-3 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">
                {notasAbertas} equipamento{notasAbertas > 1 ? 's' : ''} com nota de manutenção aberta
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Sistema TAG - Caldeira de Força © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}