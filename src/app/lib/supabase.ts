import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
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
  area?: string;
};
