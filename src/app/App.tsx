import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { AreaProvider } from './contexts/AreaContext';
import { useEffect } from 'react';
import { initializeLocalData } from './utils/initializeData';
import { InstallPrompt } from './components/InstallPrompt';

export default function App() {
  useEffect(() => {
    initializeLocalData();
  }, []);

  return (
    <AuthProvider>
      <AreaProvider>
        <InstallPrompt />
        <RouterProvider router={router} />
      </AreaProvider>
    </AuthProvider>
  );
}