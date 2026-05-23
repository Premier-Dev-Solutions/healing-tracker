// Authentication state management using React Context
// Provides global auth state and helpers throughout the app

import { createContext, useContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
});

/**
 * Hook to access authentication state from any component
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
