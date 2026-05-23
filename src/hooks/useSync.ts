// React hook for managing sync state and operations
// Auto-triggers sync when user signs in or app comes back online

import { useState, useEffect, useCallback } from 'react';
import { syncAll, getLastSyncedAt } from '../lib/sync';
import { useAuth } from '../stores/authStore';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
  triggerSync: () => Promise<void>;
}

export function useSync(): SyncStatus {
  const { user, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load last synced timestamp on mount
  useEffect(() => {
    const timestamp = getLastSyncedAt();
    setLastSyncedAt(timestamp);
  }, []);

  // Trigger sync manually or automatically
  const triggerSync = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSyncError('Not signed in');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const results = await syncAll(user.id);

      // Check if there were any errors
      const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
      if (totalErrors > 0) {
        setSyncError(`Sync completed with ${totalErrors} error(s)`);
      }

      // Update last synced timestamp
      const timestamp = getLastSyncedAt();
      setLastSyncedAt(timestamp);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user]);

  // Auto-trigger sync when user signs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Wait a bit after sign in before syncing (let pull complete first)
      const timer = setTimeout(() => {
        triggerSync();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]); // Don't include triggerSync to avoid loops

  // Auto-trigger sync when app comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated && user) {
        console.log('App is back online, triggering sync...');
        triggerSync();
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated, user, triggerSync]);

  return {
    isSyncing,
    lastSyncedAt,
    syncError,
    triggerSync,
  };
}
