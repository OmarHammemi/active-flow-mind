import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flame, Star, BookOpen, Briefcase, Dumbbell, GraduationCap, Settings, Check } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { useTasks } from "@/contexts/TaskContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getSectionTargets, upsertSectionTargets } from "@/services/database";
import { format, subDays, startOfWeek, eachDayOfInterval, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const dayNamesAr = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

const Index = () => {
  const navigate = useNavigate();
  const { tasks, loading, getTasksForDate } = useTasks();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timePeriod, setTimePeriod] = useState<'week' | '2weeks' | 'month' | '3months' | '6months' | 'year'>('week');
  
  // Target importance percentages for each section (stored in database)
  const [targetImportance, setTargetImportance] = useState<Record<string, number>>({ quran: 40, work: 40, knowledge: 10, sport: 10 });
  const [targetsLoading, setTargetsLoading] = useState(true);

  // Load section targets from database
  useEffect(() => {
    const loadTargets = async () => {
      if (!user) {
        // Fallback to localStorage if not logged in
    const saved = localStorage.getItem('section_target_importance');
    if (saved) {
      try {
            setTargetImportance(JSON.parse(saved));
      } catch {
            // Keep defaults
          }
        }
        setTargetsLoading(false);
        return;
      }

      try {
        const targets = await getSectionTargets(user.id);
        setTargetImportance(targets);
        
        // Migrate from localStorage if database is empty
        const saved = localStorage.getItem('section_target_importance');
        if (saved) {
          try {
            const localTargets = JSON.parse(saved);
            const hasLocalData = Object.values(localTargets).some(v => v > 0);
            const hasDbData = Object.values(targets).some(v => v > 0);
            
            if (hasLocalData && !hasDbData) {
              // Migrate to database
              await upsertSectionTargets(user.id, localTargets);
              setTargetImportance(localTargets);
            }
          } catch {
            // Ignore parse errors
          }
        }
      } catch (error) {
        console.error('Error loading section targets:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('section_target_importance');
        if (saved) {
          try {
            setTargetImportance(JSON.parse(saved));
          } catch {
            // Keep defaults
          }
        }
      } finally {
        setTargetsLoading(false);
      }
    };

    loadTargets();
  }, [user]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tempTargets, setTempTargets] = useState<Record<string, number>>(targetImportance);

  // Reset temp targets when dialog opens
  useEffect(() => {
    if (editDialogOpen) {
      setTempTargets(targetImportance);
    }
  }, [editDialogOpen, targetImportance]);

  // Save target importance to database (and localStorage as backup)
  useEffect(() => {
    if (!user || targetsLoading) return;
    
    const saveTargets = async () => {
      // Save to database
      const { error } = await upsertSectionTargets(user.id, targetImportance);
      if (error) {
        console.error('Error saving section targets to database:', error);
        // Fallback to localStorage
        localStorage.setItem('section_target_importance', JSON.stringify(targetImportance));
      } else {
        // Also save to localStorage as backup
    localStorage.setItem('section_target_importance', JSON.stringify(targetImportance));
      }
    };

    saveTargets();
  }, [targetImportance, user, targetsLoading]);

  const handleSaveTargets = () => {
    const total = Object.values(tempTargets).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? `المجموع يجب أن يكون 100%. المجموع الحالي: ${total}%` : `Total must be 100%. Current total: ${total}%`,
        variant: "destructive",
      });
      return;
    }
    setTargetImportance(tempTargets);
    setEditDialogOpen(false);
    toast({
      title: isRTL ? "نجح" : "Success",
      description: isRTL ? "تم حفظ توزيع الأهمية بنجاح" : "Importance distribution saved successfully",
    });
  };

  // Calculate today's tasks and progress
  const todayStr = selectedDate.toISOString().split('T')[0];
  const todayTasks = useMemo(() => getTasksForDate(selectedDate), [tasks, selectedDate, getTasksForDate]);
  
  const completedToday = todayTasks.filter(task => 
    task.completed_dates?.includes(todayStr) || false
  );

  // Calculate section statistics first (needed for weighted progress)
  const sections = useMemo(() => {
    const categories = [
      { name: "العمل والإنتاجية", icon: Briefcase, color: "bg-blue-500", category: "work" as const, path: "/work" },
      { name: "القرآن والصلاة", icon: BookOpen, color: "bg-emerald-500", category: "quran" as const, path: "/quran" },
      { name: "المعرفة والتعلم", icon: GraduationCap, color: "bg-pink-500", category: "knowledge" as const, path: "/knowledge" },
      { name: "الصحة والرياضة", icon: Dumbbell, color: "bg-orange-500", category: "sport" as const, path: "/sport" },
    ];

    return categories.map(({ name, icon, color, category, path }) => {
      const categoryTasks = todayTasks.filter(t => t.category === category);
      const completedCategoryTasks = categoryTasks.filter(t => 
        t.completed_dates?.includes(todayStr) || false
      );
      
      const categoryTotalImportance = categoryTasks.reduce((sum, t) => sum + (t.importance || 0), 0);
      const categoryCompletedImportance = completedCategoryTasks.reduce((sum, t) => sum + (t.importance || 0), 0);
      const progress = categoryTotalImportance > 0 
        ? Math.round((categoryCompletedImportance / categoryTotalImportance) * 100) 
        : 0;

      const target = targetImportance[category] || 0;
      const remaining = target - categoryTotalImportance;

      return {
        name,
        icon,
        color,
        path,
        progress,
        habits: `${completedCategoryTasks.length}/${categoryTasks.length}`,
        totalTasks: categoryTasks.length,
        importance: categoryTotalImportance,
        target,
        remaining,
        category,
      };
    });
  }, [todayTasks, todayStr, targetImportance]);

  // Calculate overall progress using weighted percentages
  // Each category's progress is multiplied by its target importance percentage
  const overallProgress = useMemo(() => {
    let weightedSum = 0;
    sections.forEach(section => {
      // Multiply category progress by its target importance percentage
      weightedSum += (section.progress / 100) * (section.target / 100) * 100;
    });
    return Math.round(weightedSum);
  }, [sections]);

  // Generate chart data based on selected time period
  const chartData = useMemo(() => {
    let startDate: Date;
    let endDate = selectedDate;
    let interval: 'day' | 'week' | 'month' = 'day';
    
    switch (timePeriod) {
      case 'week':
        // Week starts on Monday (1 = Monday in date-fns)
        startDate = startOfWeek(endDate, { weekStartsOn: 1 });
        interval = 'day';
        break;
      case '2weeks':
        startDate = startOfWeek(subWeeks(endDate, 1), { weekStartsOn: 1 });
        interval = 'day';
        break;
      case 'month':
        startDate = subDays(endDate, 29);
        interval = 'day';
        break;
      case '3months':
        startDate = subMonths(endDate, 3);
        interval = 'week';
        break;
      case '6months':
        startDate = subMonths(endDate, 6);
        interval = 'week';
        break;
      case 'year':
        startDate = subMonths(endDate, 12);
        interval = 'month';
        break;
      default:
        startDate = subDays(endDate, 6);
        interval = 'day';
    }
    
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // For longer periods, sample data points
    let sampledDates = dates;
    if (interval === 'week' && dates.length > 20) {
      // Sample weekly
      sampledDates = dates.filter((_, i) => i % 7 === 0 || i === dates.length - 1);
    } else if (interval === 'month' && dates.length > 30) {
      // Sample monthly
      sampledDates = dates.filter((_, i) => i % 30 === 0 || i === dates.length - 1);
    }
    
    return sampledDates.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = getTasksForDate(date);
      
      const getCategoryProgress = (category: 'quran' | 'work' | 'sport' | 'knowledge') => {
        const catTasks = dayTasks.filter(t => t.category === category);
        const completed = catTasks.filter(t => t.completed_dates?.includes(dateStr) || false);
        const totalImp = catTasks.reduce((sum, t) => sum + (t.importance || 0), 0);
        const completedImp = completed.reduce((sum, t) => sum + (t.importance || 0), 0);
        return totalImp > 0 ? Math.round((completedImp / totalImp) * 100) : 0;
      };

      // Format date label based on interval
      let dateLabel: string;
      if (interval === 'day') {
        // For daily view, show day name (Monday, Tuesday, etc.)
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = isRTL 
          ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
          : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        dateLabel = dayNames[dayIndex];
      } else if (interval === 'week') {
        dateLabel = format(date, 'MMM dd');
      } else {
        dateLabel = format(date, 'MMM yyyy');
      }

      return {
        date: dateLabel,
        fullDate: dateStr,
        day: format(date, 'd'),
        quran: getCategoryProgress('quran'),
        work: getCategoryProgress('work'),
        sport: getCategoryProgress('sport'),
        knowledge: getCategoryProgress('knowledge'),
      };
    });
  }, [tasks, selectedDate, timePeriod, getTasksForDate, isRTL]);

  // Calculate detailed analytics
  const detailedAnalytics = useMemo(() => {
    const categories = [
      { name: "القرآن", icon: BookOpen, color: "bg-emerald-500", stroke: "#10b981", fill: "#10b98133", dataKey: "quran", category: "quran" as const },
      { name: "العمل", icon: Briefcase, color: "bg-blue-500", stroke: "#3b82f6", fill: "#3b82f633", dataKey: "work", category: "work" as const },
      { name: "الرياضة", icon: Dumbbell, color: "bg-orange-500", stroke: "#f97316", fill: "#f9731633", dataKey: "sport", category: "sport" as const },
      { name: "المعرفة", icon: GraduationCap, color: "bg-pink-500", stroke: "#ec4899", fill: "#ec489933", dataKey: "knowledge", category: "knowledge" as const },
    ];

    return categories.map(cat => {
      const catTasks = todayTasks.filter(t => t.category === cat.category);
      const completed = catTasks.filter(t => t.completed_dates?.includes(todayStr) || false);
      const totalImp = catTasks.reduce((sum, t) => sum + (t.importance || 0), 0);
      const completedImp = completed.reduce((sum, t) => sum + (t.importance || 0), 0);
      const progress = totalImp > 0 ? Math.round((completedImp / totalImp) * 100) : 0;
      
      // Calculate average and high from chart data
      const chartValues = chartData.map(d => d[cat.dataKey as keyof typeof d] as number);
      const avg = chartValues.length > 0 
        ? Math.round(chartValues.reduce((a, b) => a + b, 0) / chartValues.length) 
        : 0;
      const high = chartValues.length > 0 ? Math.max(...chartValues) : 0;

      return {
        ...cat,
        progress,
        avg,
        high,
        importance: totalImp,
      };
    });
  }, [todayTasks, todayStr, chartData]);

  // Calculate streak (simplified - consecutive days with any completion)
  const streak = useMemo(() => {
    let count = 0;
    let checkDate = new Date(selectedDate);
    while (count < 365) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayTasks = getTasksForDate(checkDate);
      const hasCompletion = dayTasks.some(task => 
        task.completed_dates?.includes(dateStr) || false
      );
      if (hasCompletion) {
        count++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    return count;
  }, [tasks, selectedDate, getTasksForDate]);

  // Calculate total XP (simplified - based on completed tasks)
  const totalXP = useMemo(() => {
    return completedToday.reduce((sum, task) => sum + ((task.importance || 0) * 10), 0);
  }, [completedToday]);

  return (
    <div className="pb-4 space-y-6">
      {/* Greeting */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">السلام عليكم 👋</h2>
        <p className="text-sm text-muted-foreground">هل أنت مستعد لجعل اليوم مميزاً؟ دعنا نتتبع تقدمك.</p>
      </div>

      {/* Level Badge */}
      <div className="flex justify-center">
        <span className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          🏆 المستوى 1
        </span>
      </div>

      {/* Progress Card */}
      <div className="mx-4 bg-card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg font-bold">{overallProgress}%</span>
              <p className="text-[8px] text-muted-foreground">مكتمل</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg">التقدم اليوم</h3>
            <p className="text-xs text-muted-foreground">
              {completedToday.length}/{todayTasks.length} {isRTL ? "مهمة مكتملة" : "tasks completed"}
            </p>
          </div>
        </div>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <span className="font-bold text-xl">{streak}</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-xs text-muted-foreground">أيام السلسلة</span>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <span className="font-bold text-xl">{totalXP}</span>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="text-xs text-muted-foreground">إجمالي النقاط</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>XP {totalXP} / 500</span>
            <span>المستوى التالي</span>
          </div>
          <Progress value={Math.min((totalXP / 500) * 100, 100)} className="h-2" />
        </div>
      </div>

      {/* Journey Cards */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <CalendarIcon className="w-3 h-3 ml-1" />
                  {format(selectedDate, "yyyy-MM-dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedDate(new Date())}
              disabled={format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")}
            >
              {isRTL ? "اليوم" : "Today"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedDate(subDays(selectedDate, -1))}
              disabled={format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary">
                <Settings className="w-4 h-4 ml-1" />
                {isRTL ? "تعديل التوزيع" : "Edit Distribution"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{isRTL ? "توزيع الأهمية" : "Importance Distribution"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {sections.map((section) => (
                  <div key={section.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold">{section.name}</label>
                      <span className="text-sm text-muted-foreground">
                        {tempTargets[section.category] || 0}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[tempTargets[section.category] || 0]}
                      onValueChange={(val) => {
                        setTempTargets({ ...tempTargets, [section.category]: val[0] });
                      }}
                    />
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold">{isRTL ? "المجموع" : "Total"}</span>
                    <span className={`text-sm font-bold ${
                      Object.values(tempTargets).reduce((a, b) => a + b, 0) === 100 
                        ? "text-primary" 
                        : "text-destructive"
                    }`}>
                      {Object.values(tempTargets).reduce((a, b) => a + b, 0)}%
                    </span>
                  </div>
                  <Button onClick={handleSaveTargets} className="w-full">
                    <Check className="w-4 h-4 ml-2" />
                    {isRTL ? "حفظ" : "Save"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        <h3 className="text-lg font-bold text-right">رحلاتك</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isOverTarget = section.importance > section.target;
            const isUnderTarget = section.importance < section.target;
            return (
              <div 
                key={section.name} 
                onClick={() => navigate(section.path)}
                className="bg-card rounded-2xl p-4 border border-border space-y-3 cursor-pointer hover:border-primary/50 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isOverTarget 
                          ? "bg-red-500/20 text-red-500" 
                          : isUnderTarget 
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-primary/20 text-primary"
                      }`}>
                        {section.importance}% / {section.target}%
                      </span>
                    </div>
                    {section.remaining !== 0 && (
                      <span className={`text-[9px] ${
                        section.remaining > 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {section.remaining > 0 
                          ? `${isRTL ? "المتبقي:" : "Remaining:"} ${section.remaining}%`
                          : `${isRTL ? "زيادة:" : "Over by:"} ${Math.abs(section.remaining)}%`
                        }
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{section.name}</span>
                    <div className={`w-7 h-7 rounded-lg ${section.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-left text-xs text-muted-foreground">عادات {section.habits}</p>
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
                    <span className="text-sm font-bold">{section.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart with Time Period Selector */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <Select value={timePeriod} onValueChange={(v: any) => setTimePeriod(v)}>
            <SelectTrigger className="w-32 text-xs">
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
          <h3 className="text-lg font-bold text-right">التحليلات</h3>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> القرآن</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> العمل</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> الرياضة</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> المعرفة</span>
            </div>
            <h4 className="font-semibold text-sm">نظرة عامة</h4>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(220,18%,14%)", border: "1px solid hsl(220,14%,22%)", borderRadius: "8px", fontSize: 12 }} />
              <Line type="monotone" dataKey="quran" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="work" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sport" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="knowledge" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="px-4 space-y-3">
        <h3 className="text-lg font-bold text-right">تحليل تفصيلي</h3>
        <div className="grid grid-cols-2 gap-3">
          {detailedAnalytics.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="bg-card rounded-2xl p-4 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-primary font-semibold">{cat.progress}%</span>
                    <span className="text-[9px] text-muted-foreground">
                      {cat.importance}% {isRTL ? "أهمية" : "importance"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold">{cat.name}</span>
                    <div className={`w-5 h-5 rounded-md ${cat.color} flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <div><span className="font-semibold text-foreground">{cat.high}%</span><br/>الأعلى</div>
                  <div className="text-right"><span className="font-semibold text-foreground">{cat.avg}%</span><br/>المتوسط</div>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`grad-${cat.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cat.stroke} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={cat.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey={cat.dataKey} stroke={cat.stroke} fill={`url(#grad-${cat.dataKey})`} strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
