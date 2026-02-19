# Database Setup Instructions

## Step 1: Run the SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `supabase_migration.sql`
6. Click **Run** to execute the migration

This will create the following tables:
- `user_preferences` - User settings (timezone, time format, language, location)
- `section_targets` - Target importance percentages for each category
- `weight_entries` - Weight tracking with historical data
- `books` - Books in Knowledge section
- `quran_data` - Quran reading progress, bookmarks, adhkar
- `progress_history` - Daily progress tracking for analytics

## Step 2: Verify Tables

After running the migration, verify the tables were created:
1. Go to **Table Editor** in Supabase Dashboard
2. You should see all 6 new tables listed
3. Check that Row Level Security (RLS) is enabled on all tables

## Step 3: Test the Migration

The app will automatically:
- Migrate existing localStorage data to database on first login
- Use database for all new data
- Fall back to localStorage if database is unavailable

## Data Migration

The app includes automatic migration that will:
1. Check if user has database records
2. If not, migrate from localStorage to database
3. Keep localStorage as backup until migration is complete

## Tables Created

### user_preferences
- Stores: timezone, time_format (12/24), language, location
- One record per user

### section_targets
- Stores: target percentage for each category (quran, work, sport, knowledge)
- One record per user per category

### weight_entries
- Stores: Historical weight data with date, weight, notes
- Multiple records per user (one per date)
- Indexed for fast queries

### books
- Stores: Books in Knowledge section
- Fields: title, author, current_page, total_pages
- Multiple records per user

### quran_data
- Stores: Last page read, bookmarks, completed adhkar
- One record per user

### progress_history
- Stores: Daily progress for analytics
- Fields: date, category, progress_percentage, tasks_completed, tasks_total, importance_used
- Multiple records per user (one per date per category)
- Indexed for fast queries and chart generation
