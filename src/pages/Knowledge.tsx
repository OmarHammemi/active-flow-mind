import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, BookMarked, ListTodo, Plus, X, Circle, CheckCircle2, BookOpen, Clock, Calendar } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import EditTaskDialog from "@/components/EditTaskDialog";
import { format } from "date-fns";
import { Task } from "@/lib/supabase";
import { getBooks, addBook as addBookToDb, updateBook as updateBookInDb, deleteBook as deleteBookFromDb } from "@/services/database";
import type { Book as BookType } from "@/lib/supabase";

const Knowledge = () => {
  const { tasks, loading, deleteTask, completeTask, uncompleteTask, getTasksForDate } = useTasks();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load books from database
  const [books, setBooks] = useState<BookType[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookPages, setNewBookPages] = useState("");

  // Load books from database
  useEffect(() => {
    const loadBooks = async () => {
      if (!user) {
        // Fallback to localStorage if not logged in
        const saved = localStorage.getItem('knowledge_books');
        if (saved) {
          try {
            const localBooks = JSON.parse(saved);
            // Convert to BookType format
            setBooks(localBooks.map((b: any) => ({
              id: b.id,
              user_id: '',
              title: b.title,
              author: b.author || null,
              current_page: b.currentPage || 0,
              total_pages: b.totalPages || 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })));
          } catch {
            setBooks([]);
          }
        }
        setBooksLoading(false);
        return;
      }

      try {
        const dbBooks = await getBooks(user.id);
        setBooks(dbBooks);
        
        // Migrate from localStorage if database is empty
        if (dbBooks.length === 0) {
          const saved = localStorage.getItem('knowledge_books');
          if (saved) {
            try {
              const localBooks = JSON.parse(saved);
              if (localBooks.length > 0) {
                // Migrate to database
                for (const book of localBooks) {
                  await addBookToDb(
                    user.id,
                    book.title,
                    book.author || null,
                    book.totalPages || 100
                  );
                }
                // Reload from database
                const migrated = await getBooks(user.id);
                setBooks(migrated);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } catch (error) {
        console.error('Error loading books:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('knowledge_books');
        if (saved) {
          try {
            const localBooks = JSON.parse(saved);
            setBooks(localBooks.map((b: any) => ({
              id: b.id,
              user_id: '',
              title: b.title,
              author: b.author || null,
              current_page: b.currentPage || 0,
              total_pages: b.totalPages || 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })));
          } catch {
            setBooks([]);
          }
        }
      } finally {
        setBooksLoading(false);
      }
    };

    loadBooks();
  }, [user]);

  // Filter tasks for knowledge category and current date
  const knowledgeTasks = useMemo(() => {
    const todayTasks = getTasksForDate(selectedDate);
    return todayTasks.filter(task => task.category === 'knowledge');
  }, [tasks, selectedDate, getTasksForDate]);

  const todayStr = selectedDate.toISOString().split('T')[0];
  const completedToday = knowledgeTasks.filter(task => {
    return task.completed_dates?.includes(todayStr) || false;
  });
  const doneCount = completedToday.length;
  const totalCount = knowledgeTasks.length;

  // Calculate weighted progress based on importance
  const totalImportance = knowledgeTasks.reduce((sum, task) => sum + (task.importance || 0), 0);
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

  const handleAddBook = async () => {
    if (!newBookTitle.trim()) {
      return;
    }
    
    if (!user) {
      // Fallback to localStorage if not logged in
      const newBook: BookType = {
      id: Date.now().toString(),
        user_id: '',
        title: newBookTitle.trim(),
        author: newBookAuthor.trim() || null,
        current_page: 0,
        total_pages: Math.max(1, parseInt(newBookPages) || 100),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      localStorage.setItem('knowledge_books', JSON.stringify(updatedBooks.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        currentPage: b.current_page,
        totalPages: b.total_pages,
      }))));
      setNewBookTitle("");
      setNewBookAuthor("");
      setNewBookPages("");
      return;
    }

    const { data, error } = await addBookToDb(
      user.id,
      newBookTitle.trim(),
      newBookAuthor.trim() || null,
      Math.max(1, parseInt(newBookPages) || 100)
    );

    if (error) {
      console.error('Error adding book:', error);
      return;
    }

    if (data) {
      // Reload books from database to ensure consistency
      const reloadedBooks = await getBooks(user.id);
      setBooks(reloadedBooks);
    setNewBookTitle("");
    setNewBookAuthor("");
    setNewBookPages("");
    }
  };

  const updateBookProgress = async (id: string, page: number) => {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    const updatedPage = Math.min(page, book.total_pages);
    
    if (!user) {
      // Fallback to localStorage
      const updatedBooks = books.map(b => b.id === id ? { ...b, current_page: updatedPage } : b);
      setBooks(updatedBooks);
      localStorage.setItem('knowledge_books', JSON.stringify(updatedBooks.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        currentPage: b.current_page,
        totalPages: b.total_pages,
      }))));
      return;
    }

    const { error } = await updateBookInDb(user.id, id, { current_page: updatedPage });
    if (error) {
      console.error('Error updating book:', error);
      return;
    }
    // Update local state optimistically
    setBooks(books.map(b => b.id === id ? { ...b, current_page: updatedPage } : b));
  };

  const handleDeleteBook = async (id: string) => {
    if (!user) {
      // Fallback to localStorage
      const filteredBooks = books.filter(b => b.id !== id);
      setBooks(filteredBooks);
      localStorage.setItem('knowledge_books', JSON.stringify(filteredBooks.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        currentPage: b.current_page,
        totalPages: b.total_pages,
      }))));
      return;
    }

    const { error } = await deleteBookFromDb(user.id, id);
    if (error) {
      console.error('Error deleting book:', error);
      return;
    }
    // Reload books from database to ensure consistency
    const reloadedBooks = await getBooks(user.id);
    setBooks(reloadedBooks);
  };

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
              <h2 className="text-lg font-bold">{isRTL ? "المعرفة والتعلم" : "Knowledge & Learning"}</h2>
              <p className="text-xs text-muted-foreground">{isRTL ? "اغتنم وقتك بالعلم النافع" : "Make the most of your time with beneficial knowledge"}</p>
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
          ) : knowledgeTasks.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <p className="text-muted-foreground mb-4">
                {isRTL ? "لا توجد مهام لهذا اليوم" : "No tasks for today"}
              </p>
              <CreateTaskDialog category="knowledge" selectedDate={selectedDate} />
            </div>
          ) : (
            <>
              {knowledgeTasks.map((task) => {
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
                        <EditTaskDialog task={task} selectedDate={selectedDate} />
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
            <CreateTaskDialog category="knowledge" />
          </div>
        </TabsContent>

        {/* Books */}
        <TabsContent value="books" className="space-y-3 mt-4">
          {books.map((book) => (
            <div key={book.id} className="bg-card rounded-2xl p-4 border border-border space-y-3">
              <div className="flex items-start justify-between">
                <button onClick={() => handleDeleteBook(book.id)} className="text-muted-foreground hover:text-destructive mt-1">
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
                <span className="text-xs text-muted-foreground whitespace-nowrap">{book.current_page}/{book.total_pages}</span>
                <div className="w-full bg-muted rounded-full h-2 flex-1">
                  <div className="bg-pink-500 h-2 rounded-full transition-all" style={{ width: `${(book.current_page / book.total_pages) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-pink-500">{Math.round((book.current_page / book.total_pages) * 100)}%</span>
              </div>
              <div className="flex gap-2 items-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs" 
                  onClick={() => updateBookProgress(book.id, Math.min(book.current_page + 10, book.total_pages))}
                  disabled={book.current_page >= book.total_pages}
                >
                  +10 {isRTL ? "صفحات" : "pages"}
                </Button>
                <Input
                  type="number"
                  placeholder={isRTL ? "الصفحة الحالية" : "Current page"}
                  className="text-right text-xs h-8"
                  value={book.current_page || ""}
                  min={0}
                  max={book.total_pages}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    updateBookProgress(book.id, Math.max(0, Math.min(value, book.total_pages)));
                  }}
                />
              </div>
            </div>
          ))}

          {/* Add book */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <h4 className="font-semibold text-right">{isRTL ? "إضافة كتاب جديد" : "Add New Book"}</h4>
            <Input 
              value={newBookTitle} 
              onChange={(e) => setNewBookTitle(e.target.value)} 
              placeholder={isRTL ? "عنوان الكتاب..." : "Book title..."} 
              className="text-right"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newBookTitle.trim()) {
                  handleAddBook();
                }
              }}
            />
            <div className="flex gap-2">
              <Input 
                value={newBookPages} 
                onChange={(e) => setNewBookPages(e.target.value)} 
                placeholder={isRTL ? "عدد الصفحات" : "Total pages"} 
                type="number" 
                min="1"
                className="w-28 text-right" 
              />
              <Input 
                value={newBookAuthor} 
                onChange={(e) => setNewBookAuthor(e.target.value)} 
                placeholder={isRTL ? "المؤلف..." : "Author..."} 
                className="text-right flex-1" 
              />
            </div>
            <Button 
              onClick={handleAddBook} 
              className="w-full"
              disabled={!newBookTitle.trim()}
            >
              <Plus className="w-4 h-4 ml-1" /> {isRTL ? "إضافة كتاب" : "Add Book"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Knowledge;
