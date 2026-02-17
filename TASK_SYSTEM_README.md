# Task Management System

This application now includes a comprehensive task management system where each user can create their own tasks with flexible scheduling options.

## Features

### Task Scheduling Options

1. **Daily Tasks**
   - Set a start date
   - Specify duration in weeks (how many weeks to repeat daily)
   - Task appears every day for the specified duration

2. **Weekly Tasks**
   - Select specific days of the week (Sunday through Saturday)
   - Set a start date
   - Specify duration in weeks
   - Task appears only on selected days for the specified duration

3. **One-time Tasks**
   - Set a specific date
   - Task appears only on that date

### Task Categories

Tasks can be categorized as:
- `work` - Work and productivity tasks
- `sport` - Sports and fitness tasks
- `knowledge` - Learning and knowledge tasks
- `quran` - Quran-related tasks
- `other` - Other tasks

### Task Management

- Each user has their own tasks (stored per user ID)
- Tasks can be marked as completed for specific dates
- Tasks show their schedule type (daily, weekly, one-time)
- Tasks can be deleted
- Tasks are filtered by date - only tasks scheduled for the current date appear

## Database Setup

Before using the task system, you need to create the database table in Supabase:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL script from `TASK_SCHEMA.sql`

This will create:
- The `tasks` table with all necessary fields
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Usage

### Creating a Task

1. Navigate to the Work page (or any category page)
2. Click the "Add" button
3. Fill in the task details:
   - Title (required)
   - Description (optional)
   - Schedule type (Daily, Weekly, or One-time)
   - Configure the schedule based on the selected type
4. Click "Create"

### Completing a Task

- Click the circle icon next to a task to mark it as completed for today
- Click again to uncomplete it
- Completion is tracked per date, so you can complete the same task on different days

### Viewing Tasks

- Tasks are automatically filtered to show only those scheduled for the current date
- The completion percentage is calculated based on tasks for the current date
- Each task shows its schedule type and details

## Technical Details

### Components

- `TaskContext` (`src/contexts/TaskContext.tsx`) - Manages task state and operations
- `CreateTaskDialog` (`src/components/CreateTaskDialog.tsx`) - Dialog for creating new tasks
- Updated `Work` page (`src/pages/Work.tsx`) - Example implementation using the task system

### Task Data Structure

```typescript
interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'work' | 'sport' | 'knowledge' | 'quran' | 'other';
  schedule_type: 'daily' | 'weekly' | 'one-time';
  
  // Daily schedule
  daily_start_date?: string;
  daily_duration_weeks?: number;
  
  // Weekly schedule
  weekly_days?: number[]; // 0=Sunday, 1=Monday, etc.
  weekly_start_date?: string;
  weekly_duration_weeks?: number;
  
  // One-time schedule
  one_time_date?: string;
  
  // Status
  completed: boolean;
  completed_dates?: string[]; // Array of ISO date strings
  created_at: string;
  updated_at: string;
}
```

## Next Steps

To use this system in other pages (Sport, Knowledge, etc.):

1. Import `useTasks` from `@/contexts/TaskContext`
2. Use `getTasksForDate(date)` to get tasks for a specific date
3. Filter by category: `tasks.filter(t => t.category === 'sport')`
4. Use `CreateTaskDialog` component with the appropriate category
5. Use `completeTask`, `uncompleteTask`, and `deleteTask` functions

Example:
```tsx
import { useTasks } from "@/contexts/TaskContext";
import CreateTaskDialog from "@/components/CreateTaskDialog";

const MyPage = () => {
  const { getTasksForDate } = useTasks();
  const todayTasks = getTasksForDate(new Date())
    .filter(t => t.category === 'sport');
  
  // ... rest of component
};
```
