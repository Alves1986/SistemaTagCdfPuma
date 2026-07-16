import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { SearchPage } from './components/SearchPage';
import { TagDetailPage } from './components/TagDetailPage';
import { AdminPage } from './components/AdminPage';
import { TeamPage } from './components/TeamPage';
import { ProfilePage } from './components/ProfilePage';
import { DashboardPage } from './components/DashboardPage';
import { MaintenanceDashboard } from './components/MaintenanceDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, Component: SearchPage },
      { path: 'tag/:id', Component: TagDetailPage },
      { path: 'admin', Component: AdminPage },
      { path: 'admin/team', Component: TeamPage },
      { path: 'admin/dashboard', Component: DashboardPage },
      { path: 'admin/manutencao', Component: MaintenanceDashboard },
      { path: 'profile', Component: ProfilePage },
    ],
  },
]);