import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Compass, ListTodo, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Circle, CheckCircle2, Bookmark, X, Calendar } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import { format } from "date-fns";
import { Task } from "@/lib/supabase";

const prayerTimes = [
  { name: "الفجر", time: "05:30", passed: true },
  { name: "الشروق", time: "07:05", passed: true },
  { name: "الظهر", time: "12:45", passed: false, next: true },
  { name: "العصر", time: "15:50", passed: false },
  { name: "المغرب", time: "18:20", passed: false },
  { name: "العشاء", time: "19:50", passed: false },
];


const hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
const miladiMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const suraList = [
  { number: 1, name: "الفاتحة", startPage: 1 },
  { number: 2, name: "البقرة", startPage: 2 },
  { number: 3, name: "آل عمران", startPage: 50 },
  { number: 4, name: "النساء", startPage: 77 },
  { number: 5, name: "المائدة", startPage: 106 },
  { number: 6, name: "الأنعام", startPage: 128 },
  { number: 7, name: "الأعراف", startPage: 151 },
  { number: 8, name: "الأنفال", startPage: 177 },
  { number: 9, name: "التوبة", startPage: 187 },
  { number: 10, name: "يونس", startPage: 208 },
  { number: 11, name: "هود", startPage: 221 },
  { number: 12, name: "يوسف", startPage: 235 },
  { number: 13, name: "الرعد", startPage: 249 },
  { number: 14, name: "إبراهيم", startPage: 255 },
  { number: 15, name: "الحجر", startPage: 262 },
  { number: 16, name: "النحل", startPage: 267 },
  { number: 17, name: "الإسراء", startPage: 282 },
  { number: 18, name: "الكهف", startPage: 293 },
  { number: 19, name: "مريم", startPage: 305 },
  { number: 20, name: "طه", startPage: 312 },
  { number: 21, name: "الأنبياء", startPage: 322 },
  { number: 22, name: "الحج", startPage: 332 },
  { number: 23, name: "المؤمنون", startPage: 342 },
  { number: 24, name: "النور", startPage: 350 },
  { number: 25, name: "الفرقان", startPage: 359 },
  { number: 26, name: "الشعراء", startPage: 367 },
  { number: 27, name: "النمل", startPage: 377 },
  { number: 28, name: "القصص", startPage: 385 },
  { number: 29, name: "العنكبوت", startPage: 396 },
  { number: 30, name: "الروم", startPage: 404 },
  { number: 36, name: "يس", startPage: 440 },
  { number: 55, name: "الرحمن", startPage: 531 },
  { number: 56, name: "الواقعة", startPage: 534 },
  { number: 67, name: "الملك", startPage: 562 },
  { number: 78, name: "النبأ", startPage: 582 },
  { number: 112, name: "الإخلاص", startPage: 604 },
  { number: 113, name: "الفلق", startPage: 604 },
  { number: 114, name: "الناس", startPage: 604 },
];

const sampleVerses: Record<number, { sura: string; verses: string[] }> = {
  1: { sura: "الفاتحة", verses: ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾", "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾", "الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾", "مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾", "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾", "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾"] },
  2: { sura: "البقرة", verses: ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الم ﴿١﴾", "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ ﴿٢﴾", "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ ﴿٣﴾"] },
};

function toHijri(date: Date) {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

const Quran = () => {
  const { tasks, loading, deleteTask, completeTask, uncompleteTask, getTasksForDate } = useTasks();
  const { isRTL } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarType, setCalendarType] = useState<"hijri" | "miladi">("hijri");
  const [currentDate] = useState(new Date());

  // Filter tasks for quran category and current date
  const quranTasks = useMemo(() => {
    const todayTasks = getTasksForDate(selectedDate);
    return todayTasks.filter(task => task.category === 'quran');
  }, [tasks, selectedDate, getTasksForDate]);

  const todayStr = selectedDate.toISOString().split('T')[0];
  const completedToday = quranTasks.filter(task => {
    return task.completed_dates?.includes(todayStr) || false;
  });
  const doneCount = completedToday.length;
  const totalCount = quranTasks.length;

  // Calculate weighted progress based on importance
  const totalImportance = quranTasks.reduce((sum, task) => sum + (task.importance || 0), 0);
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

  // Quran reader state
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem("quran_last_page");
    return saved ? parseInt(saved) : 1;
  });
  const [selectedSura, setSelectedSura] = useState<string>("");
  const [goToPage, setGoToPage] = useState("");
  const [lastRead, setLastRead] = useState(() => {
    const saved = localStorage.getItem("quran_bookmark");
    return saved ? JSON.parse(saved) : null;
  });

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem("quran_last_page", currentPage.toString());
  }, [currentPage]);

  const saveBookmark = () => {
    const currentSura = getCurrentSura();
    const bookmark = { page: currentPage, sura: currentSura, date: new Date().toLocaleDateString("ar-EG") };
    localStorage.setItem("quran_bookmark", JSON.stringify(bookmark));
    setLastRead(bookmark);
  };

  const getCurrentSura = () => {
    for (let i = suraList.length - 1; i >= 0; i--) {
      if (currentPage >= suraList[i].startPage) return suraList[i].name;
    }
    return "الفاتحة";
  };

  const getVerses = () => {
    if (currentPage <= 1) return sampleVerses[1];
    if (currentPage <= 49) return sampleVerses[2];
    return { sura: getCurrentSura(), verses: ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "..."] };
  };

  const handleSuraSelect = (value: string) => {
    setSelectedSura(value);
    const sura = suraList.find(s => s.number.toString() === value);
    if (sura) setCurrentPage(sura.startPage);
  };

  const handleGoToPage = () => {
    const p = parseInt(goToPage);
    if (p >= 1 && p <= 604) {
      setCurrentPage(p);
      setGoToPage("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const hijri = toHijri(currentDate);
  const nextPrayer = prayerTimes.find(p => p.next);
  const currentVerses = getVerses();

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
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
              <h2 className="text-lg font-bold">{isRTL ? "القرآن والصلاة" : "Quran & Prayer"}</h2>
              <p className="text-xs text-muted-foreground">{isRTL ? "تقوية علاقتك بالله" : "Strengthen your relationship with Allah"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="prayer" className="px-4">
        <TabsList className="w-full bg-card border border-border">
          <TabsTrigger value="tasks" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ListTodo className="w-3.5 h-3.5 ml-1" /> المهام
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CalendarIcon className="w-3.5 h-3.5 ml-1" /> التقويم
          </TabsTrigger>
          <TabsTrigger value="quran" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="w-3.5 h-3.5 ml-1" /> القرآن
          </TabsTrigger>
          <TabsTrigger value="prayer" className="flex-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-3.5 h-3.5 ml-1" /> الصلاة
          </TabsTrigger>
        </TabsList>

        {/* Prayer Times */}
        <TabsContent value="prayer" className="space-y-3 mt-4">
          <h3 className="font-bold text-right">مواقيت الصلاة</h3>
          {nextPrayer && (
            <div className="bg-card rounded-2xl p-4 border border-primary/30 border-2">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="text-2xl font-bold text-primary">{nextPrayer.time}</span>
                  <p className="text-xs text-muted-foreground">باقي ٢ ساعة</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">الصلاة القادمة</p>
                  <p className="text-xl font-bold">{nextPrayer.name}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {prayerTimes.map((prayer, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 border-b border-border last:border-0 ${prayer.next ? "bg-primary/10" : ""}`}>
                <span className={`font-semibold ${prayer.next ? "text-primary" : ""}`}>{prayer.time}</span>
                <div className="flex items-center gap-2">
                  <span className={prayer.next ? "font-bold" : ""}>{prayer.name}</span>
                  <span className={`w-2 h-2 rounded-full ${prayer.passed ? "bg-primary" : prayer.next ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Quran Reader */}
        <TabsContent value="quran" className="space-y-4 mt-4">
          {/* Last read bookmark */}
          {lastRead && (
            <div
              className="bg-primary/10 rounded-2xl p-3 border border-primary/20 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
              onClick={() => setCurrentPage(lastRead.page)}
            >
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                متابعة القراءة ←
              </Button>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-xs font-semibold">آخر قراءة: {lastRead.sura}</p>
                  <p className="text-[10px] text-muted-foreground">صفحة {lastRead.page} • {lastRead.date}</p>
                </div>
                <Bookmark className="w-4 h-4 text-primary" />
              </div>
            </div>
          )}

          {/* Sura & Page selection */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <h4 className="font-semibold text-right">اختر السورة أو الصفحة</h4>
            <div className="flex gap-2">
              <Select value={selectedSura} onValueChange={handleSuraSelect}>
                <SelectTrigger className="flex-1 text-right">
                  <SelectValue placeholder="اختر سورة..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {suraList.map(s => (
                    <SelectItem key={s.number} value={s.number.toString()}>
                      {s.number}. {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGoToPage} size="sm" className="shrink-0">انتقل</Button>
              <Input
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
                placeholder="رقم الصفحة (1-604)..."
                type="number"
                min={1}
                max={604}
                className="text-right"
              />
            </div>
          </div>

          {/* Reader */}
          <div className="bg-card rounded-2xl p-5 border border-border text-center space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={saveBookmark} className="text-primary">
                <Bookmark className="w-4 h-4 ml-1" /> حفظ
              </Button>
              <div>
                <h3 className="text-xl font-bold">سورة {currentVerses.sura}</h3>
                <p className="text-xs text-muted-foreground">صفحة {currentPage}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-6 space-y-4 text-lg leading-loose" style={{ fontFamily: "'Traditional Arabic', serif" }}>
              {currentVerses.verses.map((v, i) => (
                <p key={i}>{v}</p>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(604, p + 1))}
              >
                ← السابق
              </Button>
              <span className="text-sm text-muted-foreground font-semibold">
                {currentPage} / 604
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                التالي →
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
            <div className="flex justify-center gap-2">
              <Button size="sm" variant={calendarType === "miladi" ? "default" : "outline"} onClick={() => setCalendarType("miladi")} className="text-xs">ميلادي</Button>
              <Button size="sm" variant={calendarType === "hijri" ? "default" : "outline"} onClick={() => setCalendarType("hijri")} className="text-xs">هجري</Button>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold">
                {calendarType === "hijri" ? `${hijriMonths[hijri.month - 1]} ${hijri.year} هـ` : `${miladiMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </h3>
              <p className="text-xs text-muted-foreground">
                {calendarType === "hijri" ? `${currentDate.getDate()} ${miladiMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}` : `${hijri.day} ${hijriMonths[hijri.month - 1]} ${hijri.year} هـ`}
              </p>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 text-center space-y-1">
              <p className="text-sm text-muted-foreground">{dayNames[currentDate.getDay()]}</p>
              <p className="text-4xl font-bold text-primary">{calendarType === "hijri" ? hijri.day : currentDate.getDate()}</p>
              <p className="text-sm font-semibold">
                {calendarType === "hijri" ? `${hijriMonths[hijri.month - 1]} ${hijri.year} هـ` : `${miladiMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </p>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-center">
                {["أح", "إث", "ثل", "أر", "خم", "جم", "سب"].map(d => (
                  <span key={d} className="text-[10px] text-muted-foreground font-medium py-1">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {generateCalendarDays().map((day, i) => (
                  <div key={i} className={`text-xs py-1.5 rounded-lg ${day === currentDate.getDate() ? "bg-primary text-primary-foreground font-bold" : day ? "hover:bg-muted cursor-pointer" : ""}`}>
                    {day || ""}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">{dayNames[currentDate.getDay()]}</span>
                <span className="font-semibold">اليوم</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">{hijri.day} {hijriMonths[hijri.month - 1]} {hijri.year} هـ</span>
                <span className="font-semibold">التاريخ الهجري</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border">
                <span className="text-muted-foreground">{currentDate.getDate()} {miladiMonths[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <span className="font-semibold">التاريخ الميلادي</span>
              </div>
            </div>
          </div>
        </TabsContent>

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
          ) : quranTasks.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <p className="text-muted-foreground mb-4">
                {isRTL ? "لا توجد مهام لهذا اليوم" : "No tasks for today"}
              </p>
              <CreateTaskDialog category="quran" />
            </div>
          ) : (
            <>
              {quranTasks.map((task) => {
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
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Add task */}
          <div className="bg-card rounded-xl p-3 border border-border">
            <CreateTaskDialog category="quran" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Quran;
