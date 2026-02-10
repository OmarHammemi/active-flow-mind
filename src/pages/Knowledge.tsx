import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, BookMarked, ListTodo, Plus, X, Circle, CheckCircle2, BookOpen } from "lucide-react";

interface KTask {
  id: string;
  text: string;
  done: boolean;
}

interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
}

const Knowledge = () => {
  const [tasks, setTasks] = useState<KTask[]>([
    { id: "1", text: "قراءة 30 دقيقة يومياً", done: false },
    { id: "2", text: "مراجعة الملاحظات", done: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const [books, setBooks] = useState<Book[]>([
    { id: "1", title: "العادات الذرية", author: "جيمس كلير", currentPage: 45, totalPages: 320 },
    { id: "2", title: "فن اللامبالاة", author: "مارك مانسون", currentPage: 0, totalPages: 224 },
  ]);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookPages, setNewBookPages] = useState("");

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

  const addBook = () => {
    if (!newBookTitle.trim()) return;
    setBooks([...books, {
      id: Date.now().toString(),
      title: newBookTitle,
      author: newBookAuthor,
      currentPage: 0,
      totalPages: parseInt(newBookPages) || 100,
    }]);
    setNewBookTitle("");
    setNewBookAuthor("");
    setNewBookPages("");
  };

  const updateBookProgress = (id: string, page: number) => {
    setBooks(books.map(b => b.id === id ? { ...b, currentPage: Math.min(page, b.totalPages) } : b));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(b => b.id !== id));
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
              <h2 className="text-lg font-bold">المعرفة والتعلم</h2>
              <p className="text-xs text-muted-foreground">اغتنم وقتك بالعلم النافع</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="px-4">
        <TabsList className="w-full bg-card border border-border">
          <TabsTrigger value="books" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookMarked className="w-3.5 h-3.5 ml-1" /> الكتب
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ListTodo className="w-3.5 h-3.5 ml-1" /> المهام
          </TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks" className="space-y-3 mt-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
              <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.text}</span>
                <button onClick={() => toggleTask(task.id)}>
                  {task.done ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                </button>
              </div>
            </div>
          ))}
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex gap-2 items-center">
              <Button onClick={addTask} size="sm" variant="ghost" className="shrink-0 text-primary">
                <Plus className="w-5 h-5" />
              </Button>
              <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="أضف مهمة تعلم جديدة..." className="text-right border-0 bg-transparent focus-visible:ring-0" />
            </div>
          </div>
        </TabsContent>

        {/* Books */}
        <TabsContent value="books" className="space-y-3 mt-4">
          {books.map((book) => (
            <div key={book.id} className="bg-card rounded-2xl p-4 border border-border space-y-3">
              <div className="flex items-start justify-between">
                <button onClick={() => deleteBook(book.id)} className="text-muted-foreground hover:text-destructive mt-1">
                  <X className="w-4 h-4" />
                </button>
                <div className="text-right flex-1 mr-0 ml-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div>
                      <h4 className="font-bold">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-pink-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{book.currentPage}/{book.totalPages}</span>
                <div className="w-full bg-muted rounded-full h-2 flex-1">
                  <div className="bg-pink-500 h-2 rounded-full transition-all" style={{ width: `${(book.currentPage / book.totalPages) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-pink-500">{Math.round((book.currentPage / book.totalPages) * 100)}%</span>
              </div>
              <div className="flex gap-2 items-center">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => updateBookProgress(book.id, book.currentPage + 10)}>+10 صفحات</Button>
                <Input
                  type="number"
                  placeholder="الصفحة الحالية"
                  className="text-right text-xs h-8"
                  onChange={(e) => updateBookProgress(book.id, parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          ))}

          {/* Add book */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <h4 className="font-semibold text-right">إضافة كتاب جديد</h4>
            <Input value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)} placeholder="عنوان الكتاب..." className="text-right" />
            <div className="flex gap-2">
              <Input value={newBookPages} onChange={(e) => setNewBookPages(e.target.value)} placeholder="عدد الصفحات" type="number" className="w-28 text-right" />
              <Input value={newBookAuthor} onChange={(e) => setNewBookAuthor(e.target.value)} placeholder="المؤلف..." className="text-right" />
            </div>
            <Button onClick={addBook} className="w-full">
              <Plus className="w-4 h-4 ml-1" /> إضافة كتاب
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Knowledge;
