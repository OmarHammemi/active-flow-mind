import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Briefcase, Dumbbell, GraduationCap, Settings } from "lucide-react";

const navItems = [
  { path: "/settings", label: "الإعدادات", icon: Settings },
  { path: "/knowledge", label: "المعرفة", icon: GraduationCap },
  { path: "/sport", label: "الرياضة", icon: Dumbbell },
  { path: "/work", label: "العمل", icon: Briefcase },
  { path: "/quran", label: "القرآن", icon: BookOpen },
  { path: "/", label: "لوحة التحكم", icon: LayoutDashboard },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
