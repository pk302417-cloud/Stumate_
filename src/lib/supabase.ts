import { config } from '@/config';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  // Placeholders keep demo mode (VITE_USE_MOCKS=true) from crashing when no .env exists.
  config.supabaseUrl || 'http://localhost:54321',
  config.supabaseAnonKey || 'demo-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
