import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Target, Heart, Sparkles, Star, Moon, Award, LogIn, UserPlus, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check for OAuth callback in hash and redirect to /auth/callback
  // Only run once on mount to prevent redirect loops
  useEffect(() => {
    // Only check if we have a hash
    if (!window.location.hash) return;
    
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    // If we have an access_token in the hash, redirect to /auth/callback
    // Use window.location to preserve hash (React Router navigate doesn't handle hash well)
    if (accessToken) {
      window.location.href = '/auth/callback' + window.location.hash;
    }
  }, []); // Empty deps - only run once on mount

  // Don't redirect - always show landing page
  // Users can navigate to dashboard manually if logged in

  const content = {
    ar: {
      heroTitle: "فلاح",
      heroSubtitle: "طريقك للنجاح في الدنيا والآخرة",
      heroDescription: "منصة شاملة لتتبع عباداتك وعاداتك اليومية، ومساعدتك على تحقيق النجاح في الدنيا والآخرة من خلال نظام تتبع ذكي ومحفز",
      signIn: "تسجيل الدخول",
      signUp: "ابدأ الآن",
      badge: "مصمم للمسلمين",
      quranTitle: "من نور القرآن",
      featuresTitle: "ميزات فلاح",
      joinThousands: "مسلم يتتبع تقدمه يومياً",
      verse1: {
        text: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
        reference: "الرعد: 11",
      },
      verse2: {
        text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
        reference: "الطلاق: 2-3",
      },
      verse3: {
        text: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
        reference: "النجم: 39",
      },
      features: [
        {
          icon: BookOpen,
          title: "القرآن والصلاة",
          description: "تتبع قراءة القرآن والصلوات الخمس",
          path: "/quran",
        },
        {
          icon: Target,
          title: "العمل والإنتاجية",
          description: "إدارة المهام والأهداف المهنية",
          path: "/work",
        },
        {
          icon: Heart,
          title: "الصحة والرياضة",
          description: "روتين التمارين وإدارة الوزن",
          path: "/sport",
        },
        {
          icon: Moon,
          title: "المعرفة والتعلم",
          description: "تتبع قراءة الكتب والتعلم اليومي",
          path: "/knowledge",
        },
      ],
      benefits: [
        "نظام تتبع محفز بالنقاط والمستويات",
        "رسوم بيانية جميلة للتقدم",
        "تحليلات أسبوعية وشهرية",
        "تتبع السلاسل لتبقى متحفزاً",
        "أقسام مخصصة لكل جوانب الحياة",
      ],
    },
    en: {
      heroTitle: "Falah",
      heroSubtitle: "Your Path to Success in Dunya & Akhira",
      heroDescription: "A comprehensive platform to track your worship and daily habits, helping you achieve success in this world and the hereafter through smart and motivating tracking",
      signIn: "Sign In",
      signUp: "Get Started",
      badge: "Built for Muslims",
      quranTitle: "Light from the Quran",
      featuresTitle: "Falah Features",
      joinThousands: "Muslims tracking daily",
      verse1: {
        text: "Indeed, Allah will not change the condition of a people until they change what is in themselves.",
        reference: "Ar-Ra'd 13:11",
      },
      verse2: {
        text: "And whoever fears Allah - He will make for him a way out. And will provide for him from where he does not expect.",
        reference: "At-Talaq 65:2-3",
      },
      verse3: {
        text: "And that man can have nothing but what he strives for.",
        reference: "An-Najm 53:39",
      },
      features: [
        {
          icon: BookOpen,
          title: "Quran & Prayer",
          description: "Track Quran recitation and five daily prayers",
          path: "/quran",
        },
        {
          icon: Target,
          title: "Work & Productivity",
          description: "Manage tasks and professional goals",
          path: "/work",
        },
        {
          icon: Heart,
          title: "Health & Fitness",
          description: "Exercise routines and weight management",
          path: "/sport",
        },
        {
          icon: Moon,
          title: "Knowledge & Learning",
          description: "Track book reading and daily learning",
          path: "/knowledge",
        },
      ],
      benefits: [
        "Gamified tracking with XP and levels",
        "Beautiful progress visualizations",
        "Weekly and monthly analytics",
        "Streak tracking to stay motivated",
        "Dedicated sections for all life areas",
      ],
    },
  };

  const currentContent = content[isRTL ? "ar" : "en"];

  // Don't show loading on landing page - always show content immediately
  // Auth check happens in background and doesn't block rendering

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="فلاح" className="w-10 h-10" />
            </div>
            <div>
              <h1 className={`font-bold text-lg text-foreground ${isRTL ? "font-arabic" : ""}`}>
                {currentContent.heroTitle}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isRTL ? "فلاح" : "Success Tracker"}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setLanguage("ar")}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${
                  language === "ar"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${
                  language === "en"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                EN
              </button>
            </div>

            {/* Auth Buttons */}
            <Link to="/signin">
              <Button variant="ghost" size="sm" className={isRTL ? "font-arabic" : ""}>
                {currentContent.signIn}
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className={`bg-primary hover:bg-primary/90 ${isRTL ? "font-arabic" : ""}`}>
                {currentContent.signUp}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20 mb-6">
                <span className="text-primary text-sm font-medium">🌙 {currentContent.badge}</span>
              </div>

              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 ${isRTL ? "font-arabic" : ""}`}>
                {isRTL ? (
                  <>
                    طريقك إلى
                    <span className="text-primary"> الفلاح </span>
                    يبدأ هنا
                  </>
                ) : (
                  <>
                    Your Path to
                    <span className="text-primary"> Success </span>
                    Starts Here
                  </>
                )}
              </h1>

              <p className={`text-base sm:text-lg text-muted-foreground mb-8 max-w-lg ${isRTL ? "font-arabic" : ""}`}>
                {currentContent.heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/signup">
                  <Button size="lg" className={`gap-2 bg-primary hover:bg-primary/90 shadow-lg ${isRTL ? "font-arabic" : ""}`}>
                    {currentContent.signUp}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button size="lg" variant="outline" className={isRTL ? "font-arabic" : ""}>
                    {currentContent.signIn}
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 border-2 border-background"
                    />
                  ))}
                </div>
                <p className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                  <span className="font-semibold text-foreground">2,000+</span> {currentContent.joinThousands}
                </p>
              </div>
            </motion.div>

            {/* Right Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`font-semibold text-foreground ${isRTL ? "font-arabic" : ""}`}>
                      {isRTL ? "التقدم اليوم" : "Today's Progress"}
                    </h3>
                    <span className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full">+320 XP</span>
                  </div>

                  {/* Progress Ring */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          className="fill-none stroke-muted"
                          strokeWidth="8"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          className="fill-none stroke-primary"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${0.72 * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">72%</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Progress */}
                  <div className="grid grid-cols-2 gap-3">
                    {currentContent.features.map((feature, index) => {
                      const Icon = feature.icon;
                      const progress = [85, 60, 75, 50][index];
                      return (
                        <div
                          key={feature.title}
                          className="p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className={`text-sm font-medium text-foreground ${isRTL ? "font-arabic" : ""}`}>
                              {feature.title.split(" ")[0]}
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quranic Verses */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-primary" />
              <h2 className={`text-3xl md:text-4xl font-bold text-foreground ${isRTL ? "font-arabic" : ""}`}>
                {currentContent.quranTitle}
              </h2>
              <Star className="w-6 h-6 text-primary" />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[currentContent.verse1, currentContent.verse2, currentContent.verse3].map((verse, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    
                    <p className={`text-lg font-semibold text-foreground leading-relaxed mb-4 flex-1 ${isRTL ? "font-arabic text-right" : ""}`}>
                      "{verse.text}"
                    </p>
                    
                    <div className="pt-3 border-t border-border/50">
                      <p className={`text-sm font-medium text-primary ${isRTL ? "font-arabic" : ""}`}>
                        — {verse.reference}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl md:text-4xl font-bold text-foreground mb-4 ${isRTL ? "font-arabic" : ""}`}>
              {currentContent.featuresTitle}
            </h2>
            <p className={`text-lg text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
              {isRTL ? "كل ما تحتاجه لتحقيق النجاح في حياتك" : "Everything you need to succeed in life"}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentContent.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={feature.path || "/dashboard"}>
                    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 group cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className={`font-bold text-foreground mb-2 ${isRTL ? "font-arabic" : ""}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm text-muted-foreground ${isRTL ? "font-arabic" : ""}`}>
                      {feature.description}
                    </p>
                  </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {currentContent.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <p className={`font-medium text-foreground ${isRTL ? "font-arabic" : ""}`}>
                    {benefit}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-br from-primary to-accent">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <Award className="w-16 h-16 text-primary-foreground" />
            </div>

            <h2 className={`text-4xl md:text-5xl font-bold text-primary-foreground mb-6 ${isRTL ? "font-arabic" : ""}`}>
              {isRTL ? "ابدأ رحلتك نحو الفلاح اليوم" : "Start Your Falah Journey Today"}
            </h2>

            <p className={`text-xl text-primary-foreground/90 mb-10 ${isRTL ? "font-arabic" : ""}`}>
              {isRTL ? "انضم إلى آلاف المسلمين الذين يحققون النجاح في الدنيا والآخرة" : "Join thousands of Muslims achieving success in Dunya and Akhira"}
            </p>

            <Link to="/signup">
              <Button
                size="lg"
                className={`bg-white text-primary hover:bg-white/90 shadow-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
              >
                <UserPlus className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {currentContent.signUp}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
