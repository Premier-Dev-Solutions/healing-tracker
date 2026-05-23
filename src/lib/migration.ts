// Migration utility to move data from localStorage to IndexedDB
import * as idb from './indexedDB';

const MIGRATION_KEY = 'migrated_to_indexeddb';

interface LocalStorageData {
  journalEntries?: any[];
  testingReminders?: any[];
  herbInventory?: any[];
  dailyRoutines?: Record<string, any>;
}

/**
 * Check if migration has already been completed
 */
export const isMigrationComplete = (): boolean => {
  return localStorage.getItem(MIGRATION_KEY) === 'true';
};

/**
 * Mark migration as complete
 */
const markMigrationComplete = (): void => {
  localStorage.setItem(MIGRATION_KEY, 'true');
};

/**
 * Extract all localStorage data
 */
const extractLocalStorageData = (): LocalStorageData => {
  const data: LocalStorageData = {};

  // Get journal entries
  const journalEntriesStr = localStorage.getItem('journalEntries');
  if (journalEntriesStr) {
    try {
      data.journalEntries = JSON.parse(journalEntriesStr);
    } catch (e) {
      console.error('Failed to parse journalEntries:', e);
    }
  }

  // Get testing reminders
  const testingRemindersStr = localStorage.getItem('testingReminders');
  if (testingRemindersStr) {
    try {
      data.testingReminders = JSON.parse(testingRemindersStr);
    } catch (e) {
      console.error('Failed to parse testingReminders:', e);
    }
  }

  // Get herb inventory
  const herbInventoryStr = localStorage.getItem('herbInventory');
  if (herbInventoryStr) {
    try {
      data.herbInventory = JSON.parse(herbInventoryStr);
    } catch (e) {
      console.error('Failed to parse herbInventory:', e);
    }
  }

  // Get daily routines (stored with date-based keys)
  const dailyRoutines: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('dailyRoutine_')) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          dailyRoutines[key] = JSON.parse(value);
        } catch (e) {
          console.error(`Failed to parse ${key}:`, e);
        }
      }
    }
  }
  if (Object.keys(dailyRoutines).length > 0) {
    data.dailyRoutines = dailyRoutines;
  }

  return data;
};

/**
 * Count total items in localStorage
 */
export const countLocalStorageItems = (): number => {
  const data = extractLocalStorageData();
  let count = 0;

  if (data.journalEntries) count += data.journalEntries.length;
  if (data.testingReminders) count += data.testingReminders.length;
  if (data.herbInventory) count += data.herbInventory.length;
  if (data.dailyRoutines) count += Object.keys(data.dailyRoutines).length;

  return count;
};

/**
 * Migrate data from localStorage to IndexedDB
 */
export const migrateToIndexedDB = async (): Promise<{
  success: boolean;
  itemsMigrated: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let itemsMigrated = 0;

  try {
    // Initialize IndexedDB
    await idb.initDB();

    // Extract data from localStorage
    const data = extractLocalStorageData();

    // Migrate journal entries
    if (data.journalEntries && data.journalEntries.length > 0) {
      try {
        for (const entry of data.journalEntries) {
          await idb.put(idb.STORES.JOURNAL_ENTRIES, entry);
          itemsMigrated++;
        }
      } catch (e) {
        errors.push(`Failed to migrate journal entries: ${e}`);
      }
    }

    // Migrate testing reminders
    if (data.testingReminders && data.testingReminders.length > 0) {
      try {
        for (const reminder of data.testingReminders) {
          await idb.put(idb.STORES.TESTING_REMINDERS, reminder);
          itemsMigrated++;
        }
      } catch (e) {
        errors.push(`Failed to migrate testing reminders: ${e}`);
      }
    }

    // Migrate herb inventory
    if (data.herbInventory && data.herbInventory.length > 0) {
      try {
        for (const item of data.herbInventory) {
          await idb.put(idb.STORES.HERB_INVENTORY, item);
          itemsMigrated++;
        }
      } catch (e) {
        errors.push(`Failed to migrate herb inventory: ${e}`);
      }
    }

    // Migrate daily routines
    if (data.dailyRoutines) {
      try {
        for (const routine of Object.values(data.dailyRoutines)) {
          await idb.put(idb.STORES.DAILY_ROUTINES, routine);
          itemsMigrated++;
        }
      } catch (e) {
        errors.push(`Failed to migrate daily routines: ${e}`);
      }
    }

    // Mark migration as complete
    markMigrationComplete();

    return {
      success: errors.length === 0,
      itemsMigrated,
      errors
    };
  } catch (e) {
    errors.push(`Migration failed: ${e}`);
    return {
      success: false,
      itemsMigrated,
      errors
    };
  }
};

/**
 * Auto-run migration on app startup if needed
 */
export const autoMigrate = async (): Promise<void> => {
  // Migrate from localStorage to IndexedDB (if not already done)
  if (!isMigrationComplete()) {
    const itemCount = countLocalStorageItems();
    if (itemCount > 0) {
      console.log(`Found ${itemCount} items in localStorage. Starting migration...`);
      const result = await migrateToIndexedDB();

      if (result.success) {
        console.log(`Migration completed successfully! ${result.itemsMigrated} items migrated.`);
      } else {
        console.error('Migration completed with errors:', result.errors);
        console.log(`${result.itemsMigrated} items were migrated successfully.`);
      }
    } else {
      markMigrationComplete();
    }
  }
};
