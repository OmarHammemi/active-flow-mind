import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { isRTL } = useLanguage();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if profile exists
        if (profile && profile.name) {
          // Profile exists, go to dashboard
          navigate("/profile", { replace: true });
        } else {
          // No profile, go to profile page to create one
          navigate("/profile", { replace: true });
        }
      } else {
        // No user, go to landing
        navigate("/", { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/50"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        
        <h2 className={`text-2xl font-black text-foreground mb-4 ${isRTL ? "font-arabic" : ""}`}>
          {isRTL ? "جاري تسجيل الدخول..." : "Signing you in..."}
        </h2>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary mx-auto" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
