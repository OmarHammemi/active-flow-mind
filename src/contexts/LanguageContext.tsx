import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getUserPreferences, upsertUserPreferences } from "@/services/database";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.quran": "Quran",
    "nav.work": "Work",
    "nav.sport": "Sport",
    "nav.knowledge": "Knowledge",
    "nav.settings": "Settings",
    
    // Common
    "common.complete": "complete",
    "common.progress": "Progress",
    "common.today": "Today",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.update": "Update",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.close": "Close",
    "common.loading": "Loading...",
  },
  ar: {
    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.quran": "القرآن",
    "nav.work": "العمل",
    "nav.sport": "الرياضة",
    "nav.knowledge": "المعرفة",
    "nav.settings": "الإعدادات",
    
    // Common
    "common.complete": "مكتمل",
    "common.progress": "التقدم",
    "common.today": "اليوم",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.update": "تحديث",
    "common.add": "إضافة",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.close": "إغلاق",
    "common.loading": "جاري التحميل...",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved) return saved;
    
    // Detect browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (browserLang === 'ar') return "ar";
    if (browserLang === 'en') return "en";
    
    // Default to Arabic
    return "ar";
  });
  // Start with loading = false so app renders immediately
  const [languageLoading, setLanguageLoading] = useState(false);

  // Load language preference from database
  useEffect(() => {
    const loadLanguage = async () => {
      if (!user) {
        setLanguageLoading(false);
        return;
      }

      try {
        const prefs = await getUserPreferences(user.id);
        if (prefs && prefs.language) {
          setLanguageState(prefs.language);
          localStorage.setItem("language", prefs.language);
          document.documentElement.dir = prefs.language === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = prefs.language;
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setLanguageLoading(false);
      }
    };

    loadLanguage();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    // Save to database if user is logged in
    if (user && !languageLoading) {
      try {
        await upsertUserPreferences(user.id, { language: lang });
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
