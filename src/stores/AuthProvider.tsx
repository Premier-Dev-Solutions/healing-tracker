// AuthProvider component - manages authentication state for the app
// Subscribes to Supabase auth changes and provides state to all children

import { useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { AuthContext } from './authStore';
import { getCurrentUser, onAuthStateChange } from '../lib/auth';
import { pullFromSupabase } from '../lib/sync';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPullingData, setIsPullingData] = useState(false);

  useEffect(() => {
    // Get initial user state
    getCurrentUser()
      .then(async (currentUser) => {
        if (currentUser) {
          // User is already signed in, pull their data from Supabase if needed
          setIsPullingData(true);
          try {
            await pullFromSupabase(currentUser.id);
          } catch (err) {
            console.error('Error pulling data on initial load:', err);
          } finally {
            setIsPullingData(false);
          }
        }
        setUser(currentUser);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error getting initial user:', err);
        setIsLoading(false);
      });

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (newUser, newSession) => {
      const wasSignedOut = user && !newUser;
      const justSignedIn = !user && newUser;

      // If user just signed in, pull their data from Supabase
      if (justSignedIn && newUser) {
        setIsPullingData(true);
        try {
          await pullFromSupabase(newUser.id);
        } catch (err) {
          console.error('Error pulling data after sign in:', err);
        } finally {
          setIsPullingData(false);
        }
      }

      setUser(newUser);
      setSession(newSession);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []); // Keep empty dependency array to avoid re-running on user change

  const value = {
    user,
    session,
    isLoading: isLoading || isPullingData, // Show loading while pulling data
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {isPullingData ? (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Loading your data...</p>
            <p className="text-sm text-gray-500 mt-2">Syncing from cloud</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
