import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    return saved || "ar"; // Default to Arabic
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
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
