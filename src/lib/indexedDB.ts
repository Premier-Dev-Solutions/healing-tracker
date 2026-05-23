// IndexedDB wrapper for Healing Tracker
// Provides better performance and larger storage capacity than localStorage

const DB_NAME = 'HealingTrackerDB';
const DB_VERSION = 5;

// Store names
export const STORES = {
  HERBS: 'herbs', // Herbal supplements
  FOODS: 'foods', // Food items with nutrition
  JOURNAL_ENTRIES: 'journalEntries',
  TESTING_REMINDERS: 'testingReminders',
  DAILY_ROUTINES: 'dailyRoutines',
  HERB_INVENTORY: 'herbInventory',
  OUTBREAKS: 'outbreaks',
  SUPPLIERS: 'suppliers'
} as const;

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize and open the IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      // Delete legacy herbsFoods store if upgrading from v4 or earlier
      if (oldVersion <= 4 && db.objectStoreNames.contains('herbsFoods')) {
        db.deleteObjectStore('herbsFoods');
      }

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.JOURNAL_ENTRIES)) {
        const journalStore = db.createObjectStore(STORES.JOURNAL_ENTRIES, { keyPath: 'id' });
        journalStore.createIndex('date', 'date', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.TESTING_REMINDERS)) {
        db.createObjectStore(STORES.TESTING_REMINDERS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.DAILY_ROUTINES)) {
        const routineStore = db.createObjectStore(STORES.DAILY_ROUTINES, { keyPath: 'date' });
        routineStore.createIndex('date', 'date', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.HERB_INVENTORY)) {
        db.createObjectStore(STORES.HERB_INVENTORY, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.OUTBREAKS)) {
        const outbreaksStore = db.createObjectStore(STORES.OUTBREAKS, { keyPath: 'id' });
        outbreaksStore.createIndex('startDate', 'startDate', { unique: false });
        outbreaksStore.createIndex('severity', 'severity', { unique: false });
      }

      // New separate stores for Herbs and Foods
      if (!db.objectStoreNames.contains(STORES.HERBS)) {
        const herbsStore = db.createObjectStore(STORES.HERBS, { keyPath: 'id' });
        herbsStore.createIndex('supplementType', 'supplementType', { unique: false });
        herbsStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        herbsStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.FOODS)) {
        const foodsStore = db.createObjectStore(STORES.FOODS, { keyPath: 'id' });
        foodsStore.createIndex('category', 'category', { unique: false });
        foodsStore.createIndex('dateAdded', 'dateAdded', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SUPPLIERS)) {
        const suppliersStore = db.createObjectStore(STORES.SUPPLIERS, { keyPath: 'id' });
        suppliersStore.createIndex('name', 'name', { unique: false });
        suppliersStore.createIndex('isActive', 'isActive', { unique: false });
        suppliersStore.createIndex('dateAdded', 'dateAdded', { unique: false });
      }
    };
  });
};

/**
 * Get all items from a store
 */
export const getAll = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get items from ${storeName}`));
    };
  });
};

/**
 * Get a single item by key
 */
export const getByKey = async <T>(storeName: string, key: string): Promise<T | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get item from ${storeName}`));
    };
  });
};

/**
 * Add or update an item in a store
 */
export const put = async <T>(storeName: string, item: T): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to save item to ${storeName}`));
    };
  });
};

/**
 * Delete an item by key
 */
export const deleteByKey = async (storeName: string, key: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete item from ${storeName}`));
    };
  });
};

/**
 * Clear all items from a store
 */
export const clearStore = async (storeName: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to clear ${storeName}`));
    };
  });
};

/**
 * Export all data from the database
 */
export const exportAllData = async (): Promise<Record<string, any[]>> => {
  const data: Record<string, any[]> = {};

  for (const storeName of Object.values(STORES)) {
    data[storeName] = await getAll(storeName);
  }

  return data;
};

/**
 * Import data into the database (replaces existing data)
 */
export const importAllData = async (data: Record<string, any[]>): Promise<void> => {
  for (const [storeName, items] of Object.entries(data)) {
    if (Object.values(STORES).includes(storeName as any)) {
      // Clear existing data
      await clearStore(storeName);

      // Import new data
      for (const item of items) {
        await put(storeName, item);
      }
    }
  }
};

/**
 * Clear all data from the database
 */
export const clearAllData = async (): Promise<void> => {
  for (const storeName of Object.values(STORES)) {
    await clearStore(storeName);
  }
};

/**
 * Get storage statistics
 */
export const getStorageStats = async (): Promise<Record<string, number>> => {
  const stats: Record<string, number> = {};

  for (const storeName of Object.values(STORES)) {
    const items = await getAll(storeName);
    stats[storeName] = items.length;
  }

  return stats;
};
