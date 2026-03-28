// Storage utilities using IndexedDB - will be replaced with Supabase later
import * as idb from './indexedDB';

// Herb interface - for herbal supplements and remedies
export interface Herb {
  id: string;
  name: string;
  supplementType: 'herb' | 'tonic' | 'herb bundle' | 'herb blend' | 'tea bag' | 'pills' | 'gel' | 'topical';
  category: string;
  secondaryCategory?: string;
  benefits: string;
  description?: string;
  ingredients?: string;
  supplier?: string;
  preparationInstructions?: string;
  serving?: string; // e.g., "2/4 OZ"
  dailyAmount?: string; // e.g., "3 Cups Daily"
  stockLevel?: 'high' | 'medium' | 'low' | 'out'; // Inventory tracking
  dateAdded: string;
  purchases: Purchase[];
}

// Food interface - for food items with amino acid tracking
export interface Food {
  id: string;
  name: string;
  category?: string; // e.g., "Protein", "Vegetables", "Fruits"
  servingSize: string; // e.g., "100g", "1 cup"
  lysine: number; // mg per serving
  arginine: number; // mg per serving
  supplier?: string;
  stockLevel?: 'high' | 'medium' | 'low' | 'out'; // Inventory tracking
  notes?: string;
  description?: string;
  ingredients?: string; // for processed foods
  dateAdded: string;
  purchases: Purchase[];
}

// Legacy interface for backward compatibility during migration
export interface HerbFood {
  id: string;
  name: string;
  supplementType: 'herb' | 'food' | 'tonic' | 'herb bundle' | 'herb blend' | 'tea bag' | 'pills' | 'topical' | 'supplement';
  category: string;
  secondaryCategory?: string;
  benefits: string;
  description?: string;
  ingredients?: string;
  dateAdded: string;
  purchases: Purchase[];
  supplier?: string;
  arginine?: number;
  lysine?: number;
  servingSize?: string;
  preparationInstructions?: string;
  dailyServingRequirement?: number;
  servingSizePerServing?: string;
}

export interface Purchase {
  id: string;
  date: string;
  quantity: string;
  cost?: number;
  source?: string;
}

// Supplier interface - for managing supplier information
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  dateAdded: string;
  isActive: boolean; // Can mark suppliers as inactive without deleting
}

export interface JournalEntry {
  id: string;
  date: string;
  restHours: number;
  restQuality: number; // 1-5
  workout: boolean;
  workoutType?: string;
  workoutDuration?: number;
  stressLevel: number; // 1-5
  notes: string;
  herbsConsumed: string[];
  foodsConsumed: string[];
}

// Herbs & Foods (Legacy - keeping for backward compatibility)
export const getHerbsFoods = async (): Promise<HerbFood[]> => {
  return await idb.getAll<HerbFood>(idb.STORES.HERBS_FOODS);
};

export const saveHerbFood = async (item: HerbFood): Promise<void> => {
  await idb.put(idb.STORES.HERBS_FOODS, item);
};

export const deleteHerbFood = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.HERBS_FOODS, id);
};

// Herbs (New)
export const getHerbs = async (): Promise<Herb[]> => {
  return await idb.getAll<Herb>(idb.STORES.HERBS);
};

export const saveHerb = async (item: Herb): Promise<void> => {
  await idb.put(idb.STORES.HERBS, item);
};

export const deleteHerb = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.HERBS, id);
};

// Foods (New)
export const getFoods = async (): Promise<Food[]> => {
  return await idb.getAll<Food>(idb.STORES.FOODS);
};

export const saveFood = async (item: Food): Promise<void> => {
  await idb.put(idb.STORES.FOODS, item);
};

export const deleteFood = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.FOODS, id);
};

// Journal Entries
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  return await idb.getAll<JournalEntry>(idb.STORES.JOURNAL_ENTRIES);
};

export const saveJournalEntry = async (entry: JournalEntry): Promise<void> => {
  await idb.put(idb.STORES.JOURNAL_ENTRIES, entry);
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.JOURNAL_ENTRIES, id);
};

export const getJournalEntryByDate = async (date: string): Promise<JournalEntry | undefined> => {
  const entries = await getJournalEntries();
  return entries.find(e => e.date === date);
};

// Testing reminders
export interface TestingReminder {
  id: string;
  testType: string;
  frequency: number; // days
  lastTestDate?: string;
  nextTestDate: string;
  notes?: string;
}

export const getTestingReminders = async (): Promise<TestingReminder[]> => {
  return await idb.getAll<TestingReminder>(idb.STORES.TESTING_REMINDERS);
};

export const saveTestingReminder = async (reminder: TestingReminder): Promise<void> => {
  await idb.put(idb.STORES.TESTING_REMINDERS, reminder);
};

export const deleteTestingReminder = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.TESTING_REMINDERS, id);
};

export const updateTestCompleted = async (id: string, completedDate: string): Promise<void> => {
  const reminder = await idb.getByKey<TestingReminder>(idb.STORES.TESTING_REMINDERS, id);

  if (reminder) {
    const nextDate = new Date(completedDate);
    nextDate.setDate(nextDate.getDate() + reminder.frequency);

    reminder.lastTestDate = completedDate;
    reminder.nextTestDate = nextDate.toISOString().split('T')[0];

    await idb.put(idb.STORES.TESTING_REMINDERS, reminder);
  }
};

// Herb Inventory with preparation instructions
export interface HerbInventoryItem {
  id: string;
  name: string;
  supplier: string;
  preparationInstructions?: string;
  dailyRequirement?: number; // number of servings required per day
  minimumServingsPerDay?: number;
  notes?: string;
}

export const getHerbInventory = async (): Promise<HerbInventoryItem[]> => {
  const items = await idb.getAll<HerbInventoryItem>(idb.STORES.HERB_INVENTORY);

  if (items.length === 0) {
    // Initialize with Una Del Gato
    const defaultInventory: HerbInventoryItem = {
      id: 'una-del-gato-bolingo',
      name: 'Una Del Gato',
      supplier: 'Bolingo Balance',
      preparationInstructions: 'Boil 1-2 tablespoons with 2 cups of spring water for 25 minutes, steep for 10 minutes',
      dailyRequirement: 3,
      minimumServingsPerDay: 3,
      notes: 'Must take 3 cups daily'
    };
    await idb.put(idb.STORES.HERB_INVENTORY, defaultInventory);
    return [defaultInventory];
  }
  return items;
};

export const saveHerbInventoryItem = async (item: HerbInventoryItem): Promise<void> => {
  await idb.put(idb.STORES.HERB_INVENTORY, item);
};

export const deleteHerbInventoryItem = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.HERB_INVENTORY, id);
};

// Daily Routine Log (new structure)
export interface PillIntake {
  id: string;
  time: string;
  supplier: string;
  pillName: string;
  ingredients: string;
  quantity: number;
}

export interface HerbTeaIntake {
  id: string;
  time: string;
  servingSize: string;
  whatWasInIt: string;
  ingredients: { name: string; supplier: string }[];
}

export interface FoodIntake {
  id: string;
  time: string;
  foodName: string;
  servingSize?: string;
  notes?: string;
}

export interface DailyRoutineLogNew {
  date: string;
  fasting: boolean;
  fastingHours?: number;
  pills: PillIntake[];
  herbsTeas: HerbTeaIntake[];
  foods: FoodIntake[];
}

export const getDailyRoutineLogNew = async (date: string): Promise<DailyRoutineLogNew | null> => {
  const log = await idb.getByKey<DailyRoutineLogNew>(idb.STORES.DAILY_ROUTINES, date);
  return log || null;
};

export const saveDailyRoutineLogNew = async (log: DailyRoutineLogNew): Promise<void> => {
  await idb.put(idb.STORES.DAILY_ROUTINES, log);
};

export const getAllDailyRoutineLogs = async (): Promise<DailyRoutineLogNew[]> => {
  const logs = await idb.getAll<DailyRoutineLogNew>(idb.STORES.DAILY_ROUTINES);
  return logs.sort((a, b) => b.date.localeCompare(a.date));
};

// Outbreak Tracking
export interface OutbreakEntry {
  id: string;
  startDate: string; // ISO date string
  startTime?: string; // HH:MM format
  endDate?: string; // ISO date string, undefined if ongoing
  endTime?: string; // HH:MM format
  severity: 1 | 2 | 3 | 4 | 5; // 1=Mild, 2=Moderate, 3=Severe, 4=Very Severe, 5=Extreme
  foodsBeforeOutbreak: Array<{
    foodName: string;
    consumedDate: string;
    consumedTime: string;
    hoursBeforeOutbreak: number;
  }>;
  notes: string;
  symptoms?: string;
  triggers?: string;
  isOngoing: boolean;
}

export const getOutbreakEntries = async (): Promise<OutbreakEntry[]> => {
  return await idb.getAll<OutbreakEntry>(idb.STORES.OUTBREAKS);
};

export const saveOutbreakEntry = async (entry: OutbreakEntry): Promise<void> => {
  await idb.put(idb.STORES.OUTBREAKS, entry);
};

export const deleteOutbreakEntry = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.OUTBREAKS, id);
};

export const getOutbreakById = async (id: string): Promise<OutbreakEntry | undefined> => {
  return await idb.getByKey<OutbreakEntry>(idb.STORES.OUTBREAKS, id);
};

// Suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  return await idb.getAll<Supplier>(idb.STORES.SUPPLIERS);
};

export const saveSupplier = async (supplier: Supplier): Promise<void> => {
  await idb.put(idb.STORES.SUPPLIERS, supplier);
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.SUPPLIERS, id);
};

export const getSupplierById = async (id: string): Promise<Supplier | undefined> => {
  return await idb.getByKey<Supplier>(idb.STORES.SUPPLIERS, id);
};

/**
 * GLOBAL SUPPLIER RENAME
 * Renames a supplier across all herbs and their purchase histories
 * This is useful for fixing typos or standardizing supplier names
 */
export const renameSupplierGlobally = async (oldName: string, newName: string): Promise<void> => {
  const herbs = await getHerbs();
  let updated = false;

  for (const herb of herbs) {
    let herbModified = false;

    // Update herb's default supplier
    if (herb.supplier === oldName) {
      herb.supplier = newName;
      herbModified = true;
    }

    // Update purchase sources
    if (herb.purchases && herb.purchases.length > 0) {
      herb.purchases.forEach(purchase => {
        if (purchase.source === oldName) {
          purchase.source = newName;
          herbModified = true;
        }
      });
    }

    // Save if modified
    if (herbModified) {
      await saveHerb(herb);
      updated = true;
    }
  }

  return;
};

/**
 * MERGE SUPPLIERS
 * Merges multiple supplier names into one
 * Updates all herbs and purchases, then optionally deletes the old supplier records
 */
export const mergeSuppliers = async (supplierNamesToMerge: string[], targetName: string): Promise<void> => {
  for (const oldName of supplierNamesToMerge) {
    if (oldName !== targetName) {
      await renameSupplierGlobally(oldName, targetName);
    }
  }
};