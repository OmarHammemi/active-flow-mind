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
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";

const dayNamesAr = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const Index = () => {
  const navigate = useNavigate();
  const { tasks, loading, getTasksForDate } = useTasks();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [selectedDate] = useState(new Date());
  
  // Target importance percentages for each section (stored in localStorage)
  const [targetImportance, setTargetImportance] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('section_target_importance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { quran: 40, work: 40, knowledge: 10, sport: 10 };
      }
    }
    return { quran: 40, work: 40, knowledge: 10, sport: 10 };
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tempTargets, setTempTargets] = useState<Record<string, number>>(targetImportance);

  // Reset temp targets when dialog opens
  useEffect(() => {
    if (editDialogOpen) {
      setTempTargets(targetImportance);
    }
  }, [editDialogOpen, targetImportance]);

  // Save target importance to localStorage
  useEffect(() => {
    localStorage.setItem('section_target_importance', JSON.stringify(targetImportance));
  }, [targetImportance]);

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

  // Generate weekly data from actual task completions
  const weekData = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 6 }); // Saturday
    const weekDays = eachDayOfInterval({ start: weekStart, end: subDays(weekStart, -6) });
    
    return weekDays.map((date, index) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = getTasksForDate(date);
      
      const getCategoryProgress = (category: 'quran' | 'work' | 'sport' | 'knowledge') => {
        const catTasks = dayTasks.filter(t => t.category === category);
        const completed = catTasks.filter(t => t.completed_dates?.includes(dateStr) || false);
        const totalImp = catTasks.reduce((sum, t) => sum + (t.importance || 0), 0);
        const completedImp = completed.reduce((sum, t) => sum + (t.importance || 0), 0);
        return totalImp > 0 ? Math.round((completedImp / totalImp) * 100) : 0;
      };

      return {
        day: dayNamesAr[index],
        quran: getCategoryProgress('quran'),
        work: getCategoryProgress('work'),
        sport: getCategoryProgress('sport'),
        knowledge: getCategoryProgress('knowledge'),
      };
    });
  }, [tasks, selectedDate, getTasksForDate]);

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
      
      // Calculate average and high from week data
      const weekValues = weekData.map(d => d[cat.dataKey as keyof typeof d] as number);
      const avg = weekValues.length > 0 
        ? Math.round(weekValues.reduce((a, b) => a + b, 0) / weekValues.length) 
        : 0;
      const high = weekValues.length > 0 ? Math.max(...weekValues) : 0;

      return {
        ...cat,
        progress,
        avg,
        high,
        importance: totalImp,
      };
    });
  }, [todayTasks, todayStr, weekData]);

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

      {/* Weekly Chart */}
      <div className="px-4 space-y-3">
        <h3 className="text-lg font-bold text-right">التحليلات الأسبوعية</h3>
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
            <LineChart data={weekData}>
              <XAxis dataKey="day" tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
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
                  <AreaChart data={weekData}>
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
