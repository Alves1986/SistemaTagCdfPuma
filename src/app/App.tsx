import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { useEffect } from 'react';
import { initializeLocalData } from './utils/initializeData';

export default function App() {
  useEffect(() => {
    // Inicializar dados locais na primeira carga
    initializeLocalData();
  }, []);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}