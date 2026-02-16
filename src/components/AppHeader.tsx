import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AppHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
      <button onClick={() => navigate("/settings")} className="text-muted-foreground hover:text-foreground">
        <Settings className="w-5 h-5" />
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
