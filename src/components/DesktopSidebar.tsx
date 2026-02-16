import { Link, useLocation, Routes, Route } from "react-router-dom";
import { LayoutDashboard, BookOpen, Briefcase, Dumbbell, GraduationCap, Settings, User } from "lucide-react";
import Index from "@/pages/Index";
import Quran from "@/pages/Quran";
import Work from "@/pages/Work";
import Sport from "@/pages/Sport";
import Knowledge from "@/pages/Knowledge";
import SettingsPage from "@/pages/SettingsPage";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const DesktopSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "لوحة التحكم", icon: LayoutDashboard },
    { path: "/quran", label: "القرآن", icon: BookOpen },
    { path: "/work", label: "العمل", icon: Briefcase },
    { path: "/sport", label: "الرياضة", icon: Dumbbell },
    { path: "/knowledge", label: "المعرفة", icon: GraduationCap },
    { path: "/profile", label: "الملف الشخصي", icon: User },
    { path: "/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="hidden md:flex max-w-7xl mx-auto min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card/50 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">فلاح</h1>
          <p className="text-xs text-muted-foreground">متتبع الأهداف</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === "/" && location.pathname === "/dashboard");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/20 text-primary font-semibold"
                    : "text-foreground hover:bg-primary/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route index element={<Index />} />
          <Route path="dashboard" element={<Index />} />
          <Route path="quran" element={<Quran />} />
          <Route path="work" element={<Work />} />
          <Route path="sport" element={<Sport />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default DesktopSidebar;
