import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Target } from "lucide-react";
import { format } from "date-fns";
import { useTasks } from "@/contexts/TaskContext";
import { TaskScheduleType } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface CreateTaskDialogProps {
  category: 'work' | 'sport' | 'knowledge' | 'quran' | 'other';
  trigger?: React.ReactNode;
  selectedDate?: Date; // Date to filter tasks for importance calculation
}

const weekDays = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

export default function CreateTaskDialog({ category, trigger, selectedDate = new Date() }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState<TaskScheduleType>('daily');
  
  // Daily schedule
  const [dailyStartDate, setDailyStartDate] = useState<Date>(new Date());
  const [dailyWeeks, setDailyWeeks] = useState(1);
  
  // Weekly schedule
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [weeklyStartDate, setWeeklyStartDate] = useState<Date>(new Date());
  const [weeklyWeeks, setWeeklyWeeks] = useState(1);
  
  // One-time schedule
  const [oneTimeDate, setOneTimeDate] = useState<Date>(new Date());
  
  // Importance percentage - will be clamped based on remaining importance
  const [importance, setImportance] = useState<number[]>([10]);

  const { createTask, tasks, getTasksForDate } = useTasks();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  
  // Calculate importance limits whenever dialog opens or tasks change
  // Only count tasks for the selected date (each day has its own 100%)
  useEffect(() => {
    if (!open) return;
    
    // Get tasks for the selected date, then filter by category
    const dateTasks = getTasksForDate(selectedDate);
    const currentCategoryTasks = dateTasks.filter(t => t.category === category);
    const currentTotalImportance = currentCategoryTasks.reduce((sum, t) => {
      let imp = t.importance;
      
      // Handle string numbers (convert "10" to 10)
      if (typeof imp === 'string') {
        imp = parseFloat(imp);
      }
      
      if (typeof imp === 'number' && !isNaN(imp) && imp >= 0 && imp <= 100) {
        return sum + imp;
      }
      return sum;
    }, 0);
    const remainingImportance = Math.max(0, 100 - currentTotalImportance);
    
    // Always update importance based on remaining
    setImportance(prev => {
      if (remainingImportance <= 0) {
        return [0]; // Must be 0 when no remaining
      } else if (prev[0] > remainingImportance) {
        return [remainingImportance]; // Clamp to remaining
      } else if (prev[0] < 1) {
        return [Math.min(1, remainingImportance)]; // Minimum 1 if there's remaining
      }
      // If current value is valid, keep it (but ensure it doesn't exceed remaining)
      return [Math.min(prev[0], remainingImportance)];
    });
  }, [open, tasks, category, selectedDate, getTasksForDate]);

  // Calculate current total importance for this category
  // Only count tasks for the selected date (each day has its own 100%)
  // Only count tasks that have a valid importance value (0-100)
  const dateTasks = getTasksForDate(selectedDate);
  const currentCategoryTasks = dateTasks.filter(t => t.category === category);
  const currentTotalImportance = currentCategoryTasks.reduce((sum, t) => {
    let imp = t.importance;
    
    // Handle string numbers (convert "10" to 10)
    if (typeof imp === 'string') {
      imp = parseFloat(imp);
    }
    
    // Only count if importance is a valid number between 0 and 100
    if (typeof imp === 'number' && !isNaN(imp) && imp >= 0 && imp <= 100) {
      return sum + imp;
    }
    
    // If importance is undefined, null, or invalid, count as 0 (not 100!)
    return sum;
  }, 0);
  const remainingImportance = Math.max(0, 100 - currentTotalImportance);
  const maxImportance = Math.max(1, remainingImportance); // Max should be remaining, minimum 1

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال عنوان المهمة" : "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    // Validate importance
    const importanceValue = importance[0] || 0;
    if (importanceValue <= 0) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى تحديد أهمية المهمة (أكبر من 0%)" : "Please set task importance (greater than 0%)",
        variant: "destructive",
      });
      return;
    }

    if (remainingImportance <= 0) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "لا توجد أهمية متبقية. يجب حذف أو تعديل المهام الموجودة أولاً." : "No remaining importance. Please delete or edit existing tasks first.",
        variant: "destructive",
      });
      return;
    }

    if (currentTotalImportance + importanceValue > 100) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? `إجمالي الأهمية يجب أن يكون 100%. المتبقي: ${remainingImportance}%` : `Total importance must be 100%. Remaining: ${remainingImportance}%`,
        variant: "destructive",
      });
      return;
    }

    let taskData: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      schedule_type: scheduleType,
      importance: Math.max(0, Math.min(100, importanceValue)), // Ensure importance is between 0-100
    };

    if (scheduleType === 'daily') {
      taskData.daily_start_date = dailyStartDate.toISOString().split('T')[0];
      taskData.daily_duration_weeks = dailyWeeks;
    } else if (scheduleType === 'weekly') {
      if (weeklyDays.length === 0) {
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: isRTL ? "يرجى اختيار يوم واحد على الأقل" : "Please select at least one day",
          variant: "destructive",
        });
        return;
      }
      taskData.weekly_days = weeklyDays;
      taskData.weekly_start_date = weeklyStartDate.toISOString().split('T')[0];
      taskData.weekly_duration_weeks = weeklyWeeks;
    } else if (scheduleType === 'one-time') {
      taskData.one_time_date = oneTimeDate.toISOString().split('T')[0];
    }

    const { error } = await createTask(taskData);
    
    if (error) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل في إنشاء المهمة" : "Failed to create task"),
        variant: "destructive",
      });
    } else {
      toast({
        title: isRTL ? "نجح" : "Success",
        description: isRTL ? "تم إنشاء المهمة بنجاح" : "Task created successfully",
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setScheduleType('daily');
      setDailyStartDate(new Date());
      setDailyWeeks(1);
      setWeeklyDays([]);
      setWeeklyStartDate(new Date());
      setWeeklyWeeks(1);
      setOneTimeDate(new Date());
      setImportance([10]);
    }
  };

  const toggleWeekDay = (day: number) => {
    setWeeklyDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost" className="text-primary">
            <Plus className="w-5 h-5" />
            <span className="text-sm">{isRTL ? "إضافة" : "Add"}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isRTL ? "إنشاء مهمة جديدة" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{isRTL ? "عنوان المهمة" : "Task Title"}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRTL ? "أدخل عنوان المهمة" : "Enter task title"}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{isRTL ? "الوصف (اختياري)" : "Description (Optional)"}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isRTL ? "أدخل وصف المهمة" : "Enter task description"}
              className="text-right min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? "نوع الجدولة" : "Schedule Type"}</Label>
            <RadioGroup value={scheduleType} onValueChange={(v) => setScheduleType(v as TaskScheduleType)}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="cursor-pointer">{isRTL ? "يومي" : "Daily"}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="cursor-pointer">{isRTL ? "أسبوعي" : "Weekly"}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time" className="cursor-pointer">{isRTL ? "مرة واحدة" : "One-time"}</Label>
              </div>
            </RadioGroup>
          </div>

          {scheduleType === 'daily' && (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="space-y-2">
                <Label>{isRTL ? "تاريخ البدء" : "Start Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dailyStartDate, "yyyy-MM-dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dailyStartDate}
                      onSelect={(date) => date && setDailyStartDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-weeks">{isRTL ? "عدد الأسابيع" : "Number of Weeks"}</Label>
                <Input
                  id="daily-weeks"
                  type="number"
                  min="1"
                  value={dailyWeeks}
                  onChange={(e) => setDailyWeeks(parseInt(e.target.value) || 1)}
                  className="text-right"
                />
              </div>
            </div>
          )}

          {scheduleType === 'weekly' && (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="space-y-2">
                <Label>{isRTL ? "أيام الأسبوع" : "Days of Week"}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {weekDays.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={weeklyDays.includes(day.value)}
                        onCheckedChange={() => toggleWeekDay(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="cursor-pointer text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "تاريخ البدء" : "Start Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(weeklyStartDate, "yyyy-MM-dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={weeklyStartDate}
                      onSelect={(date) => date && setWeeklyStartDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly-weeks">{isRTL ? "عدد الأسابيع" : "Number of Weeks"}</Label>
                <Input
                  id="weekly-weeks"
                  type="number"
                  min="1"
                  value={weeklyWeeks}
                  onChange={(e) => setWeeklyWeeks(parseInt(e.target.value) || 1)}
                  className="text-right"
                />
              </div>
            </div>
          )}

          {scheduleType === 'one-time' && (
            <div className="space-y-2 border rounded-lg p-4">
              <Label>{isRTL ? "تاريخ المهمة" : "Task Date"}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-right font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(oneTimeDate, "yyyy-MM-dd")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={oneTimeDate}
                    onSelect={(date) => date && setOneTimeDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {isRTL ? "أهمية المهمة" : "Task Importance"}
              </Label>
              <span className="text-sm font-semibold text-primary">
                {remainingImportance <= 0 ? 0 : importance[0]}%
              </span>
            </div>
            <Slider
              value={remainingImportance <= 0 ? [0] : importance}
              onValueChange={(newValue) => {
                // Ensure the value doesn't exceed remaining importance
                if (remainingImportance <= 0) {
                  setImportance([0]);
                } else {
                  const clampedValue = Math.min(Math.max(1, newValue[0]), remainingImportance);
                  setImportance([clampedValue]);
                }
              }}
              min={remainingImportance <= 0 ? 0 : 1}
              max={Math.max(0, remainingImportance)}
              step={1}
              className="w-full"
              disabled={remainingImportance <= 0}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isRTL ? "المتبقي:" : "Remaining:"} {remainingImportance}%</span>
              <span>{isRTL ? "الإجمالي:" : "Total:"} {currentTotalImportance + (remainingImportance <= 0 ? 0 : importance[0])}%</span>
            </div>
            {currentCategoryTasks.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {isRTL 
                  ? `المهام لهذا اليوم في هذه الفئة: ${currentCategoryTasks.length} (${currentTotalImportance}% مستخدم)` 
                  : `Tasks for this date in this category: ${currentCategoryTasks.length} (${currentTotalImportance}% used)`}
              </p>
            )}
            {remainingImportance <= 0 && (
              <p className="text-xs text-destructive">
                {isRTL ? "تحذير: لا توجد أهمية متبقية. يجب حذف أو تعديل المهام الموجودة أولاً." : "Warning: No remaining importance. Please delete or edit existing tasks first."}
              </p>
            )}
            {currentTotalImportance + importance[0] > 100 && (
              <p className="text-xs text-destructive">
                {isRTL ? "تحذير: الإجمالي يتجاوز 100%" : "Warning: Total exceeds 100%"}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {isRTL ? "إنشاء" : "Create"}
            </Button>
            <Button onClick={() => setOpen(false)} variant="outline" className="flex-1">
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
