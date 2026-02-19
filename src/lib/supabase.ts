import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jihbvsjgxzovyskmgfgr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('Supabase anon key is missing. Please add VITE_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Types
export interface UserProfile {
  id: string;
  email: string;
}

// Database Types
export interface UserPreferences {
  id: string;
  user_id: string;
  timezone: string;
  time_format: '12' | '24';
  language: 'ar' | 'en';
  location: { lat: number; lng: number } | null;
  created_at: string;
  updated_at: string;
}

export interface SectionTarget {
  id: string;
  user_id: string;
  category: 'quran' | 'work' | 'sport' | 'knowledge';
  target_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  current_page: number;
  total_pages: number;
  created_at: string;
  updated_at: string;
}

export interface QuranData {
  id: string;
  user_id: string;
  last_page: number;
  bookmark: { page: number; sura: number; verse: number } | null;
  adhkar_completed: string[];
  created_at: string;
  updated_at: string;
}

export interface ProgressHistory {
  id: string;
  user_id: string;
  date: string;
  category: 'quran' | 'work' | 'sport' | 'knowledge';
  progress_percentage: number;
  tasks_completed: number;
  tasks_total: number;
  importance_used: number;
  created_at: string;
  updated_at: string;
}

export type TaskScheduleType = 'daily' | 'weekly' | 'one-time';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'work' | 'sport' | 'knowledge' | 'quran' | 'other';
  schedule_type: TaskScheduleType;
  // For daily tasks
  daily_start_date?: string; // ISO date string
  daily_duration_weeks?: number; // How many weeks to repeat daily
  // For weekly tasks
  weekly_days?: number[]; // Array of day numbers (0=Sunday, 1=Monday, etc.)
  weekly_start_date?: string; // ISO date string
  weekly_duration_weeks?: number; // How many weeks to repeat
  // For one-time tasks
  one_time_date?: string; // ISO date string
  // Status
  completed: boolean;
  completed_dates?: string[]; // Array of ISO date strings when task was completed
  // Importance/Weight (percentage, should sum to 100% for all tasks in a category)
  importance?: number; // Percentage (0-100)
  created_at: string;
  updated_at: string;
}
