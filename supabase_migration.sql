-- Migration script to create all tables for user data storage
-- Run this in your Supabase SQL Editor

-- 1. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT DEFAULT 'UTC',
  time_format TEXT DEFAULT '24', -- '12' or '24'
  language TEXT DEFAULT 'ar', -- 'ar' or 'en'
  location JSONB, -- {lat: number, lng: number}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Section Target Importance Table
CREATE TABLE IF NOT EXISTS section_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'quran', 'work', 'sport', 'knowledge'
  target_percentage INTEGER NOT NULL DEFAULT 0 CHECK (target_percentage >= 0 AND target_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- 3. Weight Entries Table (Historical Data)
CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 4. Books Table (Knowledge Section)
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quran Data Table
CREATE TABLE IF NOT EXISTS quran_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_page INTEGER DEFAULT 1,
  bookmark JSONB, -- {page: number, sura: number, verse: number}
  adhkar_completed JSONB DEFAULT '[]'::jsonb, -- Array of completed adhkar IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. Progress History Table (Daily Progress Tracking)
CREATE TABLE IF NOT EXISTS progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL, -- 'quran', 'work', 'sport', 'knowledge'
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  tasks_completed INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,
  importance_used DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, category)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_history_user_date ON progress_history(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_history_user_category ON progress_history(user_id, category);
CREATE INDEX IF NOT EXISTS idx_section_targets_user ON section_targets(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own section targets" ON section_targets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own section targets" ON section_targets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own section targets" ON section_targets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own weight entries" ON weight_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight entries" ON weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight entries" ON weight_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight entries" ON weight_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quran data" ON quran_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quran data" ON quran_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quran data" ON quran_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress history" ON progress_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress history" ON progress_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress history" ON progress_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_targets_updated_at BEFORE UPDATE ON section_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_entries_updated_at BEFORE UPDATE ON weight_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quran_data_updated_at BEFORE UPDATE ON quran_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_history_updated_at BEFORE UPDATE ON progress_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
