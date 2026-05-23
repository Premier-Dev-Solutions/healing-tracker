// Sync engine for Heal From It
// Syncs data between IndexedDB (local, source of truth) and Supabase (cloud backup)

import { supabase, isSupabaseConfigured } from './supabase';
import {
  getHerbs,
  getFoods,
  getSuppliers,
  getAllDailyRoutineLogs,
  getJournalEntries,
  getOutbreakEntries,
  getTestingReminders,
  saveHerb,
  saveFood,
  saveSupplier,
  saveDailyRoutineLogNew,
  saveJournalEntry,
  saveOutbreakEntry,
  saveTestingReminder,
  type Herb,
  type Food,
  type Supplier,
  type DailyRoutineLogNew,
  type JournalEntry,
  type OutbreakEntry,
  type TestingReminder,
} from './storage';

export interface SyncResult {
  synced: number;
  errors: number;
}

export interface SyncSummary {
  table: string;
  synced: number;
  errors: number;
}

const LAST_SYNCED_KEY = 'heal_from_it_last_synced_at';

/**
 * Check if a string is a valid UUID format
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Ensure an ID is a valid UUID, generate one if not
 */
function ensureUUID(id: string): string {
  if (isValidUUID(id)) {
    return id;
  }
  return crypto.randomUUID();
}

/**
 * Sync herbs from IndexedDB to Supabase
 */
export async function syncHerbs(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, errors: 0 };
  }

  try {
    const herbs = await getHerbs();
    let synced = 0;
    let errors = 0;

    for (const herb of herbs) {
      try {
        // Check if ID is a valid UUID to determine conflict strategy
        const hasValidUUID = isValidUUID(herb.id);
        const herbId = hasValidUUID ? herb.id : crypto.randomUUID();

        // Map IndexedDB fields to Supabase columns
        const supabaseHerb = {
          id: herbId,
          user_id: userId,
          name: herb.name,
          supplier: herb.supplier || null,
          ingredients: herb.ingredients || null,
          serving: herb.serving || null,
          daily_amount: herb.dailyAmount || null,
          benefits: herb.benefits,
          category: herb.category,
          secondary_category: herb.secondaryCategory || null,
          supplement_type: herb.supplementType,
          description: herb.description || null,
          preparation_instructions: herb.preparationInstructions || null,
          stock_level: herb.stockLevel || null,
          notes: null, // herbs don't have a notes field in IndexedDB
          created_at: herb.dateAdded,
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };

        // Use 'id' conflict for UUID items (app-created), 'user_id,name' for non-UUID (CSV imports)
        const { error } = await supabase
          .from('herbs')
          .upsert(supabaseHerb, { onConflict: hasValidUUID ? 'id' : 'user_id,name' });

        if (error) {
          console.error(`Error syncing herb ${herb.id}:`, error);
          errors++;
        } else {
          synced++;

          // Sync purchases for this herb
          if (herb.purchases && herb.purchases.length > 0) {
            for (const purchase of herb.purchases) {
              const purchaseId = ensureUUID(purchase.id);
              const { error: purchaseError } = await supabase
                .from('purchase_history')
                .upsert({
                  id: purchaseId,
                  user_id: userId,
                  item_id: herbId,
                  item_type: 'herb',
                  supplier: purchase.source || null,
                  cost: purchase.cost || null,
                  quantity: purchase.quantity,
                  quantity_unit: null,
                  purchase_date: purchase.date,
                  notes: null,
                  created_at: purchase.date,
                  synced_at: new Date().toISOString(),
                }, { onConflict: 'id' });

              if (purchaseError) {
                console.error(`Error syncing purchase ${purchase.id}:`, purchaseError);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error processing herb ${herb.id}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (err) {
    console.error('Error in syncHerbs:', err);
    return { synced: 0, errors: 1 };
  }
}

/**
 * Sync foods from IndexedDB to Supabase
 */
export async function syncFoods(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, errors: 0 };
  }

  try {
    const foods = await getFoods();
    let synced = 0;
    let errors = 0;

    for (const food of foods) {
      try {
        // Check if ID is a valid UUID to determine conflict strategy
        const hasValidUUID = isValidUUID(food.id);
        const foodId = hasValidUUID ? food.id : crypto.randomUUID();

        // Map IndexedDB fields to Supabase columns
        const supabaseFood = {
          id: foodId,
          user_id: userId,
          name: food.name,
          supplier: food.supplier || null,
          category: food.category || null,
          lysine: food.lysine,
          arginine: food.arginine,
          serving_size: food.servingSize || null,
          benefits: food.description || null, // description maps to benefits
          notes: food.notes || null,
          created_at: food.dateAdded,
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };

        // Use 'id' conflict for UUID items (app-created), 'user_id,name' for non-UUID (CSV imports)
        const { error } = await supabase
          .from('foods')
          .upsert(supabaseFood, { onConflict: hasValidUUID ? 'id' : 'user_id,name' });

        if (error) {
          console.error(`Error syncing food ${food.id}:`, error);
          errors++;
        } else {
          synced++;

          // Sync purchases for this food
          if (food.purchases && food.purchases.length > 0) {
            for (const purchase of food.purchases) {
              const purchaseId = ensureUUID(purchase.id);
              const { error: purchaseError } = await supabase
                .from('purchase_history')
                .upsert({
                  id: purchaseId,
                  user_id: userId,
                  item_id: foodId,
                  item_type: 'food',
                  supplier: purchase.source || null,
                  cost: purchase.cost || null,
                  quantity: purchase.quantity,
                  quantity_unit: null,
                  purchase_date: purchase.date,
                  notes: null,
                  created_at: purchase.date,
                  synced_at: new Date().toISOString(),
                }, { onConflict: 'id' });

              if (purchaseError) {
                console.error(`Error syncing purchase ${purchase.id}:`, purchaseError);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error processing food ${food.id}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (err) {
    console.error('Error in syncFoods:', err);
    return { synced: 0, errors: 1 };
  }
}

/**
 * Sync suppliers from IndexedDB to Supabase
 */
export async function syncSuppliers(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, errors: 0 };
  }

  try {
    const suppliers = await getSuppliers();
    let synced = 0;
    let errors = 0;

    for (const supplier of suppliers) {
      try {
        // Check if ID is a valid UUID to determine conflict strategy
        const hasValidUUID = isValidUUID(supplier.id);
        const supplierId = hasValidUUID ? supplier.id : crypto.randomUUID();

        // Map IndexedDB fields to Supabase columns
        const supabaseSupplier = {
          id: supplierId,
          user_id: userId,
          name: supplier.name,
          contact_person: supplier.contactPerson || null,
          email: supplier.email || null,
          phone: supplier.phone || null,
          website: supplier.website || null,
          address: supplier.address || null,
          is_active: supplier.isActive,
          notes: supplier.notes || null,
          created_at: supplier.dateAdded,
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };

        // Use 'id' conflict for UUID items (app-created), 'user_id,name' for non-UUID (CSV imports)
        const { error } = await supabase
          .from('suppliers')
          .upsert(supabaseSupplier, { onConflict: hasValidUUID ? 'id' : 'user_id,name' });

        if (error) {
          console.error(`Error syncing supplier ${supplier.id}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`Error processing supplier ${supplier.id}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (err) {
    console.error('Error in syncSuppliers:', err);
    return { synced: 0, errors: 1 };
  }
}

/**
 * Sync daily routines from IndexedDB to Supabase
 */
export async function syncDailyRoutines(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, errors: 0 };
  }

  try {
    const routines = await getAllDailyRoutineLogs();
    let synced = 0;
    let errors = 0;

    for (const routine of routines) {
      try {
        // Generate a valid UUID for the id (routine.date is a date string, not a UUID)
        const routineId = ensureUUID(routine.date);

        // Map IndexedDB fields to Supabase columns
        const supabaseRoutine = {
          id: routineId,
          user_id: userId,
          date: routine.date,
          fasting: routine.fasting,
          fasting_hours: routine.fastingHours || null,
          pills: routine.pills as any, // JSONB
          herbs: routine.herbsTeas as any, // herbsTeas → herbs (JSONB)
          foods: routine.foods as any, // JSONB
          notes: null,
          created_at: routine.date,
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('daily_routines')
          .upsert(supabaseRoutine, { onConflict: 'user_id,date' });

        if (error) {
          console.error(`Error syncing routine ${routine.date}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`Error processing routine ${routine.date}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (err) {
    console.error('Error in syncDailyRoutines:', err);
    return { synced: 0, errors: 1 };
  }
}

/**
 * Sync journal entries from IndexedDB to Supabase
 */
export async function syncJournalEntries(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, errors: 0 };
  }

  try {
    const entries = await getJournalEntries();
    let synced = 0;
    let errors = 0;

    for (const entry of entries) {
      try {
        // Ensure ID is a valid UUID
        const entryId = ensureUUID(entry.id);

        // Map IndexedDB fields to Supabase columns
        const supabaseEntry = {
          id: entryId,
          user_id: userId,
          date: entry.date,
          sleep_hours: entry.restHours, // restHours → sleep_hours
          sleep_quality: entry.restQuality, // restQuality → sleep_quality
          workout: entry.workout,
          workout_type: entry.workoutType || null,
          workout_duration: entry.workoutDuration || null,
          stress_level: entry.stressLevel,
          notes: entry.notes || null,
          created_at: entry.date,
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('journal_entries')
          .upsert(supabaseEntry, { onConflict: 'id' });

        if (error) {
          console.error(`Error syncing journal entry ${entry.id}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`Error processing journal entry ${entry.id}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (err) {
    console.error('Error in syncJournalEntries:', err);
    return { synced: 0, errors: 1 };
  }
}

/**
 * Sync outbreaks from IndexedDB to Supabase
 */
export async function syncOutbreaks(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, errors: 0 };
  }

  try {
    const outbreaks = await getOutbreakEntries();
    let synced = 0;
    let errors = 0;

    for (const outbreak of outbreaks) {
      try {
        // Ensure ID is a valid UUID
        const outbreakId = ensureUUID(outbreak.id);

        // Calculate duration in days
        let durationDays: number | null = null;
        if (!outbreak.isOngoing && outbreak.endDate && outbreak.startDate) {
          const start = new Date(outbreak.startDate);
          const end = new Date(outbreak.endDate);
          durationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Map IndexedDB fields to Supabase columns
        const supabaseOutbreak = {
          id: outbreakId,
          user_id: userId,
          date: outbreak.startDate, // startDate → date
          severity: outbreak.severity,
          duration_days: durationDays,
          is_ongoing: outbreak.isOngoing,
          symptoms: outbreak.symptoms || null,
          triggers: outbreak.triggers || null,
          notes: outbreak.notes || null,
          created_at: outbreak.startDate,
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('outbreaks')
          .upsert(supabaseOutbreak, { onConflict: 'id' });

        if (error) {
          console.error(`Error syncing outbreak ${outbreak.id}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`Error processing outbreak ${outbreak.id}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (err) {
    console.error('Error in syncOutbreaks:', err);
    return { synced: 0, errors: 1 };
  }
}

/**
 * Sync testing reminders from IndexedDB to Supabase
 */
export async function syncTestingReminders(userId: string): Promise<SyncResult> {
  if (!isSupabaseConfigured()) {
    return { synced: 0, errors: 0 };
  }

  try {
    const reminders = await getTestingReminders();
    let synced = 0;
    let errors = 0;

    for (const reminder of reminders) {
      try {
        // Ensure ID is a valid UUID
        const reminderId = ensureUUID(reminder.id);

        // Map IndexedDB fields to Supabase columns
        const supabaseReminder = {
          id: reminderId,
          user_id: userId,
          test_type: reminder.testType,
          frequency_days: reminder.frequency, // frequency → frequency_days
          last_completed: reminder.lastTestDate || null, // lastTestDate → last_completed
          next_due: reminder.nextTestDate, // nextTestDate → next_due
          notes: reminder.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synced_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('testing_reminders')
          .upsert(supabaseReminder, { onConflict: 'id' });

        if (error) {
          console.error(`Error syncing reminder ${reminder.id}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err);
        errors++;
      }
    }

    return { synced, errors };
  } catch (err) {
    console.error('Error in syncTestingReminders:', err);
    return { synced: 0, errors: 1 };
  }
}

/**
 * Sync all data from IndexedDB to Supabase
 */
export async function syncAll(userId: string): Promise<SyncSummary[]> {
  if (!isSupabaseConfigured() || !userId) {
    return [];
  }

  const results = await Promise.allSettled([
    syncHerbs(userId).then(r => ({ table: 'herbs', ...r })),
    syncFoods(userId).then(r => ({ table: 'foods', ...r })),
    syncSuppliers(userId).then(r => ({ table: 'suppliers', ...r })),
    syncDailyRoutines(userId).then(r => ({ table: 'daily_routines', ...r })),
    syncJournalEntries(userId).then(r => ({ table: 'journal_entries', ...r })),
    syncOutbreaks(userId).then(r => ({ table: 'outbreaks', ...r })),
    syncTestingReminders(userId).then(r => ({ table: 'testing_reminders', ...r })),
  ]);

  const summary: SyncSummary[] = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const tables = ['herbs', 'foods', 'suppliers', 'daily_routines', 'journal_entries', 'outbreaks', 'testing_reminders'];
      console.error(`Sync failed for ${tables[index]}:`, result.reason);
      return { table: tables[index], synced: 0, errors: 1 };
    }
  });

  // Update last synced timestamp
  localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());

  return summary;
}

/**
 * Pull data from Supabase to IndexedDB (used on sign in for new devices)
 * Only populates empty stores - never overwrites existing local data
 */
export async function pullFromSupabase(userId: string): Promise<void> {
  if (!isSupabaseConfigured() || !userId) {
    return;
  }

  try {
    // Pull herbs if local store is empty
    const existingHerbs = await getHerbs();
    if (existingHerbs.length === 0) {
      const { data: herbs, error: herbsError } = await supabase
        .from('herbs')
        .select('*')
        .eq('user_id', userId);

      if (!herbsError && herbs) {
        for (const supabaseHerb of herbs) {
          const herb: Herb = {
            id: supabaseHerb.id,
            name: supabaseHerb.name,
            supplementType: supabaseHerb.supplement_type as any,
            category: supabaseHerb.category,
            secondaryCategory: supabaseHerb.secondary_category || undefined,
            benefits: supabaseHerb.benefits,
            description: supabaseHerb.description || undefined,
            ingredients: supabaseHerb.ingredients || undefined,
            supplier: supabaseHerb.supplier || undefined,
            preparationInstructions: supabaseHerb.preparation_instructions || undefined,
            serving: supabaseHerb.serving || undefined,
            dailyAmount: supabaseHerb.daily_amount || undefined,
            stockLevel: supabaseHerb.stock_level as any || undefined,
            dateAdded: supabaseHerb.created_at,
            purchases: [], // Will be populated from purchase_history
          };
          await saveHerb(herb);
        }
      }
    }

    // Pull foods if local store is empty
    const existingFoods = await getFoods();
    if (existingFoods.length === 0) {
      const { data: foods, error: foodsError } = await supabase
        .from('foods')
        .select('*')
        .eq('user_id', userId);

      if (!foodsError && foods) {
        for (const supabaseFood of foods) {
          const food: Food = {
            id: supabaseFood.id,
            name: supabaseFood.name,
            category: supabaseFood.category || undefined,
            servingSize: supabaseFood.serving_size || '',
            lysine: supabaseFood.lysine,
            arginine: supabaseFood.arginine,
            supplier: supabaseFood.supplier || undefined,
            stockLevel: undefined,
            notes: supabaseFood.notes || undefined,
            description: supabaseFood.benefits || undefined,
            ingredients: undefined,
            dateAdded: supabaseFood.created_at,
            purchases: [], // Will be populated from purchase_history
          };
          await saveFood(food);
        }
      }
    }

    // Pull suppliers if local store is empty
    const existingSuppliers = await getSuppliers();
    if (existingSuppliers.length === 0) {
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userId);

      if (!suppliersError && suppliers) {
        for (const supabaseSupplier of suppliers) {
          const supplier: Supplier = {
            id: supabaseSupplier.id,
            name: supabaseSupplier.name,
            contactPerson: supabaseSupplier.contact_person || undefined,
            email: supabaseSupplier.email || undefined,
            phone: supabaseSupplier.phone || undefined,
            website: supabaseSupplier.website || undefined,
            address: supabaseSupplier.address || undefined,
            notes: supabaseSupplier.notes || undefined,
            dateAdded: supabaseSupplier.created_at,
            isActive: supabaseSupplier.is_active,
          };
          await saveSupplier(supplier);
        }
      }
    }

    // Pull daily routines if local store is empty
    const existingRoutines = await getAllDailyRoutineLogs();
    if (existingRoutines.length === 0) {
      const { data: routines, error: routinesError } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', userId);

      if (!routinesError && routines) {
        for (const supabaseRoutine of routines) {
          const routine: DailyRoutineLogNew = {
            date: supabaseRoutine.date,
            fasting: supabaseRoutine.fasting,
            fastingHours: supabaseRoutine.fasting_hours || undefined,
            pills: (supabaseRoutine.pills as any) || [],
            herbsTeas: (supabaseRoutine.herbs as any) || [], // herbs → herbsTeas
            foods: (supabaseRoutine.foods as any) || [],
          };
          await saveDailyRoutineLogNew(routine);
        }
      }
    }

    // Pull journal entries if local store is empty
    const existingEntries = await getJournalEntries();
    if (existingEntries.length === 0) {
      const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId);

      if (!entriesError && entries) {
        for (const supabaseEntry of entries) {
          const entry: JournalEntry = {
            id: supabaseEntry.id,
            date: supabaseEntry.date,
            restHours: supabaseEntry.sleep_hours, // sleep_hours → restHours
            restQuality: supabaseEntry.sleep_quality, // sleep_quality → restQuality
            workout: supabaseEntry.workout,
            workoutType: supabaseEntry.workout_type || undefined,
            workoutDuration: supabaseEntry.workout_duration || undefined,
            stressLevel: supabaseEntry.stress_level,
            notes: supabaseEntry.notes || '',
            herbsConsumed: [],
            foodsConsumed: [],
          };
          await saveJournalEntry(entry);
        }
      }
    }

    // Pull outbreaks if local store is empty
    const existingOutbreaks = await getOutbreakEntries();
    if (existingOutbreaks.length === 0) {
      const { data: outbreaks, error: outbreaksError } = await supabase
        .from('outbreaks')
        .select('*')
        .eq('user_id', userId);

      if (!outbreaksError && outbreaks) {
        for (const supabaseOutbreak of outbreaks) {
          // Calculate endDate from duration_days if not ongoing
          let endDate: string | undefined;
          if (!supabaseOutbreak.is_ongoing && supabaseOutbreak.duration_days) {
            const start = new Date(supabaseOutbreak.date);
            start.setDate(start.getDate() + supabaseOutbreak.duration_days);
            endDate = start.toISOString().split('T')[0];
          }

          const outbreak: OutbreakEntry = {
            id: supabaseOutbreak.id,
            startDate: supabaseOutbreak.date,
            startTime: undefined,
            endDate: endDate,
            endTime: undefined,
            severity: supabaseOutbreak.severity as any,
            foodsBeforeOutbreak: [], // Not synced, recalculated at runtime
            notes: supabaseOutbreak.notes || '',
            symptoms: supabaseOutbreak.symptoms || undefined,
            triggers: supabaseOutbreak.triggers || undefined,
            isOngoing: supabaseOutbreak.is_ongoing,
          };
          await saveOutbreakEntry(outbreak);
        }
      }
    }

    // Pull testing reminders if local store is empty
    const existingReminders = await getTestingReminders();
    if (existingReminders.length === 0) {
      const { data: reminders, error: remindersError } = await supabase
        .from('testing_reminders')
        .select('*')
        .eq('user_id', userId);

      if (!remindersError && reminders) {
        for (const supabaseReminder of reminders) {
          const reminder: TestingReminder = {
            id: supabaseReminder.id,
            testType: supabaseReminder.test_type,
            frequency: supabaseReminder.frequency_days, // frequency_days → frequency
            lastTestDate: supabaseReminder.last_completed || undefined, // last_completed → lastTestDate
            nextTestDate: supabaseReminder.next_due, // next_due → nextTestDate
            notes: supabaseReminder.notes || undefined,
          };
          await saveTestingReminder(reminder);
        }
      }
    }
  } catch (err) {
    console.error('Error in pullFromSupabase:', err);
    throw err;
  }
}

/**
 * Delete herb from Supabase
 */
export async function syncDeleteHerb(userId: string, herbId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('herbs')
      .delete()
      .eq('id', herbId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting herb ${herbId}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in syncDeleteHerb:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete food from Supabase
 */
export async function syncDeleteFood(userId: string, foodId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('foods')
      .delete()
      .eq('id', foodId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting food ${foodId}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in syncDeleteFood:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete supplier from Supabase
 */
export async function syncDeleteSupplier(userId: string, supplierId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId)
      .eq('user_id', userId);

    if (error) {
      console.error(`Error deleting supplier ${supplierId}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in syncDeleteSupplier:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get the last synced timestamp from localStorage
 */
export function getLastSyncedAt(): Date | null {
  const timestamp = localStorage.getItem(LAST_SYNCED_KEY);
  return timestamp ? new Date(timestamp) : null;
}
