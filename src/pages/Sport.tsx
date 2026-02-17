import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Flame, Scale, Plus, Trash2, Check, X, Circle, CheckCircle2, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { useTasks } from "@/contexts/TaskContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import EditTaskDialog from "@/components/EditTaskDialog";
import { format } from "date-fns";
import { Task } from "@/lib/supabase";

interface WeightEntry {
  date: string;
  weight: number;
}

const Sport = () => {
  const { tasks, loading, deleteTask, completeTask, uncompleteTask, getTasksForDate } = useTasks();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [calories, setCalories] = useState({ consumed: 0, goal: 2000 });
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [meals, setMeals] = useState<{ name: string; calories: number }[]>([]);

  // Weight tracking state
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem('weight_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [newWeight, setNewWeight] = useState("");
  const [weightPeriod, setWeightPeriod] = useState<'week' | '2weeks' | 'month' | '3months' | '6months' | 'year'>('month');

  // Save weight entries to localStorage
  useEffect(() => {
    localStorage.setItem('weight_entries', JSON.stringify(weightEntries));
  }, [weightEntries]);

  // Filter weight entries based on selected period
  const filteredWeightEntries = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (weightPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '2weeks':
        cutoffDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return weightEntries
      .filter(entry => {
        // Parse date string or use ISO date
        const entryDate = entry.date.includes('-') 
          ? new Date(entry.date) 
          : new Date(entry.date);
        return entryDate >= cutoffDate;
      })
      .sort((a, b) => {
        const dateA = a.date.includes('-') ? new Date(a.date) : new Date(a.date);
        const dateB = b.date.includes('-') ? new Date(b.date) : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [weightEntries, weightPeriod]);

  // Filter tasks for sport category and current date
  const sportTasks = useMemo(() => {
    const todayTasks = getTasksForDate(selectedDate);
    return todayTasks.filter(task => task.category === 'sport');
  }, [tasks, selectedDate, getTasksForDate]);

  const todayStr = selectedDate.toISOString().split('T')[0];
  const completedToday = sportTasks.filter(task => {
    return task.completed_dates?.includes(todayStr) || false;
  });
  const doneCount = completedToday.length;
  const totalCount = sportTasks.length;

  // Calculate weighted progress based on importance
  const totalImportance = sportTasks.reduce((sum, task) => sum + (task.importance || 0), 0);
  const completedImportance = completedToday.reduce((sum, task) => sum + (task.importance || 0), 0);
  const progressPercentage = totalImportance > 0 ? Math.round((completedImportance / totalImportance) * 100) : 0;

  const handleToggleTask = async (task: Task) => {
    const isCompleted = task.completed_dates?.includes(todayStr) || false;
    if (isCompleted) {
      await uncompleteTask(task.id, todayStr);
    } else {
      await completeTask(task.id, todayStr);
    }
  };

  const getScheduleInfo = (task: Task) => {
    if (task.schedule_type === 'daily') {
      return { icon: Clock, text: isRTL ? "يومي" : "Daily" };
    } else if (task.schedule_type === 'weekly') {
      const days = task.weekly_days || [];
      const dayNames = days.map(d => {
        const dayMap: { [key: number]: string } = {
          0: isRTL ? "أحد" : "Sun",
          1: isRTL ? "إثنين" : "Mon",
          2: isRTL ? "ثلاثاء" : "Tue",
          3: isRTL ? "أربعاء" : "Wed",
          4: isRTL ? "خميس" : "Thu",
          5: isRTL ? "جمعة" : "Fri",
          6: isRTL ? "سبت" : "Sat",
        };
        return dayMap[d];
      });
      return { icon: Calendar, text: dayNames.join(", ") };
    } else {
      return { icon: Calendar, text: isRTL ? "مرة واحدة" : "One-time" };
    }
  };

  const addMeal = () => {
    if (!mealName.trim() || !mealCalories) return;
    const cal = parseInt(mealCalories);
    setMeals([...meals, { name: mealName, calories: cal }]);
    setCalories({ ...calories, consumed: calories.consumed + cal });
    setMealName("");
    setMealCalories("");
  };

  const addWeight = () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال وزن صحيح" : "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // Use ISO format for proper sorting
    const weightValue = parseFloat(newWeight);
    
    // Check if entry for today already exists
    const existingIndex = weightEntries.findIndex(entry => entry.date === dateStr || entry.date.startsWith(dateStr.split('T')[0]));
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updated = [...weightEntries];
      updated[existingIndex] = { date: dateStr, weight: weightValue };
      setWeightEntries(updated);
    } else {
      // Add new entry
      setWeightEntries([...weightEntries, { date: dateStr, weight: weightValue }]);
    }
    
    setNewWeight("");
    toast({
      title: isRTL ? "نجح" : "Success",
      description: isRTL ? "تم تسجيل الوزن بنجاح" : "Weight recorded successfully",
    });
  };

  // Format date for display
  const formatWeightDate = (dateStr: string) => {
    if (dateStr.includes('-')) {
      const date = new Date(dateStr);
      const months = isRTL ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    }
    return dateStr;
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mx-4 bg-card rounded-2xl p-4 border border-border mb-4">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">+XP 0</span>
            <p className="text-xs text-muted-foreground mt-1">
              {doneCount}/{totalCount} {isRTL ? "مكتمل" : "completed"}
            </p>
            <p className="text-2xl font-bold">
              {progressPercentage}%
            </p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <h2 className="text-lg font-bold">{isRTL ? "الصحة والرياضة" : "Health & Fitness"}</h2>
              <p className="text-xs text-muted-foreground">{isRTL ? "اعتنِ بصحتك - أمانة من الله" : "Take care of your health - a trust from Allah"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="px-4">
        <TabsList className="w-full bg-card border border-border">
          <TabsTrigger value="weight" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Scale className="w-3.5 h-3.5 ml-1" /> تتبع الوزن
          </TabsTrigger>
          <TabsTrigger value="calories" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Flame className="w-3.5 h-3.5 ml-1" /> السعرات
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Dumbbell className="w-3.5 h-3.5 ml-1" /> التمارين
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {totalCount} {isRTL ? "مهمة" : "tasks"}
            </span>
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{isRTL ? "إكمال المهام اليومية" : "Daily Tasks"}</h3>
              <span className="text-xs text-muted-foreground">
                {format(selectedDate, "yyyy-MM-dd")}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="pb-4 flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
            </div>
          ) : sportTasks.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <p className="text-muted-foreground mb-4">
                {isRTL ? "لا توجد مهام لهذا اليوم" : "No tasks for today"}
              </p>
              <CreateTaskDialog category="sport" />
            </div>
          ) : (
            <>
              {sportTasks.map((task) => {
                const isCompleted = task.completed_dates?.includes(todayStr) || false;
                const scheduleInfo = getScheduleInfo(task);
                const ScheduleIcon = scheduleInfo.icon;

                return (
                  <div
                    key={task.id}
                    className="bg-card rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                </button>
                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-sm block flex-1 ${
                                isCompleted ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.importance && (
                              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {task.importance}%
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <ScheduleIcon className="w-3 h-3" />
                            <span>{scheduleInfo.text}</span>
                </div>
              </div>
              </div>
                      <div className="flex items-center gap-1">
                        <EditTaskDialog task={task} />
              <button
                          onClick={() => deleteTask(task.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
              >
                          <X className="w-4 h-4" />
              </button>
              </div>
              </div>
            </div>
                );
              })}
            </>
          )}

          {/* Add task */}
          <div className="bg-card rounded-xl p-3 border border-border">
            <CreateTaskDialog category="sport" />
          </div>
        </TabsContent>

        {/* Calories Tab */}
        <TabsContent value="calories" className="space-y-4 mt-4">
          <div className="bg-card rounded-2xl p-5 border border-border text-center space-y-3">
            <h3 className="font-bold text-lg">السعرات الحرارية اليوم</h3>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(220,14%,22%)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(160,84%,44%)" strokeWidth="3" strokeDasharray={`${(calories.consumed / calories.goal) * 100}, 100`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{calories.consumed}</span>
                <span className="text-xs text-muted-foreground">/ {calories.goal}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">المتبقي: {Math.max(0, calories.goal - calories.consumed)} سعرة</p>
          </div>

          {/* Add meal */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <h4 className="font-semibold text-right">إضافة وجبة</h4>
            <div className="flex gap-2">
              <Button onClick={addMeal} size="sm" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
              <Input value={mealCalories} onChange={(e) => setMealCalories(e.target.value)} placeholder="السعرات" type="number" className="w-24 text-right" />
              <Input value={mealName} onChange={(e) => setMealName(e.target.value)} placeholder="اسم الوجبة..." className="text-right" />
            </div>
          </div>

          {/* Meals list */}
          {meals.length > 0 && (
            <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
              <h4 className="font-semibold text-right">الوجبات اليوم</h4>
              {meals.map((meal, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-primary font-semibold">{meal.calories} سعرة</span>
                  <span className="text-sm">{meal.name}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Weight Tracker Tab */}
        <TabsContent value="weight" className="space-y-4 mt-4">
          {/* Period Selector */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{isRTL ? "تتبع الوزن" : "Weight Tracking"}</h3>
              <Select value={weightPeriod} onValueChange={(value: any) => setWeightPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{isRTL ? "أسبوع" : "Week"}</SelectItem>
                  <SelectItem value="2weeks">{isRTL ? "أسبوعان" : "2 Weeks"}</SelectItem>
                  <SelectItem value="month">{isRTL ? "شهر" : "Month"}</SelectItem>
                  <SelectItem value="3months">{isRTL ? "3 أشهر" : "3 Months"}</SelectItem>
                  <SelectItem value="6months">{isRTL ? "6 أشهر" : "6 Months"}</SelectItem>
                  <SelectItem value="year">{isRTL ? "سنة" : "Year"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filteredWeightEntries.length > 0 ? (
              <div className="flex items-center justify-between mb-3">
              <div>
                  <span className="text-2xl font-bold text-primary">
                    {filteredWeightEntries[filteredWeightEntries.length - 1]?.weight || 0}
                  </span>
                <span className="text-sm text-muted-foreground mr-1">كغ</span>
                </div>
                {filteredWeightEntries.length > 1 && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? "التغيير" : "Change"}
                    </p>
                    <p className={`text-sm font-semibold ${
                      (filteredWeightEntries[filteredWeightEntries.length - 1]?.weight || 0) - (filteredWeightEntries[0]?.weight || 0) >= 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}>
                      {((filteredWeightEntries[filteredWeightEntries.length - 1]?.weight || 0) - (filteredWeightEntries[0]?.weight || 0)).toFixed(1)} كغ
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  {isRTL ? "لا توجد بيانات للفترة المحددة" : "No data for selected period"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "أضف وزنك لبدء التتبع" : "Add your weight to start tracking"}
                </p>
            </div>
            )}

            {filteredWeightEntries.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={filteredWeightEntries.map(entry => ({
                  date: formatWeightDate(entry.date),
                  weight: entry.weight,
                  fullDate: entry.date
                }))}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160,84%,44%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160,84%,44%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                    domain={["auto", "auto"]}
                    label={{ value: isRTL ? "كغ" : "kg", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip 
                    contentStyle={{ background: "hsl(220,18%,14%)", border: "1px solid hsl(220,14%,22%)", borderRadius: "8px", fontSize: 12 }}
                    formatter={(value: any) => [`${value} كغ`, isRTL ? "الوزن" : "Weight"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(160,84%,44%)" 
                    fillOpacity={1} 
                    fill="url(#weightGrad)" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: "hsl(160,84%,44%)" }} 
                  />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Add weight */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <h4 className="font-semibold text-right">{isRTL ? "تسجيل الوزن" : "Record Weight"}</h4>
            <div className="flex gap-2">
              <Button onClick={addWeight} size="sm" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
              <Input 
                value={newWeight} 
                onChange={(e) => setNewWeight(e.target.value)} 
                placeholder={isRTL ? "الوزن بالكيلوغرام..." : "Weight in kg..."} 
                type="number" 
                step="0.1" 
                className="text-right"
                onKeyDown={(e) => e.key === 'Enter' && addWeight()}
              />
            </div>
          </div>

          {/* Weight history */}
          {filteredWeightEntries.length > 0 && (
          <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
              <h4 className="font-semibold text-right">{isRTL ? "السجل" : "History"}</h4>
              {[...filteredWeightEntries].reverse().map((entry, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm font-semibold">{entry.weight} كغ</span>
                  <span className="text-sm text-muted-foreground">{formatWeightDate(entry.date)}</span>
              </div>
            ))}
          </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sport;
