import { createContext, useContext, useState, ReactNode } from 'react';
import * as api from '../services/api';

interface User {
  id: string;
  nome: string;
  cargo: string;
  prn: string;
}

interface AuthContextType {
  user: User | null;
  login: (nome: string, prn: string) => Promise<boolean>;
  logout: () => void;
  register: (nome: string, prn: string, cargo: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (nome: string, prn: string): Promise<boolean> => {
    try {
      const response = await api.login(nome, prn);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const register = async (nome: string, prn: string, cargo: string): Promise<boolean> => {
    try {
      const response = await api.register(nome, prn, cargo);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}