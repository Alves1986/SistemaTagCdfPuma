import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
