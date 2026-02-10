import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Flame, Scale, Plus, Trash2, Check } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

interface SportTask {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
}

interface WeightEntry {
  date: string;
  weight: number;
}

const Sport = () => {
  const [tasks, setTasks] = useState<SportTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const [calories, setCalories] = useState({ consumed: 0, goal: 2000 });
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [meals, setMeals] = useState<{ name: string; calories: number }[]>([]);

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([
    { date: "١ فبراير", weight: 80 },
    { date: "٣ فبراير", weight: 79.5 },
    { date: "٥ فبراير", weight: 79.2 },
    { date: "٧ فبراير", weight: 78.8 },
    { date: "٩ فبراير", weight: 78.5 },
  ]);
  const [newWeight, setNewWeight] = useState("");

  const addTask = () => {
    if (!newTask.trim() || !newTarget) return;
    setTasks([...tasks, { id: Date.now().toString(), name: newTask, target: parseInt(newTarget), current: 0, icon: "🏋️" }]);
    setNewTask("");
    setNewTarget("");
  };

  const incrementTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, current: Math.min(t.current + 1, t.target) } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
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
    if (!newWeight) return;
    const today = new Date();
    const dayStr = `${today.getDate()} فبراير`;
    setWeightEntries([...weightEntries, { date: dayStr, weight: parseFloat(newWeight) }]);
    setNewWeight("");
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="mx-4 bg-card rounded-2xl p-4 border border-border mb-4">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">+XP 0</span>
            <p className="text-xs text-muted-foreground mt-1">0/5 مكتمل</p>
            <p className="text-2xl font-bold">0%</p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <h2 className="text-lg font-bold">الصحة والرياضة</h2>
              <p className="text-xs text-muted-foreground">اعتنِ بصحتك - أمانة من الله</p>
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
          {tasks.map((task) => (
            <div key={task.id} className="bg-gradient-to-l from-orange-500 to-orange-600 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button onClick={() => deleteTask(task.id)} className="text-white/60 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-right">
                  <h3 className="font-bold text-white">{task.name}</h3>
                  <p className="text-xs text-white/70">هدف يومي {task.target}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{task.current}/{task.target}</p>
                <p className="text-xs text-white/70">اضغط للعد</p>
              </div>
              <button
                onClick={() => incrementTask(task.id)}
                className="mx-auto block w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl transition-all active:scale-90"
              >
                {task.current >= task.target ? <Check className="w-6 h-6 text-white" /> : task.icon}
              </button>
              <div className="flex justify-between text-xs text-white/70">
                <span>Progress</span>
                <span>{Math.round((task.current / task.target) * 100)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${(task.current / task.target) * 100}%` }} />
              </div>
            </div>
          ))}

          {/* Add task */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <h4 className="font-semibold text-right">إضافة تمرين جديد</h4>
            <div className="flex gap-2">
              <Button onClick={addTask} size="sm" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
              <Input
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="الهدف"
                type="number"
                className="w-20 text-right"
              />
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="اسم التمرين..."
                className="text-right"
              />
            </div>
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
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary">{weightEntries[weightEntries.length - 1]?.weight || 0}</span>
                <span className="text-sm text-muted-foreground mr-1">كغ</span>
              </div>
              <h3 className="font-bold">تتبع الوزن</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weightEntries}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160,84%,44%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160,84%,44%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "hsl(220,18%,14%)", border: "1px solid hsl(220,14%,22%)", borderRadius: "8px", fontSize: 12 }} />
                <Area type="monotone" dataKey="weight" stroke="hsl(160,84%,44%)" fillOpacity={1} fill="url(#weightGrad)" strokeWidth={2} dot={{ r: 4, fill: "hsl(160,84%,44%)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Add weight */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <h4 className="font-semibold text-right">تسجيل الوزن</h4>
            <div className="flex gap-2">
              <Button onClick={addWeight} size="sm" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
              <Input value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="الوزن بالكيلوغرام..." type="number" step="0.1" className="text-right" />
            </div>
          </div>

          {/* Weight history */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
            <h4 className="font-semibold text-right">السجل</h4>
            {[...weightEntries].reverse().map((entry, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm font-semibold">{entry.weight} كغ</span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sport;
