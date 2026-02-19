import { 
  getUserPreferences, 
  upsertUserPreferences,
  getSectionTargets,
  upsertSectionTargets,
  getWeightEntries,
  addWeightEntry,
  getBooks,
  addBook as addBookToDb,
  getQuranData,
  upsertQuranData
} from './database';

/**
 * Migrates all localStorage data to database for a user
 * This should be called once when user logs in
 */
export const migrateLocalStorageToDatabase = async (userId: string): Promise<void> => {
  try {
    // Check if user already has database records (already migrated)
    const existingPrefs = await getUserPreferences(userId);
    if (existingPrefs) {
      // User already has data, but we should still sync localStorage as backup
      console.log('User already has database records, syncing localStorage as backup');
      return;
    }

    console.log('Starting migration from localStorage to database...');

    // 1. Migrate User Preferences (timezone, timeFormat, language, location)
    const timezone = localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const timeFormat = (localStorage.getItem('timeFormat') || '24') as '12' | '24';
    const language = (localStorage.getItem('language') || 'ar') as 'ar' | 'en';
    const userLocationStr = localStorage.getItem('user_location');
    let location = null;
    if (userLocationStr) {
      try {
        location = JSON.parse(userLocationStr);
      } catch {
        // Invalid JSON, ignore
      }
    }

    await upsertUserPreferences(userId, {
      timezone,
      time_format: timeFormat,
      language,
      location,
    });

    // 2. Migrate Section Targets
    const sectionTargetsStr = localStorage.getItem('section_target_importance');
    if (sectionTargetsStr) {
      try {
        const targets = JSON.parse(sectionTargetsStr);
        await upsertSectionTargets(userId, targets);
      } catch {
        // Invalid JSON, use defaults
        await upsertSectionTargets(userId, { quran: 40, work: 40, knowledge: 10, sport: 10 });
      }
    }

    // 3. Migrate Weight Entries
    const weightEntriesStr = localStorage.getItem('weight_entries');
    if (weightEntriesStr) {
      try {
        const localEntries = JSON.parse(weightEntriesStr);
        const dbEntries = await getWeightEntries(userId);
        
        // Only migrate if database is empty
        if (dbEntries.length === 0 && Array.isArray(localEntries) && localEntries.length > 0) {
          for (const entry of localEntries) {
            if (entry.date && entry.weight) {
              await addWeightEntry(userId, entry.date, entry.weight, entry.notes || undefined);
            }
          }
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    // 4. Migrate Books
    const booksStr = localStorage.getItem('knowledge_books');
    if (booksStr) {
      try {
        const localBooks = JSON.parse(booksStr);
        const dbBooks = await getBooks(userId);
        
        // Only migrate if database is empty
        if (dbBooks.length === 0 && Array.isArray(localBooks) && localBooks.length > 0) {
          for (const book of localBooks) {
            await addBookToDb(
              userId,
              book.title || '',
              book.author || null,
              book.totalPages || book.total_pages || 100
            );
          }
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    // 5. Migrate Quran Data
    const lastPage = localStorage.getItem('quran_last_page');
    const bookmarkStr = localStorage.getItem('quran_bookmark');
    const adhkarStr = localStorage.getItem('adhkar_completed');
    
    let bookmark = null;
    if (bookmarkStr) {
      try {
        bookmark = JSON.parse(bookmarkStr);
      } catch {
        // Invalid JSON, ignore
      }
    }

    let adhkarCompleted: string[] = [];
    if (adhkarStr) {
      try {
        const adhkar = JSON.parse(adhkarStr);
        // Convert object to array of keys (adhkar IDs)
        if (typeof adhkar === 'object' && adhkar !== null) {
          adhkarCompleted = Object.keys(adhkar);
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    await upsertQuranData(userId, {
      last_page: lastPage ? parseInt(lastPage) : 1,
      bookmark,
      adhkar_completed: adhkarCompleted,
    });

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    // Don't throw - migration failure shouldn't break the app
  }
};
