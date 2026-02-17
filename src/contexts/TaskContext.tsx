import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Task } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  createTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed' | 'completed_dates'>) => Promise<{ error: Error | null }>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ error: Error | null }>;
  deleteTask: (id: string) => Promise<{ error: Error | null }>;
  completeTask: (id: string, date?: string) => Promise<{ error: Error | null }>;
  uncompleteTask: (id: string, date?: string) => Promise<{ error: Error | null }>;
  getTasksForDate: (date: Date) => Task[];
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, set empty array silently
        if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
          // Table doesn't exist - silently set empty array
          setTasks([]);
        } else {
          console.error('Error fetching tasks:', error);
          setTasks([]);
        }
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      // Silently handle errors - table might not exist yet
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed' | 'completed_dates'>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const newTask: Omit<Task, 'id'> = {
        ...taskData,
        user_id: user.id,
        completed: false,
        completed_dates: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      return { error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { error: error as Error };
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTasks(tasks.map(t => t.id === id ? data : t));
      return { error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      return { error: error as Error };
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error: error as Error };
    }
  };

  const completeTask = async (id: string, date?: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const completionDate = date || new Date().toISOString().split('T')[0];
    
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return { error: new Error('Task not found') };

      const completedDates = task.completed_dates || [];
      if (completedDates.includes(completionDate)) {
        return { error: null }; // Already completed for this date
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed_dates: [...completedDates, completionDate],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTasks(tasks.map(t => t.id === id ? data : t));
      return { error: null };
    } catch (error) {
      console.error('Error completing task:', error);
      return { error: error as Error };
    }
  };

  const uncompleteTask = async (id: string, date?: string) => {
    if (!user) return { error: new Error('No user logged in') };

    const completionDate = date || new Date().toISOString().split('T')[0];
    
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return { error: new Error('Task not found') };

      const completedDates = (task.completed_dates || []).filter(d => d !== completionDate);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed_dates: completedDates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTasks(tasks.map(t => t.id === id ? data : t));
      return { error: null };
    } catch (error) {
      console.error('Error uncompleting task:', error);
      return { error: error as Error };
    }
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return tasks.filter(task => {
      // Check if task is completed for this date
      const isCompleted = task.completed_dates?.includes(dateStr) || false;

      switch (task.schedule_type) {
        case 'daily':
          if (!task.daily_start_date || !task.daily_duration_weeks) return false;
          const startDate = new Date(task.daily_start_date);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + (task.daily_duration_weeks * 7));
          return date >= startDate && date <= endDate;
        
        case 'weekly':
          if (!task.weekly_days || !task.weekly_start_date || !task.weekly_duration_weeks) return false;
          if (!task.weekly_days.includes(dayOfWeek)) return false;
          const weeklyStart = new Date(task.weekly_start_date);
          const weeklyEnd = new Date(weeklyStart);
          weeklyEnd.setDate(weeklyEnd.getDate() + (task.weekly_duration_weeks * 7));
          return date >= weeklyStart && date <= weeklyEnd;
        
        case 'one-time':
          if (!task.one_time_date) return false;
          return task.one_time_date === dateStr;
        
        default:
          return false;
      }
    });
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  const value = {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    getTasksForDate,
    refreshTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
