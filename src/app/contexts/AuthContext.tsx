import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (dados: {
    nome: string;
    prn: string;
    cargo: string;
    email: string;
    senha: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadProfile(userId: string, email: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, prn, cargo')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return { ...data, email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email ?? '');
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email ?? '');
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      const msg = error.message.includes('Invalid login') || error.message.includes('invalid')
        ? 'E-mail ou senha inválidos'
        : error.message.includes('Email not confirmed')
        ? 'Confirme seu e-mail antes de entrar'
        : error.message;
      return { success: false, error: msg };
    }
    return { success: true };
  };

  const register = async (dados: {
    nome: string;
    prn: string;
    cargo: string;
    email: string;
    senha: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Envia nome, prn e cargo como metadados — um trigger SQL cria o perfil automaticamente
    const { error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: {
          nome: dados.nome,
          prn: dados.prn,
          cargo: dados.cargo,
        },
      },
    });

    if (error) {
      const msg = error.message.includes('already registered')
        ? 'Este e-mail já está cadastrado'
        : error.message.includes('Password should')
        ? 'A senha deve ter pelo menos 6 caracteres'
        : error.message;
      return { success: false, error: msg };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
