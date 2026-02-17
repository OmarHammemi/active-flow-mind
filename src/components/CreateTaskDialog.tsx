import { useState } from "react";
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

export default function CreateTaskDialog({ category, trigger }: CreateTaskDialogProps) {
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
  
  // Importance percentage
  const [importance, setImportance] = useState<number[]>([10]);

  const { createTask, tasks } = useTasks();
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  // Calculate current total importance for this category
  const currentCategoryTasks = tasks.filter(t => t.category === category);
  const currentTotalImportance = currentCategoryTasks.reduce((sum, t) => sum + (t.importance || 0), 0);
  const remainingImportance = 100 - currentTotalImportance;
  const maxImportance = Math.min(remainingImportance + (importance[0] || 0), 100);

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
      importance: importanceValue,
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
                {importance[0]}%
              </span>
            </div>
            <Slider
              value={importance}
              onValueChange={setImportance}
              min={1}
              max={maxImportance}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isRTL ? "المتبقي:" : "Remaining:"} {remainingImportance}%</span>
              <span>{isRTL ? "الإجمالي:" : "Total:"} {currentTotalImportance + importance[0]}%</span>
            </div>
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
