import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  nome: string;
  cargo: string;
  prn: string;
}

interface AuthContextType {
  user: User | null;
  login: (nome: string, prn: string) => boolean;
  logout: () => void;
  register: (nome: string, prn: string, cargo: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const login = (nome: string, prn: string): boolean => {
    const foundUser = users.find(
      (u) => u.nome.toLowerCase() === nome.toLowerCase() && u.prn === prn
    );

    if (foundUser) {
      const userData = { id: foundUser.id, nome: foundUser.nome, cargo: foundUser.cargo, prn: foundUser.prn };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = (nome: string, prn: string, cargo: string): boolean => {
    // Verificar se já existe usuário com esse nome
    const existingUser = users.find(
      (u) => u.nome.toLowerCase() === nome.toLowerCase()
    );

    if (existingUser) {
      return false;
    }

    // Criar novo usuário
    const newUser: User = {
      id: users.length + 1,
      nome,
      prn,
      cargo
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Fazer login automaticamente
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));

    return true;
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