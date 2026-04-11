import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { SearchPage } from './components/SearchPage';
import { TagDetailPage } from './components/TagDetailPage';
import { AdminPage } from './components/AdminPage';
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
    ],
  },
]);