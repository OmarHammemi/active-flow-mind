import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AppHeader = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const avatarUrl = profile?.photo_url || user?.user_metadata?.avatar_url;
  const userName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0];

  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
      <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground">
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <User className="w-8 h-8" />
        )}
      </button>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <h1 className="text-lg font-bold text-primary">فلاح</h1>
          <p className="text-[10px] text-muted-foreground -mt-1">متتبع الأهداف</p>
        </div>
        <div className="w-8 h-8 flex items-center justify-center">
          <img src="/logo.svg" alt="فلاح" className="w-8 h-8" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
