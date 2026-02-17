import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit } from "lucide-react";
import { format } from "date-fns";
import { useTasks } from "@/contexts/TaskContext";
import { TaskScheduleType, Task } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface EditTaskDialogProps {
  task: Task;
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

export default function EditTaskDialog({ task, trigger }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [scheduleType, setScheduleType] = useState<TaskScheduleType>(task.schedule_type);
  
  // Daily schedule
  const [dailyStartDate, setDailyStartDate] = useState<Date>(
    task.daily_start_date ? new Date(task.daily_start_date) : new Date()
  );
  const [dailyWeeks, setDailyWeeks] = useState(task.daily_duration_weeks || 1);
  
  // Weekly schedule
  const [weeklyDays, setWeeklyDays] = useState<number[]>(task.weekly_days || []);
  const [weeklyStartDate, setWeeklyStartDate] = useState<Date>(
    task.weekly_start_date ? new Date(task.weekly_start_date) : new Date()
  );
  const [weeklyWeeks, setWeeklyWeeks] = useState(task.weekly_duration_weeks || 1);
  
  // One-time schedule
  const [oneTimeDate, setOneTimeDate] = useState<Date>(
    task.one_time_date ? new Date(task.one_time_date) : new Date()
  );
  
  // Importance percentage
  const [importance, setImportance] = useState<number[]>([task.importance || 10]);

  const { updateTask, tasks } = useTasks();
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  // Calculate current total importance for this category (excluding current task)
  const currentCategoryTasks = tasks.filter(t => t.category === task.category && t.id !== task.id);
  const currentTotalImportance = currentCategoryTasks.reduce((sum, t) => sum + (t.importance || 0), 0);
  const remainingImportance = 100 - currentTotalImportance;
  const maxImportance = Math.min(remainingImportance + (importance[0] || 0), 100);

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setScheduleType(task.schedule_type);
    setDailyStartDate(task.daily_start_date ? new Date(task.daily_start_date) : new Date());
    setDailyWeeks(task.daily_duration_weeks || 1);
    setWeeklyDays(task.weekly_days || []);
    setWeeklyStartDate(task.weekly_start_date ? new Date(task.weekly_start_date) : new Date());
    setWeeklyWeeks(task.weekly_duration_weeks || 1);
    setOneTimeDate(task.one_time_date ? new Date(task.one_time_date) : new Date());
    setImportance([task.importance || 10]);
  }, [task]);

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
      schedule_type: scheduleType,
      importance: importanceValue,
    };

    if (scheduleType === 'daily') {
      taskData.daily_start_date = dailyStartDate.toISOString().split('T')[0];
      taskData.daily_duration_weeks = dailyWeeks;
      // Clear other schedule types
      taskData.weekly_days = undefined;
      taskData.weekly_start_date = undefined;
      taskData.weekly_duration_weeks = undefined;
      taskData.one_time_date = undefined;
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
      // Clear other schedule types
      taskData.daily_start_date = undefined;
      taskData.daily_duration_weeks = undefined;
      taskData.one_time_date = undefined;
    } else if (scheduleType === 'one-time') {
      taskData.one_time_date = oneTimeDate.toISOString().split('T')[0];
      // Clear other schedule types
      taskData.daily_start_date = undefined;
      taskData.daily_duration_weeks = undefined;
      taskData.weekly_days = undefined;
      taskData.weekly_start_date = undefined;
      taskData.weekly_duration_weeks = undefined;
    }

    const { error } = await updateTask(task.id, taskData);

    if (error) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل في تحديث المهمة" : "Failed to update task"),
        variant: "destructive",
      });
    } else {
      toast({
        title: isRTL ? "نجح" : "Success",
        description: isRTL ? "تم تحديث المهمة بنجاح" : "Task updated successfully",
      });
      setOpen(false);
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
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isRTL ? "تعديل المهمة" : "Edit Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{isRTL ? "عنوان المهمة" : "Task Title"}</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRTL ? "أدخل عنوان المهمة" : "Enter task title"}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{isRTL ? "الوصف (اختياري)" : "Description (Optional)"}</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isRTL ? "أدخل وصف المهمة" : "Enter task description"}
              className="text-right min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? "الأهمية" : "Importance"}</Label>
            <div className="flex items-center gap-4">
              <Slider
                min={0}
                max={maxImportance}
                step={1}
                value={importance}
                onValueChange={setImportance}
                className="flex-1"
              />
              <span className="w-12 text-center text-sm font-medium">{importance[0]}%</span>
            </div>
            {currentTotalImportance > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                {isRTL ? `الأهمية الحالية للمهام الأخرى في هذه الفئة: ${currentTotalImportance}%` : `Current importance for other tasks in this category: ${currentTotalImportance}%`}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{isRTL ? "نوع الجدولة" : "Schedule Type"}</Label>
            <RadioGroup value={scheduleType} onValueChange={(v) => setScheduleType(v as TaskScheduleType)}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="daily" id="edit-daily" />
                <Label htmlFor="edit-daily" className="cursor-pointer">{isRTL ? "يومي" : "Daily"}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="weekly" id="edit-weekly" />
                <Label htmlFor="edit-weekly" className="cursor-pointer">{isRTL ? "أسبوعي" : "Weekly"}</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="one-time" id="edit-one-time" />
                <Label htmlFor="edit-one-time" className="cursor-pointer">{isRTL ? "مرة واحدة" : "One-time"}</Label>
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
                <Label htmlFor="edit-daily-weeks">{isRTL ? "عدد الأسابيع" : "Number of Weeks"}</Label>
                <Input
                  id="edit-daily-weeks"
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
                        id={`edit-day-${day.value}`}
                        checked={weeklyDays.includes(day.value)}
                        onCheckedChange={() => toggleWeekDay(day.value)}
                      />
                      <Label htmlFor={`edit-day-${day.value}`} className="cursor-pointer text-sm">
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
                <Label htmlFor="edit-weekly-weeks">{isRTL ? "عدد الأسابيع" : "Number of Weeks"}</Label>
                <Input
                  id="edit-weekly-weeks"
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

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {isRTL ? "حفظ التغييرات" : "Save Changes"}
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
