// Sync status indicator for the app header
// Shows "Local only" when not signed in, or user email + sync status when signed in

import { CloudOff, Cloud, User, Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { useSync } from '../hooks/useSync';
import { signOut } from '../lib/auth';

interface SyncStatusProps {
  onSignInClick?: () => void;
}

export function SyncStatus({ onSignInClick }: SyncStatusProps) {
  const { user, isLoading } = useAuth();
  const { isSyncing, lastSyncedAt, syncError, triggerSync } = useSync();

  // Hide completely if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Show loading state briefly during initialization
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Cloud className="w-4 h-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  // Not signed in - show "Local only" with sign in prompt
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CloudOff className="w-4 h-4" />
          <span className="hidden sm:inline">Local only</span>
        </div>
        <button
          onClick={onSignInClick}
          className="text-sm text-green-600 hover:text-green-700 font-medium underline"
        >
          Sign in to sync
        </button>
      </div>
    );
  }

  // Helper to format "X minutes ago"
  const getTimeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    // Auth state change will be handled by AuthProvider automatically
  };

  // Signed in - show user email and sync status
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <User className="w-3 h-3" />
        <span className="hidden sm:inline">{user.email}</span>
      </div>

      {/* Syncing state */}
      {isSyncing && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="hidden sm:inline">Syncing...</span>
        </div>
      )}

      {/* Sync error state */}
      {!isSyncing && syncError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{syncError}</span>
        </div>
      )}

      {/* Synced state */}
      {!isSyncing && !syncError && lastSyncedAt && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Cloud className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">
            Synced {getTimeSince(lastSyncedAt)}
          </span>
        </div>
      )}

      {/* No sync yet */}
      {!isSyncing && !syncError && !lastSyncedAt && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Cloud className="w-4 h-4" />
          <span className="hidden sm:inline">Not synced yet</span>
        </div>
      )}

      {/* Manual sync button */}
      <button
        onClick={triggerSync}
        disabled={isSyncing}
        className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
        title="Sync now"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        <span className="hidden md:inline">Sync now</span>
      </button>

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        title="Sign out"
      >
        <LogOut className="w-3 h-3" />
        <span className="hidden md:inline">Sign out</span>
      </button>
    </div>
  );
}
