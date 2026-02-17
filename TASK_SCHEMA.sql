-- Task Management Schema for Supabase
-- Run this SQL in your Supabase SQL editor to create the tasks table

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('work', 'sport', 'knowledge', 'quran', 'other')),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'one-time')),
  
  -- Daily schedule fields
  daily_start_date DATE,
  daily_duration_weeks INTEGER,
  
  -- Weekly schedule fields
  weekly_days INTEGER[], -- Array of day numbers (0=Sunday, 1=Monday, etc.)
  weekly_start_date DATE,
  weekly_duration_weeks INTEGER,
  
  -- One-time schedule fields
  one_time_date DATE,
  
  -- Status fields
  completed BOOLEAN DEFAULT false,
  completed_dates TEXT[], -- Array of ISO date strings (YYYY-MM-DD)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_schedule_type ON tasks(schedule_type);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
