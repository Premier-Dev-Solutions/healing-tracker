// Supabase client initialization for Heal From It
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Check if Supabase is configured with valid credentials
 * Returns true only if both URL and anon key are present and valid
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://xxxx.supabase.co' &&
    !supabaseAnonKey.includes('your_full_key_here')
  );
};

/**
 * Supabase client instance
 * Will be initialized with placeholder values if credentials are not configured
 * Check isSupabaseConfigured() before using for sync operations
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
