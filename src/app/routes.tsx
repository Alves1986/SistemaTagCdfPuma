import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { CommandShell } from './components/CommandShell';
import { SearchPage } from './components/SearchPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Code-splitting por rota: cada página vira um chunk sob demanda
const TagDetailPage = lazy(() => import('./components/TagDetailPage').then(m => ({ default: m.TagDetailPage })));
const AdminPage = lazy(() => import('./components/AdminPage').then(m => ({ default: m.AdminPage })));
const MaintenanceDashboard = lazy(() => import('./components/MaintenanceDashboard').then(m => ({ default: m.MaintenanceDashboard })));
const TeamPage = lazy(() => import('./components/TeamPage').then(m => ({ default: m.TeamPage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DashboardPage = lazy(() => import('./components/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BaseKosPage = lazy(() => import('./components/BaseKosPage').then(m => ({ default: m.BaseKosPage })));
const BibliotecarioPage = lazy(() => import('./components/BibliotecarioPage').then(m => ({ default: m.BibliotecarioPage })));

const ProtectedLayout = () => (
  <ProtectedRoute>
    <CommandShell />
  </ProtectedRoute>
);

// Fallback de carregamento no padrão industrial
const RouteFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[40vh]">
    <div className="flex items-center gap-3 text-accent mono text-xs uppercase tracking-widest">
      <span className="w-4 h-4 border-2 border-accent border-t-transparent animate-spin inline-block"></span>
      CARREGANDO MÓDULO...
    </div>
  </div>
);

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, Component: SearchPage },
      { path: 'tag/:id', Component: () => <Lazy><TagDetailPage /></Lazy> },
      { path: 'base-kos', Component: () => <Lazy><BaseKosPage /></Lazy> },
      { path: 'bibliotecario', Component: () => <Lazy><BibliotecarioPage /></Lazy> },
      { path: 'admin', Component: () => <Lazy><AdminPage /></Lazy> },
      { path: 'admin/team', Component: () => <Lazy><TeamPage /></Lazy> },
      { path: 'admin/dashboard', Component: () => <Lazy><DashboardPage /></Lazy> },
      { path: 'admin/manutencao', Component: () => <Lazy><MaintenanceDashboard /></Lazy> },
      { path: 'profile', Component: () => <Lazy><ProfilePage /></Lazy> },
    ],
  },
]);
