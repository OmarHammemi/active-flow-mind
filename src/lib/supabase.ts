import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jihbvsjgxzovyskmgfgr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('Supabase anon key is missing. Please add VITE_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number | null;
  location: string;
  photo_url: string | null;
  target_1: string;
  target_2: string;
  target_3: string;
  created_at: string;
  updated_at: string;
}
