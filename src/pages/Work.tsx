import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, Plus, X, Circle, CheckCircle2 } from "lucide-react";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const Work = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "مهمة 1", done: false },
    { id: "2", text: "مهمة 2", done: false },
    { id: "3", text: "مهمة 3", done: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, done: false }]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="pb-4">
      <div className="mx-4 bg-card rounded-2xl p-4 border border-border mb-4">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">+XP 0</span>
            <p className="text-xs text-muted-foreground mt-1">{doneCount}/{tasks.length} مكتمل</p>
            <p className="text-2xl font-bold">{tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0}%</p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <h2 className="text-lg font-bold">العمل والإنتاجية</h2>
              <p className="text-xs text-muted-foreground">حقق أهدافك المهنية</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{doneCount}/{tasks.length} مهم</span>
          <h3 className="font-bold">إكمال المهام اليومية</h3>
        </div>

        {tasks.map((task) => (
          <div key={task.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.text}</span>
              <button onClick={() => toggleTask(task.id)}>
                {task.done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Add task */}
        <div className="bg-card rounded-xl p-3 border border-border">
          <div className="flex gap-2 items-center">
            <Button onClick={addTask} size="sm" variant="ghost" className="shrink-0 text-primary">
              <Plus className="w-5 h-5" />
              <span className="text-sm">إضافة</span>
            </Button>
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="أضف مهمة جديدة..."
              className="text-right border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
