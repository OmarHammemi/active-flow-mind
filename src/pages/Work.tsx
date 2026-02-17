import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, X, Circle, CheckCircle2, Calendar, Clock, Edit } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import EditTaskDialog from "@/components/EditTaskDialog";
import { format } from "date-fns";
import { Task } from "@/lib/supabase";

const Work = () => {
  const { tasks, loading, deleteTask, completeTask, uncompleteTask, getTasksForDate } = useTasks();
  const { isRTL } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter tasks for work category and current date
  const workTasks = useMemo(() => {
    const todayTasks = getTasksForDate(selectedDate);
    return todayTasks.filter(task => task.category === 'work');
  }, [tasks, selectedDate, getTasksForDate]);

  const todayStr = selectedDate.toISOString().split('T')[0];
  const completedToday = workTasks.filter(task => {
    return task.completed_dates?.includes(todayStr) || false;
  });
  const doneCount = completedToday.length;
  const totalCount = workTasks.length;

  // Calculate weighted progress based on importance
  const totalImportance = workTasks.reduce((sum, task) => sum + (task.importance || 0), 0);
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

  if (loading) {
    return (
      <div className="pb-4 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="pb-4">
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
              <h2 className="text-lg font-bold">{isRTL ? "العمل والإنتاجية" : "Work & Productivity"}</h2>
              <p className="text-xs text-muted-foreground">
                {isRTL ? "حقق أهدافك المهنية" : "Achieve your professional goals"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
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

        {workTasks.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <p className="text-muted-foreground mb-4">
              {isRTL ? "لا توجد مهام لهذا اليوم" : "No tasks for today"}
            </p>
            <CreateTaskDialog category="work" />
          </div>
        ) : (
          <>
            {workTasks.map((task) => {
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
          <CreateTaskDialog category="work" />
        </div>
      </div>
    </div>
  );
};

export default Work;
