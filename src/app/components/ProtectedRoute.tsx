import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { Flame } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <img src="/logo.svg" alt="Klabin Logo" className="h-10 w-auto object-contain" />
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Verificando sessão…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
