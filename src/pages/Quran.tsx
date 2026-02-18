import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Compass, ListTodo, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Circle, CheckCircle2, Bookmark, X, Calendar, Sun, Moon, MoonStar, Heart, Sparkles, Sunrise, Sunset } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import EditTaskDialog from "@/components/EditTaskDialog";
import { format } from "date-fns";
import { Task } from "@/lib/supabase";

// Prayer names in Arabic and English
const prayerNames = {
  Fajr: { ar: "الفجر", en: "Fajr" },
  Sunrise: { ar: "الشروق", en: "Sunrise" },
  Dhuhr: { ar: "الظهر", en: "Dhuhr" },
  Asr: { ar: "العصر", en: "Asr" },
  Maghrib: { ar: "المغرب", en: "Maghrib" },
  Isha: { ar: "العشاء", en: "Isha" },
};


const hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
const miladiMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Complete list of all 114 suras with page numbers
const suraList = [
  { number: 1, name: "الفاتحة", startPage: 1, verses: 7 },
  { number: 2, name: "البقرة", startPage: 2, verses: 286 },
  { number: 3, name: "آل عمران", startPage: 50, verses: 200 },
  { number: 4, name: "النساء", startPage: 77, verses: 176 },
  { number: 5, name: "المائدة", startPage: 106, verses: 120 },
  { number: 6, name: "الأنعام", startPage: 128, verses: 165 },
  { number: 7, name: "الأعراف", startPage: 151, verses: 206 },
  { number: 8, name: "الأنفال", startPage: 177, verses: 75 },
  { number: 9, name: "التوبة", startPage: 187, verses: 129 },
  { number: 10, name: "يونس", startPage: 208, verses: 109 },
  { number: 11, name: "هود", startPage: 221, verses: 123 },
  { number: 12, name: "يوسف", startPage: 235, verses: 111 },
  { number: 13, name: "الرعد", startPage: 249, verses: 43 },
  { number: 14, name: "إبراهيم", startPage: 255, verses: 52 },
  { number: 15, name: "الحجر", startPage: 262, verses: 99 },
  { number: 16, name: "النحل", startPage: 267, verses: 128 },
  { number: 17, name: "الإسراء", startPage: 282, verses: 111 },
  { number: 18, name: "الكهف", startPage: 293, verses: 110 },
  { number: 19, name: "مريم", startPage: 305, verses: 98 },
  { number: 20, name: "طه", startPage: 312, verses: 135 },
  { number: 21, name: "الأنبياء", startPage: 322, verses: 112 },
  { number: 22, name: "الحج", startPage: 332, verses: 78 },
  { number: 23, name: "المؤمنون", startPage: 342, verses: 118 },
  { number: 24, name: "النور", startPage: 350, verses: 64 },
  { number: 25, name: "الفرقان", startPage: 359, verses: 77 },
  { number: 26, name: "الشعراء", startPage: 367, verses: 227 },
  { number: 27, name: "النمل", startPage: 377, verses: 93 },
  { number: 28, name: "القصص", startPage: 385, verses: 88 },
  { number: 29, name: "العنكبوت", startPage: 396, verses: 69 },
  { number: 30, name: "الروم", startPage: 404, verses: 60 },
  { number: 31, name: "لقمان", startPage: 411, verses: 34 },
  { number: 32, name: "السجدة", startPage: 415, verses: 30 },
  { number: 33, name: "الأحزاب", startPage: 418, verses: 73 },
  { number: 34, name: "سبأ", startPage: 428, verses: 54 },
  { number: 35, name: "فاطر", startPage: 434, verses: 45 },
  { number: 36, name: "يس", startPage: 440, verses: 83 },
  { number: 37, name: "الصافات", startPage: 446, verses: 182 },
  { number: 38, name: "ص", startPage: 453, verses: 88 },
  { number: 39, name: "الزمر", startPage: 458, verses: 75 },
  { number: 40, name: "غافر", startPage: 467, verses: 85 },
  { number: 41, name: "فصلت", startPage: 477, verses: 54 },
  { number: 42, name: "الشورى", startPage: 483, verses: 53 },
  { number: 43, name: "الزخرف", startPage: 489, verses: 89 },
  { number: 44, name: "الدخان", startPage: 496, verses: 59 },
  { number: 45, name: "الجاثية", startPage: 499, verses: 37 },
  { number: 46, name: "الأحقاف", startPage: 502, verses: 35 },
  { number: 47, name: "محمد", startPage: 507, verses: 38 },
  { number: 48, name: "الفتح", startPage: 511, verses: 29 },
  { number: 49, name: "الحجرات", startPage: 515, verses: 18 },
  { number: 50, name: "ق", startPage: 518, verses: 45 },
  { number: 51, name: "الذاريات", startPage: 520, verses: 60 },
  { number: 52, name: "الطور", startPage: 523, verses: 49 },
  { number: 53, name: "النجم", startPage: 526, verses: 62 },
  { number: 54, name: "القمر", startPage: 528, verses: 55 },
  { number: 55, name: "الرحمن", startPage: 531, verses: 78 },
  { number: 56, name: "الواقعة", startPage: 534, verses: 96 },
  { number: 57, name: "الحديد", startPage: 537, verses: 29 },
  { number: 58, name: "المجادلة", startPage: 542, verses: 22 },
  { number: 59, name: "الحشر", startPage: 545, verses: 24 },
  { number: 60, name: "الممتحنة", startPage: 549, verses: 13 },
  { number: 61, name: "الصف", startPage: 551, verses: 14 },
  { number: 62, name: "الجمعة", startPage: 553, verses: 11 },
  { number: 63, name: "المنافقون", startPage: 554, verses: 11 },
  { number: 64, name: "التغابن", startPage: 556, verses: 18 },
  { number: 65, name: "الطلاق", startPage: 558, verses: 12 },
  { number: 66, name: "التحريم", startPage: 560, verses: 12 },
  { number: 67, name: "الملك", startPage: 562, verses: 30 },
  { number: 68, name: "القلم", startPage: 564, verses: 52 },
  { number: 69, name: "الحاقة", startPage: 566, verses: 52 },
  { number: 70, name: "المعارج", startPage: 568, verses: 44 },
  { number: 71, name: "نوح", startPage: 570, verses: 28 },
  { number: 72, name: "الجن", startPage: 572, verses: 28 },
  { number: 73, name: "المزمل", startPage: 574, verses: 20 },
  { number: 74, name: "المدثر", startPage: 575, verses: 56 },
  { number: 75, name: "القيامة", startPage: 577, verses: 40 },
  { number: 76, name: "الإنسان", startPage: 578, verses: 31 },
  { number: 77, name: "المرسلات", startPage: 580, verses: 50 },
  { number: 78, name: "النبأ", startPage: 582, verses: 40 },
  { number: 79, name: "النازعات", startPage: 583, verses: 46 },
  { number: 80, name: "عبس", startPage: 585, verses: 42 },
  { number: 81, name: "التكوير", startPage: 586, verses: 29 },
  { number: 82, name: "الانفطار", startPage: 587, verses: 19 },
  { number: 83, name: "المطففين", startPage: 588, verses: 36 },
  { number: 84, name: "الانشقاق", startPage: 589, verses: 25 },
  { number: 85, name: "البروج", startPage: 590, verses: 22 },
  { number: 86, name: "الطارق", startPage: 591, verses: 17 },
  { number: 87, name: "الأعلى", startPage: 591, verses: 19 },
  { number: 88, name: "الغاشية", startPage: 592, verses: 26 },
  { number: 89, name: "الفجر", startPage: 593, verses: 30 },
  { number: 90, name: "البلد", startPage: 594, verses: 20 },
  { number: 91, name: "الشمس", startPage: 595, verses: 15 },
  { number: 92, name: "الليل", startPage: 595, verses: 21 },
  { number: 93, name: "الضحى", startPage: 596, verses: 11 },
  { number: 94, name: "الشرح", startPage: 596, verses: 8 },
  { number: 95, name: "التين", startPage: 597, verses: 8 },
  { number: 96, name: "العلق", startPage: 597, verses: 19 },
  { number: 97, name: "القدر", startPage: 598, verses: 5 },
  { number: 98, name: "البينة", startPage: 598, verses: 8 },
  { number: 99, name: "الزلزلة", startPage: 599, verses: 8 },
  { number: 100, name: "العاديات", startPage: 599, verses: 11 },
  { number: 101, name: "القارعة", startPage: 600, verses: 11 },
  { number: 102, name: "التكاثر", startPage: 600, verses: 8 },
  { number: 103, name: "العصر", startPage: 601, verses: 3 },
  { number: 104, name: "الهمزة", startPage: 601, verses: 9 },
  { number: 105, name: "الفيل", startPage: 601, verses: 5 },
  { number: 106, name: "قريش", startPage: 602, verses: 4 },
  { number: 107, name: "الماعون", startPage: 602, verses: 7 },
  { number: 108, name: "الكوثر", startPage: 602, verses: 3 },
  { number: 109, name: "الكافرون", startPage: 603, verses: 6 },
  { number: 110, name: "النصر", startPage: 603, verses: 3 },
  { number: 111, name: "المسد", startPage: 603, verses: 5 },
  { number: 112, name: "الإخلاص", startPage: 604, verses: 4 },
  { number: 113, name: "الفلق", startPage: 604, verses: 5 },
  { number: 114, name: "الناس", startPage: 604, verses: 6 },
];

const sampleVerses: Record<number, { sura: string; verses: string[] }> = {
  1: { sura: "الفاتحة", verses: ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾", "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾", "الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾", "مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾", "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾", "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾"] },
  2: { sura: "البقرة", verses: ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الم ﴿١﴾", "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ ﴿٢﴾", "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ ﴿٣﴾"] },
};

// Adhkar data
const adhkarData = {
  morning: {
    title: "أذكار الصباح",
    icon: "Sun",
    items: [
      { id: "morning1", text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ", count: 1, transliteration: "Asbahna wa asbahal-mulku lillah, wal-hamdu lillah" },
      { id: "morning2", text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", count: 1, transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur" },
      { id: "morning3", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, transliteration: "Subhanallahi wa bihamdihi" },
      { id: "morning4", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10, transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir" },
      { id: "morning5", text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي", count: 3, transliteration: "Allahumma afini fi badani, Allahumma afini fi sam'i, Allahumma afini fi basari" },
    ]
  },
  evening: {
    title: "أذكار المساء",
    icon: "Moon",
    items: [
      { id: "evening1", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ", count: 1, transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah" },
      { id: "evening2", text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", count: 1, transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir" },
      { id: "evening3", text: "آمَنَّا بِرَبِّنَا وَرَبِّ الْعَالَمِينَ", count: 7, transliteration: "Aamanna birabbina wa rabbil-alamin" },
      { id: "evening4", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", count: 1, transliteration: "Allahumma inni as'alukal-afwa wal-afiyah fid-dunya wal-akhirah" },
      { id: "evening5", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ", count: 3, transliteration: "Subhanallahi wa bihamdihi, adada khalqihi wa rida nafsihi wa zinata arshihi wa midada kalimatihi" },
    ]
  },
  beforeSleep: {
    title: "أذكار قبل النوم",
    icon: "MoonStar",
    items: [
      { id: "sleep1", text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", count: 1, transliteration: "Bismikallhumma amutu wa ahya" },
      { id: "sleep2", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", count: 3, transliteration: "Allahumma qini adhabaka yawma tab'athu ibadak" },
      { id: "sleep3", text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ", count: 1, transliteration: "Allahumma aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk" },
      { id: "sleep4", text: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ", count: 1, transliteration: "Amana ar-rasulu bima unzila ilayhi min rabbihi wal-mu'minun" },
      { id: "sleep5", text: "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا", count: 1, transliteration: "Allahumma innaka khalaqta nafsi wa anta tawaffaha, laka mamatuha wa mahyaha" },
    ]
  },
  afterPrayer: {
    title: "أذكار بعد الصلاة",
    icon: "Heart",
    items: [
      { id: "prayer1", text: "أَسْتَغْفِرُ اللَّهَ", count: 3, transliteration: "Astaghfirullah" },
      { id: "prayer2", text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", count: 1, transliteration: "Allahumma antas-salam wa minkas-salam, tabarakta ya dhal-jalali wal-ikram" },
      { id: "prayer3", text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 33, transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay'in qadir" },
      { id: "prayer4", text: "سُبْحَانَ اللَّهِ", count: 33, transliteration: "Subhanallah" },
      { id: "prayer5", text: "الْحَمْدُ لِلَّهِ", count: 33, transliteration: "Alhamdulillah" },
    ]
  },
  general: {
    title: "أذكار عامة",
    icon: "Sparkles",
    items: [
      { id: "general1", text: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", count: 10, transliteration: "Subhanallahi wal-hamdu lillahi wa la ilaha illallahu wallahu akbar" },
      { id: "general2", text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", count: 100, transliteration: "La hawla wa la quwwata illa billah" },
      { id: "general3", text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", count: 10, transliteration: "Allahumma salli wa sallim ala nabiyyina Muhammad" },
      { id: "general4", text: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ", count: 100, transliteration: "Rabbi ighfir li wa tub alayya innaka antat-tawwabur-rahim" },
      { id: "general5", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", count: 100, transliteration: "Subhanallahi wa bihamdihi, subhanallahil-azim" },
    ]
  }
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

  // Adhkar completion tracking
  const [adhkarCompleted, setAdhkarCompleted] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('adhkar_completed');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const todayKey = new Date().toISOString().split('T')[0];

  // Save adhkar completion to localStorage
  useEffect(() => {
    localStorage.setItem('adhkar_completed', JSON.stringify(adhkarCompleted));
  }, [adhkarCompleted]);

  const handleAdhkarComplete = (id: string, count: number) => {
    const key = `${todayKey}_${id}`;
    const current = adhkarCompleted[key] || 0;
    const newCount = Math.min(count, current + 1);
    setAdhkarCompleted({ ...adhkarCompleted, [key]: newCount });
  };

  const getAdhkarProgress = (id: string, count: number) => {
    const key = `${todayKey}_${id}`;
    return adhkarCompleted[key] || 0;
  };

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
  const [quranVerses, setQuranVerses] = useState<Record<number, { 
    verses: Array<{ text: string; number: number; isBismillah?: boolean; suraNumber?: number }> 
  }>>({});
  const [loadingVerses, setLoadingVerses] = useState(false);
  
  // Clear cache when page changes significantly (to save memory)
  useEffect(() => {
    // Keep only current page and adjacent pages in cache
    const pagesToKeep = [currentPage - 1, currentPage, currentPage + 1].filter(p => p >= 1 && p <= 604);
    const newCache: Record<number, { verses: string[] }> = {};
    pagesToKeep.forEach(page => {
      if (quranVerses[page]) {
        newCache[page] = quranVerses[page];
      }
    });
    if (Object.keys(newCache).length < Object.keys(quranVerses).length) {
      setQuranVerses(newCache);
    }
  }, [currentPage]);

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
      if (currentPage >= suraList[i].startPage) {
        return suraList[i];
      }
    }
    return suraList[0];
  };

  // Fetch verses for a specific page from API
  const fetchPageVerses = async (pageNumber: number): Promise<Array<{ text: string; number: number; isBismillah?: boolean; suraNumber?: number }>> => {
    if (quranVerses[pageNumber]) {
      return quranVerses[pageNumber].verses;
    }

    setLoadingVerses(true);
    try {
      // Get the primary surah for this page
      const primarySura = (() => {
        for (let i = suraList.length - 1; i >= 0; i--) {
          if (pageNumber >= suraList[i].startPage) {
            return suraList[i];
          }
        }
        return suraList[0];
      })();
      const surahNumber = primarySura.number;
      
      // Use Al-Quran Cloud API to get verses by surah (correct verse numbers, no Bismillah as verse 1)
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
      if (!response.ok) throw new Error("Failed to fetch verses");
      
      const data = await response.json();
      if (data.code === 200 && data.data) {
        // Map response.data.ayahs to verses array
        // This API returns correct verse numbers - Bismillah is NOT included as a verse
        const verses: Array<{ text: string; number: number; isBismillah?: boolean; suraNumber?: number }> = [];
        
        // Add Bismillah as decorative header (except for Surah 9)
        if (surahNumber !== 9) {
          verses.push({
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            number: 0,
            isBismillah: true,
            suraNumber: surahNumber
          });
        }
        
        // Map ayahs to verses - use ayah.numberInSurah for display number
        data.data.ayahs.forEach((ayah: any) => {
          verses.push({
            text: ayah.text,
            number: ayah.numberInSurah, // Correct verse number from API
            isBismillah: false,
            suraNumber: surahNumber
          });
        });
        
        setQuranVerses(prev => ({
          ...prev,
          [pageNumber]: { verses }
        }));
        return verses;
      }
    } catch (error) {
      console.error("Error fetching page verses:", error);
      // Fallback: try to get from sura-based API
    const currentSura = getCurrentSura();
      if (currentSura.number === 1 && sampleVerses[1]) {
        return sampleVerses[1].verses;
      }
      if (currentSura.number === 2 && sampleVerses[2]) {
        return sampleVerses[2].verses;
      }
    } finally {
      setLoadingVerses(false);
    }
    return [];
  };

  // Get suras present on current page
  const getSurasOnPage = (pageNumber: number) => {
    const suras: Array<{ number: number; name: string }> = [];
    let foundStart = false;
    
    for (let i = 0; i < suraList.length; i++) {
      const sura = suraList[i];
      const nextSura = suraList[i + 1];
      
      // Check if this page is within this sura's range
      if (pageNumber >= sura.startPage) {
        if (!nextSura || pageNumber < nextSura.startPage) {
          suras.push({ number: sura.number, name: sura.name });
          foundStart = true;
        } else if (pageNumber === nextSura.startPage - 1) {
          // Page might contain end of current sura and start of next
          suras.push({ number: sura.number, name: sura.name });
          if (i + 1 < suraList.length) {
            suras.push({ number: nextSura.number, name: nextSura.name });
          }
          break;
        }
      }
    }
    
    return suras.length > 0 ? suras : [{ number: getCurrentSura().number, name: getCurrentSura().name }];
  };

  const getVerses = async () => {
    const surasOnPage = getSurasOnPage(currentPage);
    const primarySura = surasOnPage[0];
    
    // Try to get verses from cache or fetch them
    let verses: Array<{ text: string; number: number; isBismillah?: boolean; suraNumber?: number }> = [];
    if (quranVerses[currentPage]) {
      verses = quranVerses[currentPage].verses;
    } else {
      // Fetch verses for this page
      verses = await fetchPageVerses(currentPage);
    }
    
    if (verses.length > 0) {
      return {
        sura: primarySura.name,
        verses: verses,
        suraNumber: primarySura.number,
        totalVerses: primarySura.verses,
        surasOnPage: surasOnPage
      };
    }
    
    // Fallback for first two suras
    if (primarySura.number === 1 && sampleVerses[1]) {
      return {
        sura: "الفاتحة",
        verses: sampleVerses[1].verses.map((v, i) => ({
          text: v,
          number: i + 1,
          isBismillah: i === 0,
          suraNumber: 1
        })),
        suraNumber: 1,
        totalVerses: 7,
        surasOnPage: [{ number: 1, name: "الفاتحة" }]
      };
    }
    if (primarySura.number === 2 && sampleVerses[2]) {
      return {
        sura: "البقرة",
        verses: sampleVerses[2].verses.map((v, i) => ({
          text: v,
          number: i + 1,
          isBismillah: i === 0,
          suraNumber: 2
        })),
        suraNumber: 2,
        totalVerses: 286,
        surasOnPage: [{ number: 2, name: "البقرة" }]
      };
    }
    
    // Default fallback
    return {
      sura: primarySura.name,
      verses: [
        {
          text: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`,
          number: 0,
          isBismillah: true,
          suraNumber: primarySura.number
        },
        {
          text: `${isRTL ? "سورة" : "Sura"} ${primarySura.name}`,
          number: 0,
          suraNumber: primarySura.number
        },
        {
          text: `${isRTL ? "جاري تحميل الآيات..." : "Loading verses..."}`,
          number: 0,
          suraNumber: primarySura.number
        }
      ],
      suraNumber: primarySura.number,
      totalVerses: primarySura.verses,
      surasOnPage: surasOnPage
    };
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

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<Array<{
    name: string;
    nameEn: string;
    time: string;
    timeObj: Date | null;
    passed: boolean;
    next: boolean;
    timeRemaining: string;
  }>>([]);
  const [prayerLoading, setPrayerLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>(() => {
    return localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update timezone when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const tz = localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      if (tz !== userTimezone) {
        setUserTimezone(tz);
      }
    };
    
    // Check for timezone changes periodically
    const interval = setInterval(handleStorageChange, 2000);
    return () => clearInterval(interval);
  }, [userTimezone]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Get user location or use default (Cairo as fallback)
  useEffect(() => {
    const getLocation = async () => {
      const savedLocation = localStorage.getItem("user_location");
      if (savedLocation) {
        try {
          const loc = JSON.parse(savedLocation);
          setUserLocation(loc);
        } catch {
          // Default to Cairo if parsing fails
          setUserLocation({ lat: 30.0444, lng: 31.2357 });
        }
      } else {
        // Try to get from browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const loc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setUserLocation(loc);
              localStorage.setItem("user_location", JSON.stringify(loc));
            },
            () => {
              // Default to Cairo if geolocation fails
              setUserLocation({ lat: 30.0444, lng: 31.2357 });
            }
          );
        } else {
          // Default to Cairo
          setUserLocation({ lat: 30.0444, lng: 31.2357 });
        }
      }
    };
    getLocation();
  }, []);

  // Fetch prayer times from Aladhan API
  useEffect(() => {
    if (!userLocation) return;

    const fetchPrayerTimes = async () => {
      setPrayerLoading(true);
      try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        
        // Use Aladhan API
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${userLocation.lat}&longitude=${userLocation.lng}&method=2&timezonestring=${userTimezone}`
        );
        
        if (!response.ok) throw new Error("Failed to fetch prayer times");
        
        const data = await response.json();
        const timings = data.data.timings;
        const dateForTimings = data.data.date; // API provides date info

        const prayers = [
          { key: "Fajr", name: prayerNames.Fajr, time: timings.Fajr },
          { key: "Sunrise", name: prayerNames.Sunrise, time: timings.Sunrise },
          { key: "Dhuhr", name: prayerNames.Dhuhr, time: timings.Dhuhr },
          { key: "Asr", name: prayerNames.Asr, time: timings.Asr },
          { key: "Maghrib", name: prayerNames.Maghrib, time: timings.Maghrib },
          { key: "Isha", name: prayerNames.Isha, time: timings.Isha },
        ];

        // Get current time - we'll compare everything in UTC milliseconds
        const now = new Date();
        let nextPrayerIndex = -1;

        // Process prayer times - API returns times already in the specified timezone
        // Get current time in user's timezone for comparison
        const nowInUserTz = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
        const currentHour = nowInUserTz.getHours();
        const currentMinute = nowInUserTz.getMinutes();
        const currentTimeMinutes = currentHour * 60 + currentMinute;
        
        const processedPrayers = prayers.map((prayer, index) => {
          const [hours, minutes] = prayer.time.split(":").map(Number);
          const prayerTimeMinutes = hours * 60 + minutes;
          
          // Check if prayer has passed today (in user's timezone)
          const passed = prayerTimeMinutes < currentTimeMinutes;
          
          // For countdown calculation, create a Date object
          // Get today's date in user's timezone
          const year = nowInUserTz.getFullYear();
          const month = nowInUserTz.getMonth();
          const day = nowInUserTz.getDate();
          
          // Create date string for prayer time
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
          
          // Calculate timezone offset to convert to proper Date object
          const browserNow = new Date();
          const browserTzStr = browserNow.toLocaleString("en-US");
          const userTzStr = browserNow.toLocaleString("en-US", { timeZone: userTimezone });
          const browserDate = new Date(browserTzStr);
          const userDate = new Date(userTzStr);
          const offsetMs = browserDate.getTime() - userDate.getTime();
          
          // Create prayer time date
          let prayerTime = new Date(new Date(dateStr).getTime() + offsetMs);
          
          // If passed, set for tomorrow
          if (passed) {
            prayerTime = new Date(prayerTime);
            prayerTime.setDate(prayerTime.getDate() + 1);
          }

          return {
            name: isRTL ? prayer.name.ar : prayer.name.en,
            nameEn: prayer.name.en,
            time: prayer.time,
            timeObj: prayerTime,
            passed,
            next: false, // Will be set below
            timeRemaining: "",
          };
        });

        // Find the next prayer - either the first upcoming prayer today, or Fajr tomorrow if all passed
        let actualNextPrayerIndex = -1;
        const upcomingToday = processedPrayers.filter((p, i) => !p.passed);
        
        if (upcomingToday.length > 0) {
          // There are prayers remaining today - find the earliest one
          const earliestToday = upcomingToday.reduce((earliest, current) => {
            const earliestMinutes = parseInt(earliest.time.split(":")[0]) * 60 + parseInt(earliest.time.split(":")[1]);
            const currentMinutes = parseInt(current.time.split(":")[0]) * 60 + parseInt(current.time.split(":")[1]);
            return currentMinutes < earliestMinutes ? current : earliest;
          });
          actualNextPrayerIndex = processedPrayers.findIndex(p => p.name === earliestToday.name && p.time === earliestToday.time);
        } else {
          // All prayers passed today - next prayer is Fajr tomorrow (index 0)
          actualNextPrayerIndex = 0;
        }

        // Mark all as not next except the actual next one
        const finalPrayers = processedPrayers.map((p, i) => ({
          ...p,
          next: i === actualNextPrayerIndex,
        }));

        setPrayerTimes(finalPrayers);
      } catch (error) {
        console.error("Error fetching prayer times:", error);
        // Fallback to default times
        const now = new Date();
        const defaultPrayers = [
          { name: isRTL ? "الفجر" : "Fajr", nameEn: "Fajr", time: "05:30", timeObj: null, passed: true, next: false, timeRemaining: "" },
          { name: isRTL ? "الشروق" : "Sunrise", nameEn: "Sunrise", time: "07:05", timeObj: null, passed: true, next: false, timeRemaining: "" },
          { name: isRTL ? "الظهر" : "Dhuhr", nameEn: "Dhuhr", time: "12:45", timeObj: null, passed: false, next: true, timeRemaining: "" },
          { name: isRTL ? "العصر" : "Asr", nameEn: "Asr", time: "15:50", timeObj: null, passed: false, next: false, timeRemaining: "" },
          { name: isRTL ? "المغرب" : "Maghrib", nameEn: "Maghrib", time: "18:20", timeObj: null, passed: false, next: false, timeRemaining: "" },
          { name: isRTL ? "العشاء" : "Isha", nameEn: "Isha", time: "19:50", timeObj: null, passed: false, next: false, timeRemaining: "" },
        ];
        setPrayerTimes(defaultPrayers);
      } finally {
        setPrayerLoading(false);
      }
    };

    fetchPrayerTimes();
    
    // Refresh every minute
    const interval = setInterval(fetchPrayerTimes, 60000);
    return () => clearInterval(interval);
  }, [userLocation, userTimezone, isRTL]);

  // Calculate time remaining for each prayer
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      setPrayerTimes(prev => prev.map(prayer => {
        if (!prayer.timeObj || prayer.passed) {
          return { ...prayer, timeRemaining: "" };
        }

        const diff = prayer.timeObj.getTime() - now.getTime();
        if (diff <= 0) {
          return { ...prayer, passed: true, next: false, timeRemaining: "" };
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let timeRemaining = "";
        if (hours > 0) {
          timeRemaining = isRTL ? `${hours}س ${minutes}د` : `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          timeRemaining = isRTL ? `${minutes}د ${seconds}ث` : `${minutes}m ${seconds}s`;
        } else {
          timeRemaining = isRTL ? `${seconds}ث` : `${seconds}s`;
        }

        return { ...prayer, timeRemaining };
      }));
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [isRTL]);

  const hijri = toHijri(currentDate);
  const nextPrayer = prayerTimes.find(p => p.next);
  const [currentVerses, setCurrentVerses] = useState<{
    sura: string;
    verses: Array<{ text: string; number: number; isBismillah?: boolean; suraNumber?: number }>;
    suraNumber?: number;
    totalVerses?: number;
    surasOnPage?: Array<{ number: number; name: string }>;
  }>({
    sura: "",
    verses: [],
  });

  // Load verses when page changes
  useEffect(() => {
    const loadVerses = async () => {
      const verses = await getVerses();
      setCurrentVerses(verses);
    };
    loadVerses();
  }, [currentPage]);

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
        <TabsList className="w-full bg-card border border-border grid grid-cols-5">
          <TabsTrigger value="tasks" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ListTodo className="w-3.5 h-3.5 ml-1" /> {isRTL ? "المهام" : "Tasks"}
          </TabsTrigger>
          <TabsTrigger value="adhkar" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Heart className="w-3.5 h-3.5 ml-1" /> {isRTL ? "الأذكار" : "Adhkar"}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CalendarIcon className="w-3.5 h-3.5 ml-1" /> {isRTL ? "التقويم" : "Calendar"}
          </TabsTrigger>
          <TabsTrigger value="quran" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="w-3.5 h-3.5 ml-1" /> {isRTL ? "القرآن" : "Quran"}
          </TabsTrigger>
          <TabsTrigger value="prayer" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-3.5 h-3.5 ml-1" /> {isRTL ? "الصلاة" : "Prayer"}
          </TabsTrigger>
        </TabsList>

        {/* Prayer Times */}
        <TabsContent value="prayer" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("user_location");
                window.location.reload();
              }}
              className="text-xs text-muted-foreground"
            >
              {isRTL ? "تحديث الموقع" : "Refresh Location"}
            </Button>
            <div className="text-right">
              <h3 className="font-bold text-lg">{isRTL ? "مواقيت الصلاة" : "Prayer Times"}</h3>
              {userLocation && (
                <p className="text-[10px] text-muted-foreground">
                  {userTimezone.replace(/_/g, " ")}
                </p>
              )}
                </div>
                </div>
          
          {prayerLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">{isRTL ? "جاري تحميل مواقيت الصلاة..." : "Loading prayer times..."}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Large Timer Display */}
              <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-3xl p-6 border-2 border-primary/40 shadow-2xl">
                <div className="text-center space-y-4">
                  {/* Current Time - Large Display */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-semibold">{isRTL ? "الوقت الحالي" : "Current Time"}</p>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-6 h-6 text-primary animate-pulse" />
                      <p className="text-5xl font-bold text-primary tabular-nums">
                        {currentTime.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZone: userTimezone,
                          hour12: localStorage.getItem("timeFormat") === "12"
                        })}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userTimezone.replace(/_/g, " ")}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-primary/20 my-4"></div>

                  {/* Next Prayer Countdown */}
                  {nextPrayer ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground font-semibold">{isRTL ? "الصلاة القادمة" : "Next Prayer"}</p>
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <Clock className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{nextPrayer.name}</p>
                          <p className="text-lg text-muted-foreground">
                            {(() => {
                const [hours, minutes] = nextPrayer.time.split(":").map(Number);
                const timeFormat = localStorage.getItem("timeFormat") || "24";
                if (timeFormat === "12") {
                  const period = hours >= 12 ? "PM" : "AM";
                  const displayHours = hours % 12 || 12;
                                return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
                }
                              return nextPrayer.time;
                            })()}
                          </p>
                        </div>
                      </div>
                      {nextPrayer.timeRemaining ? (
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground mb-3">{isRTL ? "الوقت المتبقي" : "Time Remaining"}</p>
                          <div className="bg-background/50 rounded-2xl p-4 border border-primary/30">
                            {(() => {
                              // Parse the timeRemaining string to extract hours, minutes, seconds
                              const timeStr = nextPrayer.timeRemaining;
                              let hours = 0, minutes = 0, seconds = 0;
                              
                              if (isRTL) {
                                // Arabic format: "2س 30د 45ث" or "30د 45ث" or "45ث"
                                const hourMatch = timeStr.match(/(\d+)س/);
                                const minMatch = timeStr.match(/(\d+)د/);
                                const secMatch = timeStr.match(/(\d+)ث/);
                                hours = hourMatch ? parseInt(hourMatch[1]) : 0;
                                minutes = minMatch ? parseInt(minMatch[1]) : 0;
                                seconds = secMatch ? parseInt(secMatch[1]) : 0;
                              } else {
                                // English format: "2h 30m 45s" or "30m 45s" or "45s"
                                const hourMatch = timeStr.match(/(\d+)h/);
                                const minMatch = timeStr.match(/(\d+)m/);
                                const secMatch = timeStr.match(/(\d+)s/);
                                hours = hourMatch ? parseInt(hourMatch[1]) : 0;
                                minutes = minMatch ? parseInt(minMatch[1]) : 0;
                                seconds = secMatch ? parseInt(secMatch[1]) : 0;
                              }
                              
                return (
                                <div className="flex items-center justify-center gap-3">
                                  {hours > 0 && (
                                    <div className="flex flex-col items-center">
                                      <div className="bg-primary/20 rounded-xl px-4 py-3 border-2 border-primary/30">
                                        <p className="text-3xl font-bold text-primary tabular-nums">{String(hours).padStart(2, '0')}</p>
                      </div>
                                      <p className="text-[10px] text-muted-foreground mt-1">{isRTL ? "ساعة" : "Hours"}</p>
                          </div>
                        )}
                                  {hours > 0 && <span className="text-2xl font-bold text-primary">:</span>}
                                  <div className="flex flex-col items-center">
                                    <div className="bg-primary/20 rounded-xl px-4 py-3 border-2 border-primary/30">
                                      <p className="text-3xl font-bold text-primary tabular-nums">{String(minutes).padStart(2, '0')}</p>
                      </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">{isRTL ? "دقيقة" : "Minutes"}</p>
                    </div>
                                  <span className="text-2xl font-bold text-primary">:</span>
                                  <div className="flex flex-col items-center">
                                    <div className="bg-primary/20 rounded-xl px-4 py-3 border-2 border-primary/30">
                                      <p className="text-3xl font-bold text-primary tabular-nums animate-pulse">{String(seconds).padStart(2, '0')}</p>
                      </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">{isRTL ? "ثانية" : "Seconds"}</p>
                    </div>
                  </div>
                );
              })()}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">{isRTL ? "جاري الحساب..." : "Calculating..."}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{isRTL ? "لا توجد صلاة قادمة" : "No upcoming prayer"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prayer Times Grid with Clocks */}
              <div className="grid grid-cols-2 gap-3">
                {prayerTimes.map((prayer, i) => {
                  const prayerIcons: Record<string, any> = {
                    "Fajr": Sunrise,
                    "Sunrise": Sun,
                    "Dhuhr": Sun,
                    "Asr": Sun,
                    "Maghrib": Sunset,
                    "Isha": Moon,
                  };
                  const Icon = prayerIcons[prayer.nameEn] || Clock;
                  
                  // Format time for display
                  const [hours, minutes] = prayer.time.split(":").map(Number);
                  const timeFormat = localStorage.getItem("timeFormat") || "24";
                  let displayTime = prayer.time;
                  if (timeFormat === "12") {
                    const period = hours >= 12 ? "PM" : "AM";
                    const displayHours = hours % 12 || 12;
                    displayTime = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`bg-card rounded-2xl p-4 border-2 transition-all ${
                        prayer.next
                          ? "border-primary/50 bg-primary/10 shadow-lg scale-[1.02]"
                          : prayer.passed
                          ? "border-border/50 bg-muted/30 opacity-75"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center relative border-2 ${
                          prayer.next
                            ? "bg-primary/20 border-primary"
                            : prayer.passed
                            ? "bg-muted border-muted-foreground/30"
                            : "bg-primary/10 border-primary/30"
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            prayer.next
                              ? "text-primary"
                              : prayer.passed
                              ? "text-muted-foreground"
                              : "text-primary/70"
                          }`} />
                          {prayer.next && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse border-2 border-background"></div>
                          )}
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          prayer.passed
                            ? "bg-primary"
                            : prayer.next
                            ? "bg-primary animate-pulse"
                            : "bg-muted-foreground/30"
                        }`} />
                      </div>
                      <div className="text-right space-y-2">
                        <p className={`text-sm font-semibold ${
                          prayer.next ? "text-primary" : prayer.passed ? "text-muted-foreground" : ""
                        }`}>
                          {prayer.name}
                        </p>
                        {/* Clock Display */}
                        <div className={`flex items-center justify-end gap-2 ${
                          prayer.next ? "text-primary" : prayer.passed ? "text-muted-foreground" : ""
                        }`}>
                          <div className="relative">
                            <Clock className={`w-5 h-5 ${
                              prayer.next ? "text-primary animate-pulse" : prayer.passed ? "text-muted-foreground" : "text-primary/70"
                            }`} />
                          </div>
                          <div>
                            <p className={`text-2xl font-bold leading-none ${
                              prayer.next ? "text-primary" : prayer.passed ? "text-muted-foreground line-through" : ""
                            }`}>
                              {displayTime}
                            </p>
                            {prayer.timeRemaining && !prayer.passed && (
                              <p className="text-[10px] font-semibold text-primary mt-0.5">
                                {prayer.timeRemaining}
                              </p>
                            )}
                          </div>
                        </div>
                        {prayer.passed && (
                          <p className="text-[10px] text-muted-foreground">{isRTL ? "مضت" : "Passed"}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Current Time Display */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الوقت الحالي" : "Current Time"}</p>
                    <p className="text-xl font-bold">
                      {currentTime.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        timeZone: userTimezone,
                        hour12: localStorage.getItem("timeFormat") === "12"
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {userTimezone.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </>
          )}
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
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Header Section - Sura Info (Traditional Quran Style) */}
            {currentVerses.suraNumber && (
              <div className="bg-teal-500 dark:bg-teal-600 text-white p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border-l border-white/30 pl-4">
                    <p className="text-xs opacity-90 mb-1">{isRTL ? "ركوعاتها" : "Ruku's"}</p>
                    <p className="text-lg font-bold">1</p>
                  </div>
                  <div className="border-l border-r border-white/30 px-4">
                    <p className="text-xs opacity-90 mb-1">
                      {currentVerses.suraNumber} {currentVerses.sura} {isRTL ? "(مكية)" : "(Meccan)"} {currentPage}
                    </p>
                    {currentVerses.verses.some(v => v.isBismillah) && currentVerses.suraNumber !== 9 && (
                      <p className="text-2xl font-bold mt-2 text-teal-100">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                    )}
                  </div>
                  <div className="border-r border-white/30 pr-4">
                    <p className="text-xs opacity-90 mb-1">{isRTL ? "آياتها" : "Verses"}</p>
                    <p className="text-lg font-bold">
                      {currentVerses.verses.filter(v => !v.isBismillah && v.number > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" onClick={saveBookmark} className="text-primary">
                  <Bookmark className="w-4 h-4 ml-1" /> {isRTL ? "حفظ" : "Bookmark"}
                </Button>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? "صفحة" : "Page"} {currentPage} / 604
                  </p>
                </div>
              </div>
            {loadingVerses ? (
              <div className="bg-gradient-to-b from-muted/30 to-muted/10 rounded-xl p-6 min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-muted-foreground">{isRTL ? "جاري تحميل الآيات..." : "Loading verses..."}</p>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-sky-50/50 via-background to-sky-50/30 dark:from-sky-950/20 dark:via-background dark:to-sky-950/10 min-h-[500px] p-6" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Arial', serif", direction: "rtl", textAlign: "right" }}>
                {currentVerses.verses.length > 0 ? (
                  <div className="space-y-1">
                    {/* Show Bismillah first if it exists - decorative header, NO verse number (except surah 9) */}
                    {currentVerses.verses.filter(v => v.isBismillah && currentVerses.suraNumber !== 9).map((verse, i) => (
                      <div key={`bismillah-${i}`} className="text-center py-4 mb-4 border-b-2 border-teal-200/30 dark:border-teal-800/30">
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 leading-relaxed" style={{ letterSpacing: "0.1em", fontVariantLigatures: "normal" }}>
                          {verse.text}
                        </p>
                      </div>
                    ))}
                    
                    {/* Show regular verses with numbers starting from (1) - ONLY actual verses, not Bismillah */}
                    {(() => {
                      const verses = currentVerses.verses.filter(v => !v.isBismillah && v.number > 0);
                      const surahNumber = currentVerses.suraNumber || 0;
                      
                      // SPECIAL CASE - Surah Al-Fatiha (surah 1): Keep Bismillah as verse 1
                      // SPECIAL CASE - Surah Al-Baqara and others (surah != 1 and != 9): Filter out Bismillah
                      const filteredVerses = verses
                        .filter(verse => {
                          // For Surah 1: Keep all verses including Bismillah
                          if (surahNumber === 1) {
                            return true;
                          }
                          // For Surah 9: Keep all verses (no Bismillah logic)
                          if (surahNumber === 9) {
                            return true;
                          }
                          // For all other surahs: Filter out Bismillah
                          return !verse.text.includes('بِسْمِ');
                        })
                        .map((verse, index) => ({
                          ...verse,
                          displayNumber: index + 1  // renumber from 1
                        }));
                      
                      return filteredVerses.map((verse, i) => {
                        // Safety check: Remove any Bismillah that might have slipped through (except for Surah 1)
                        let cleanText = verse.text;
                        if (surahNumber !== 1) {
                          const bismillahInText = /بِسْمِ\s*[اللّاللَّ]هِ\s*الر['َّ]حْم[َنَٰ]نِ\s*الر['َّ]حِيمِ/gi;
                          if (bismillahInText.test(cleanText)) {
                            cleanText = cleanText.replace(bismillahInText, '').trim();
                            cleanText = cleanText.replace(/\s+/g, ' ').trim();
                            cleanText = cleanText.replace(/^[،\s]+|[،\s]+$/g, '').trim();
                          }
                        }
                        
                        return (
                          <div key={`verse-${verse.suraNumber}-${verse.displayNumber}-${i}`} className="relative mb-2 pb-2 border-b border-sky-200/30 dark:border-sky-800/20 last:border-0">
                            <p className="text-xl leading-[2.8] text-foreground/95 text-right" style={{ 
                              lineHeight: "2.8", 
                              wordSpacing: "0.2em",
                              fontVariantLigatures: "normal",
                              fontFeatureSettings: '"liga" 1, "kern" 1',
                              textRendering: "optimizeLegibility"
                            }}>
                              {cleanText}
                              <span className="text-teal-600 dark:text-teal-400 font-semibold mr-1">
                                ({verse.displayNumber})
                              </span>
                            </p>
                          </div>
                        );
                      })})()}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{isRTL ? "لا توجد آيات متاحة" : "No verses available"}</p>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="w-4 h-4 ml-1" />
                {isRTL ? "السابق" : "Previous"}
              </Button>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm text-muted-foreground font-semibold">
                  {currentPage} / 604
                </span>
                {currentVerses.suraNumber && (
                  <span className="text-xs text-muted-foreground">
                    {isRTL ? "سورة" : "Sura"} {currentVerses.suraNumber}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(604, p + 1))}
                disabled={currentPage === 604}
              >
                {isRTL ? "التالي" : "Next"}
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            </div>
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

        {/* Adhkar Tab */}
        <TabsContent value="adhkar" className="space-y-4 mt-4">
          <h3 className="font-bold text-right">{isRTL ? "الأذكار اليومية" : "Daily Adhkar"}</h3>
          
          {Object.entries(adhkarData).map(([key, section]) => {
            const iconMap: Record<string, any> = {
              Sun: Sun,
              Moon: Moon,
              MoonStar: MoonStar,
              Heart: Heart,
              Sparkles: Sparkles,
            };
            const Icon = iconMap[section.icon];
            const totalItems = section.items.length;
            const completedItems = section.items.filter(item => {
              const progress = getAdhkarProgress(item.id, item.count);
              return progress >= item.count;
            }).length;
            const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

            return (
              <div key={key} className="bg-card rounded-2xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-right">{section.title}</h4>
                      <p className="text-xs text-muted-foreground text-right">
                        {completedItems}/{totalItems} {isRTL ? "مكتمل" : "completed"} • {progressPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {section.items.map((item) => {
                    const progress = getAdhkarProgress(item.id, item.count);
                    const isCompleted = progress >= item.count;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border ${
                          isCompleted ? "border-primary/50 bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 text-right">
                            <p className="text-sm font-semibold mb-1" style={{ fontFamily: "'Traditional Arabic', serif", fontSize: "18px" }}>
                              {item.text}
                            </p>
                            <p className="text-xs text-muted-foreground italic mb-2">
                              {item.transliteration}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{isRTL ? "العدد:" : "Count:"} {item.count}</span>
                              <span>•</span>
                              <span className={isCompleted ? "text-primary font-semibold" : ""}>
                                {progress}/{item.count}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAdhkarComplete(item.id, item.count)}
                            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? "bg-primary border-primary"
                                : "border-muted-foreground hover:border-primary"
                            }`}
                            disabled={isCompleted}
                          >
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                          </button>
                        </div>
                        {progress > 0 && progress < item.count && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${(progress / item.count) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
              <CreateTaskDialog category="quran" selectedDate={selectedDate} />
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
            <CreateTaskDialog category="quran" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Quran;
