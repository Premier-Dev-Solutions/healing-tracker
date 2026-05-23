// Authentication helper functions for Heal From It
// Wraps Supabase auth with typed results and graceful error handling

import { supabase, isSupabaseConfigured } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Result types for auth operations
export type AuthResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export type AuthStateCallback = (user: User | null, session: Session | null) => void;

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResult<User | null>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase not configured. Please add your credentials to .env.local'
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // If Supabase returns an actual error, that's a failure
    if (error) {
      return { success: false, error: error.message };
    }

    // If no user and no session, email confirmation is required (success case)
    if (!data.user && !data.session) {
      return {
        success: true,
        data: null,
        message: 'Check your email to confirm your account'
      };
    }

    // If user is returned immediately, that's also success (no confirmation required)
    if (data.user) {
      return { success: true, data: data.user };
    }

    // Fallback error (shouldn't normally reach here)
    return { success: false, error: 'Sign up failed - unexpected response' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during sign up'
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult<Session>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase not configured. Please add your credentials to .env.local'
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.session) {
      return { success: false, error: 'Sign in failed - no session returned' };
    }

    return { success: true, data: data.session };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during sign in'
    };
  }
}

/**
 * Sign out the current user and clear their session
 */
export async function signOut(): Promise<AuthResult<void>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase not configured. Please add your credentials to .env.local'
    };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during sign out'
    };
  }
}

/**
 * Get the currently authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error.message);
      return null;
    }

    return user;
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 * Returns an unsubscribe function
 */
export function onAuthStateChange(callback: AuthStateCallback): () => void {
  if (!isSupabaseConfigured()) {
    // Call callback with null immediately to indicate no user
    callback(null, null);
    // Return a no-op unsubscribe function
    return () => {};
  }

  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null, session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  } catch (err) {
    console.error('Error subscribing to auth state changes:', err);
    callback(null, null);
    return () => {};
  }
}

/**
 * Send a password reset email to the user
 */
export async function resetPassword(email: string): Promise<AuthResult<void>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase not configured. Please add your credentials to .env.local'
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error sending password reset email'
    };
  }
}
