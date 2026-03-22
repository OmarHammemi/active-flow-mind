import { supabase } from '@/lib/supabase';
import type { 
  UserPreferences, 
  SectionTarget, 
  WeightEntry, 
  Book, 
  QuranData, 
  ProgressHistory 
} from '@/lib/supabase';

// ==================== User Preferences ====================
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Handle 406 Not Acceptable (table doesn't exist or RLS blocking)
      if (error.code === 'PGRST116' || error.status === 406 || error.status === 404) {
        // No preferences found or table doesn't exist, return null
        return null;
      }
      // Only log non-expected errors
      if (error.status !== 406 && error.status !== 404) {
        console.error('Error fetching user preferences:', error);
      }
      return null;
    }
    return data;
  } catch (error) {
    // Silently handle errors - app should work without database
    return null;
  }
};

export const upsertUserPreferences = async (userId: string, preferences: Partial<UserPreferences>): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error upserting user preferences:', error);
    return { error: error as Error };
  }
  return { error: null };
};

// ==================== Section Targets ====================
export const getSectionTargets = async (userId: string): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('section_targets')
    .select('category, target_percentage')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching section targets:', error);
    return { quran: 40, work: 40, knowledge: 10, sport: 10 };
  }

  const targets: Record<string, number> = { quran: 40, work: 40, knowledge: 10, sport: 10 };
  data?.forEach(item => {
    targets[item.category] = item.target_percentage;
  });
  return targets;
};

export const upsertSectionTarget = async (
  userId: string, 
  category: 'quran' | 'work' | 'sport' | 'knowledge', 
  targetPercentage: number
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('section_targets')
    .upsert({
      user_id: userId,
      category,
      target_percentage: targetPercentage,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,category'
    });

  if (error) {
    console.error('Error upserting section target:', error);
    return { error: error as Error };
  }
  return { error: null };
};

export const upsertSectionTargets = async (
  userId: string, 
  targets: Record<string, number>
): Promise<{ error: Error | null }> => {
  const targetsArray = Object.entries(targets).map(([category, target_percentage]) => ({
    user_id: userId,
    category,
    target_percentage,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('section_targets')
    .upsert(targetsArray, {
      onConflict: 'user_id,category'
    });

  if (error) {
    console.error('Error upserting section targets:', error);
    return { error: error as Error };
  }
  return { error: null };
};

// ==================== Weight Entries ====================
export const getWeightEntries = async (userId: string): Promise<WeightEntry[]> => {
  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching weight entries:', error);
    return [];
  }
  return data || [];
};

export const addWeightEntry = async (
  userId: string, 
  date: string, 
  weight: number, 
  notes?: string
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('weight_entries')
    .upsert({
      user_id: userId,
      date,
      weight,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,date'
    });

  if (error) {
    console.error('Error adding weight entry:', error);
    return { error: error as Error };
  }
  return { error: null };
};

export const deleteWeightEntry = async (userId: string, entryId: string): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting weight entry:', error);
    return { error: error as Error };
  }
  return { error: null };
};

// ==================== Books ====================
export const getBooks = async (userId: string): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }
  return data || [];
};

export const addBook = async (
  userId: string, 
  title: string, 
  author: string | null, 
  totalPages: number
): Promise<{ data: Book | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: userId,
      title,
      author,
      current_page: 0,
      total_pages: totalPages,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding book:', error);
    return { data: null, error: error as Error };
  }
  return { data, error: null };
};

export const updateBook = async (
  userId: string, 
  bookId: string, 
  updates: Partial<Book>
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('books')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating book:', error);
    return { error: error as Error };
  }
  return { error: null };
};

export const deleteBook = async (userId: string, bookId: string): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting book:', error);
    return { error: error as Error };
  }
  return { error: null };
};

// ==================== Quran Data ====================
export const getQuranData = async (userId: string): Promise<QuranData | null> => {
  const { data, error } = await supabase
    .from('quran_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching quran data:', error);
    return null;
  }
  return data;
};

export const upsertQuranData = async (
  userId: string, 
  data: Partial<QuranData>
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('quran_data')
    .upsert({
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error upserting quran data:', error);
    return { error: error as Error };
  }
  return { error: null };
};

// ==================== Progress History ====================
export const getProgressHistory = async (
  userId: string, 
  startDate?: string, 
  endDate?: string,
  category?: 'quran' | 'work' | 'sport' | 'knowledge'
): Promise<ProgressHistory[]> => {
  let query = supabase
    .from('progress_history')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching progress history:', error);
    return [];
  }
  return data || [];
};

export const upsertProgressHistory = async (
  userId: string, 
  date: string, 
  category: 'quran' | 'work' | 'sport' | 'knowledge',
  progress: {
    progress_percentage: number;
    tasks_completed: number;
    tasks_total: number;
    importance_used: number;
  }
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('progress_history')
    .upsert({
      user_id: userId,
      date,
      category,
      ...progress,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,date,category'
    });

  if (error) {
    console.error('Error upserting progress history:', error);
    return { error: error as Error };
  }
  return { error: null };
};
