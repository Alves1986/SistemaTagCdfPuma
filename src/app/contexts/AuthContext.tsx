import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  register: (dados: {
    nome: string;
    prn: string;
    cargo: string;
    gerencia: string;
    area: string;
    email: string;
    senha: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constrói perfil a partir dos metadados do Supabase Auth (fonte de verdade primária)
function buildProfileFromAuthUser(supabaseUser: SupabaseUser): UserProfile {
  const meta = supabaseUser.user_metadata ?? {};
  return {
    id: supabaseUser.id,
    nome: meta.nome ?? meta.full_name ?? supabaseUser.email?.split('@')[0] ?? 'Operador',
    prn: meta.prn ?? '0000',
    cargo: meta.cargo ?? 'Operador II',
    gerencia: meta.gerencia ?? '',
    area: meta.area ?? '',
    email: supabaseUser.email ?? '',
  };
}

// Tenta enriquecer com dados da tabela profiles; se falhar, usa metadados
async function resolveProfile(supabaseUser: SupabaseUser): Promise<UserProfile> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, prn, cargo, foto_url, whatsapp, gerencia, area')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (data) {
      return { ...data, email: supabaseUser.email ?? '' };
    }
  } catch {
    // Tabela não existe ou erro de rede — usa fallback
  }

  return buildProfileFromAuthUser(supabaseUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const profile = await resolveProfile(session.user);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await resolveProfile(session.user);
        if (mounted) setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Atualiza silenciosamente em caso de renovação de token
        const profile = await resolveProfile(session.user);
        if (mounted) setUser(profile);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      let msg = 'Erro ao fazer login. Tente novamente.';
      const e = (error.message || '').toLowerCase();
      if (e.includes('invalid') || e.includes('credentials')) {
        msg = 'E-mail ou senha inválidos';
      } else if (e.includes('not confirmed')) {
        msg = 'Confirme seu e-mail antes de entrar.';
      } else if (e.includes('too many')) {
        msg = 'Muitas tentativas. Aguarde e tente novamente.';
      } else if (e.includes('fetch') || e.includes('network') || !import.meta.env.VITE_SUPABASE_URL) {
        msg = 'Erro de conexão. Verifique as variáveis de ambiente na Vercel.';
      }
      return { success: false, error: msg };
    }

    // Garante que o user é setado imediatamente (sem esperar onAuthStateChange)
    if (data.user) {
      const profile = await resolveProfile(data.user);
      setUser(profile);
    }

    return { success: true };
  };

  const register = async (dados: {
    nome: string;
    prn: string;
    cargo: string;
    gerencia: string;
    area: string;
    email: string;
    senha: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: {
          nome: dados.nome,
          prn: dados.prn,
          cargo: dados.cargo,
          gerencia: dados.gerencia,
          area: dados.area,
        },
      },
    });

    if (error) {
      let msg = 'Erro ao criar conta. Tente novamente.';
      const e = error.message.toLowerCase();
      if (e.includes('already registered') || e.includes('already been registered')) {
        msg = 'Este e-mail já está cadastrado';
      } else if (e.includes('password')) {
        msg = 'A senha deve ter pelo menos 6 caracteres';
      } else if (e.includes('email')) {
        msg = 'Informe um e-mail válido';
      }
      return { success: false, error: msg };
    }

    // Se confirmação desabilitada, o usuário já está logado — set profile diretamente
    if (data.session?.user) {
      const profile = buildProfileFromAuthUser(data.session.user);
      setUser(profile);
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
