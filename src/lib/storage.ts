// Storage utilities using IndexedDB - will be replaced with Supabase later
import * as idb from './indexedDB';

export interface HerbFood {
  id: string;
  name: string;
  type: 'herb' | 'food' | 'tonic' | 'herb bundle' | 'herb blend' | 'tea bag' | 'pills' | 'topical' | 'supplement';
  category: string;
  secondaryCategory?: string; // optional secondary category for both herbs and foods
  benefits: string;
  description?: string; // detailed description of the herb/food
  ingredients?: string; // ingredients list
  dateAdded: string;
  purchases: Purchase[];
  supplier?: string; // primary supplier for this herb/food
  // For foods only: amino acid tracking
  arginine?: number; // mg per serving
  lysine?: number; // mg per serving
  servingSize?: string;
  // For herbs only: preparation and requirements
  preparationInstructions?: string;
  dailyServingRequirement?: number; // how many servings per day
  servingSizePerServing?: string; // e.g., "1-2 tablespoons", "1 cup"
}

export interface Purchase {
  id: string;
  date: string;
  quantity: string;
  cost?: number;
  source?: string;
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

// Herbs & Foods
export const getHerbsFoods = async (): Promise<HerbFood[]> => {
  return await idb.getAll<HerbFood>(idb.STORES.HERBS_FOODS);
};

export const saveHerbFood = async (item: HerbFood): Promise<void> => {
  await idb.put(idb.STORES.HERBS_FOODS, item);
};

export const deleteHerbFood = async (id: string): Promise<void> => {
  await idb.deleteByKey(idb.STORES.HERBS_FOODS, id);
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