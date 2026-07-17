import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO CRÍTICO: Variáveis de ambiente do Supabase ausentes! Verifique o Vercel ou o arquivo .env");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export type UserProfile = {
  id: string;
  nome: string;
  prn: string;
  cargo: string;
  email: string;
  foto_url?: string;
  whatsapp?: string;
  gerencia?: string;
  coordenacao?: string;
  area?: string;                    // área principal (compat. legada)
  areas_coordenadas?: string[];     // áreas selecionadas pelo usuário no cadastro
};
