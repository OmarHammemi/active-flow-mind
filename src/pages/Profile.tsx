import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Camera, Target, Edit, Save, X, Mail, Calendar, LogOut, Globe, Languages, Moon, Clock, Bell, Heart, BellRing, Volume2, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [target1, setTarget1] = useState("");
  const [target2, setTarget2] = useState("");
  const [target3, setTarget3] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, updateProfile, refreshProfile, signOut } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Settings state
  const [settingsNotifications, setSettingsNotifications] = useState({
    prayer: true,
    quran: true,
    habits: false,
    sounds: true,
  });

  // Timezone state
  const [timezone, setTimezone] = useState(() => {
    const saved = localStorage.getItem("timezone");
    return saved || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  });

  // Time format state (12h or 24h)
  const [timeFormat, setTimeFormat] = useState(() => {
    const saved = localStorage.getItem("timeFormat");
    return saved || "24";
  });

  // Update timezone in localStorage
  useEffect(() => {
    localStorage.setItem("timezone", timezone);
  }, [timezone]);

  // Update time format in localStorage
  useEffect(() => {
    localStorage.setItem("timeFormat", timeFormat);
  }, [timeFormat]);

  // Language options
  const languages = [
    { value: "ar", label: "العربية - Arabic" },
    { value: "en", label: "English - الإنجليزية" },
  ];

  // Handle language change
  const handleLanguageChange = (newLang: "ar" | "en") => {
    setLanguage(newLang);
    toast({
      title: isRTL ? "تم التغيير" : "Changed",
      description: isRTL ? `تم تغيير اللغة إلى ${newLang === "ar" ? "العربية" : "English"}` : `Language changed to ${newLang === "ar" ? "Arabic" : "English"}`,
    });
  };

  // Comprehensive timezone options for all continents
  const timezones = [
    // Africa
    { value: "Africa/Cairo", label: "القاهرة - Cairo (GMT+2)" },
    { value: "Africa/Casablanca", label: "الدار البيضاء - Casablanca (GMT+1)" },
    { value: "Africa/Johannesburg", label: "جوهانسبرغ - Johannesburg (GMT+2)" },
    { value: "Africa/Lagos", label: "لاغوس - Lagos (GMT+1)" },
    { value: "Africa/Nairobi", label: "نيروبي - Nairobi (GMT+3)" },
    // Asia
    { value: "Asia/Riyadh", label: "الرياض - Riyadh (GMT+3)" },
    { value: "Asia/Dubai", label: "دبي - Dubai (GMT+4)" },
    { value: "Asia/Kuwait", label: "الكويت - Kuwait (GMT+3)" },
    { value: "Asia/Baghdad", label: "بغداد - Baghdad (GMT+3)" },
    { value: "Asia/Tehran", label: "طهران - Tehran (GMT+3:30)" },
    { value: "Asia/Karachi", label: "كراتشي - Karachi (GMT+5)" },
    { value: "Asia/Dhaka", label: "دكا - Dhaka (GMT+6)" },
    { value: "Asia/Bangkok", label: "بانكوك - Bangkok (GMT+7)" },
    { value: "Asia/Singapore", label: "سنغافورة - Singapore (GMT+8)" },
    { value: "Asia/Hong_Kong", label: "هونغ كونغ - Hong Kong (GMT+8)" },
    { value: "Asia/Tokyo", label: "طوكيو - Tokyo (GMT+9)" },
    { value: "Asia/Seoul", label: "سيول - Seoul (GMT+9)" },
    { value: "Asia/Shanghai", label: "شنغهاي - Shanghai (GMT+8)" },
    { value: "Asia/Kolkata", label: "مومباي - Mumbai (GMT+5:30)" },
    // Europe
    { value: "Europe/London", label: "لندن - London (GMT+0/+1)" },
    { value: "Europe/Paris", label: "باريس - Paris (GMT+1/+2)" },
    { value: "Europe/Berlin", label: "برلين - Berlin (GMT+1/+2)" },
    { value: "Europe/Rome", label: "روما - Rome (GMT+1/+2)" },
    { value: "Europe/Madrid", label: "مدريد - Madrid (GMT+1/+2)" },
    { value: "Europe/Amsterdam", label: "أمستردام - Amsterdam (GMT+1/+2)" },
    { value: "Europe/Athens", label: "أثينا - Athens (GMT+2/+3)" },
    { value: "Europe/Moscow", label: "موسكو - Moscow (GMT+3)" },
    { value: "Europe/Istanbul", label: "إسطنبول - Istanbul (GMT+3)" },
    // Americas
    { value: "America/New_York", label: "نيويورك - New York (GMT-5/-4)" },
    { value: "America/Chicago", label: "شيكاغو - Chicago (GMT-6/-5)" },
    { value: "America/Denver", label: "دنفر - Denver (GMT-7/-6)" },
    { value: "America/Los_Angeles", label: "لوس أنجلوس - Los Angeles (GMT-8/-7)" },
    { value: "America/Toronto", label: "تورونتو - Toronto (GMT-5/-4)" },
    { value: "America/Mexico_City", label: "مكسيكو سيتي - Mexico City (GMT-6/-5)" },
    { value: "America/Sao_Paulo", label: "ساو باولو - São Paulo (GMT-3)" },
    { value: "America/Buenos_Aires", label: "بوينس آيرس - Buenos Aires (GMT-3)" },
    { value: "America/Lima", label: "ليما - Lima (GMT-5)" },
    // Oceania
    { value: "Australia/Sydney", label: "سيدني - Sydney (GMT+10/+11)" },
    { value: "Australia/Melbourne", label: "ميلبورن - Melbourne (GMT+10/+11)" },
    { value: "Pacific/Auckland", label: "أوكلاند - Auckland (GMT+12/+13)" },
    // UTC
    { value: "UTC", label: "UTC (GMT+0)" },
  ];

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAge(profile.age?.toString() || "");
      setLocation(profile.location || "");
      setTarget1(profile.target_1 || "");
      setTarget2(profile.target_2 || "");
      setTarget3(profile.target_3 || "");
      setPhotoPreview(profile.photo_url || null);
    } else if (user) {
      // If no profile yet, use user metadata
      setName(user.user_metadata?.name || user.email?.split('@')[0] || "");
      setPhotoPreview(user.user_metadata?.avatar_url || null);
    }
  }, [profile, user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      let photoUrl = profile?.photo_url || null;

      // Upload new photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, photoFile);

        if (uploadError) {
          // If bucket doesn't exist, skip photo upload
          console.warn('Avatar bucket not found, skipping photo upload');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }

      // Update profile
      const { error } = await updateProfile({
        name,
        age: age ? parseInt(age) : null,
        location,
        photo_url: photoUrl,
        target_1: target1,
        target_2: target2,
        target_3: target3,
      });

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);

      toast({
        title: isRTL ? "تم الحفظ!" : "Saved!",
        description: isRTL ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل في حفظ الملف الشخصي" : "Failed to save profile"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
    toast({
      title: isRTL ? "تم تسجيل الخروج" : "Signed Out",
      description: isRTL ? "تم تسجيل الخروج بنجاح" : "Successfully signed out",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{isRTL ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
      </div>
    );
  }

  return (
    <div className="pb-4 space-y-4">
      {/* Profile Header */}
      <div className="mx-4 bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-4">
          <div className="text-right flex-1">
            <h2 className="text-xl font-bold mb-1">{name || user.email}</h2>
            <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
            {profile && (
              <div className="flex gap-2 mt-2 justify-end">
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                  {isRTL ? "المستوى 1" : "Level 1"}
                </span>
                {location && (
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary-foreground" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/90">
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <Card className="mx-4 border border-border">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-right block">{isRTL ? "الاسم" : "Name"}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-right block">{isRTL ? "العمر" : "Age"}</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={isRTL ? "أدخل عمرك" : "Enter your age"}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-right block">{isRTL ? "الموقع" : "Location"}</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isRTL ? "أدخل موقعك" : "Enter your location"}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-right block flex items-center gap-2">
                <Target className="w-4 h-4" />
                {isRTL ? "الأهداف" : "Goals"}
              </label>
              <Textarea
                value={target1}
                onChange={(e) => setTarget1(e.target.value)}
                placeholder={isRTL ? "الهدف الأول" : "First goal"}
                className="text-right min-h-[60px]"
              />
              <Textarea
                value={target2}
                onChange={(e) => setTarget2(e.target.value)}
                placeholder={isRTL ? "الهدف الثاني" : "Second goal"}
                className="text-right min-h-[60px]"
              />
              <Textarea
                value={target3}
                onChange={(e) => setTarget3(e.target.value)}
                placeholder={isRTL ? "الهدف الثالث" : "Third goal"}
                className="text-right min-h-[60px]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-primary"
              >
                <Save className="w-4 h-4 ml-2" />
                {isRTL ? "حفظ" : "Save"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form
                  if (profile) {
                    setName(profile.name || "");
                    setAge(profile.age?.toString() || "");
                    setLocation(profile.location || "");
                    setTarget1(profile.target_1 || "");
                    setTarget2(profile.target_2 || "");
                    setTarget3(profile.target_3 || "");
                    setPhotoPreview(profile.photo_url || null);
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 ml-2" />
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Goals Display */}
          {(target1 || target2 || target3) && (
            <div className="mx-4 space-y-2">
              <h3 className="font-bold text-right">{isRTL ? "أهدافي" : "My Goals"}</h3>
              <Card className="border border-border">
                <CardContent className="p-4 space-y-3">
                  {target1 && (
                    <div className="flex items-start gap-2 text-right">
                      <Target className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <p className="text-sm flex-1">{target1}</p>
                    </div>
                  )}
                  {target2 && (
                    <div className="flex items-start gap-2 text-right">
                      <Target className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <p className="text-sm flex-1">{target2}</p>
                    </div>
                  )}
                  {target3 && (
                    <div className="flex items-start gap-2 text-right">
                      <Target className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <p className="text-sm flex-1">{target3}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          <div className="px-4 space-y-2">
            <h3 className="font-bold text-right text-muted-foreground text-sm">{isRTL ? "الإعدادات العامة" : "General Settings"}</h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <ClickableSettingRow 
                icon={Globe} 
                label={isRTL ? "المنطقة الزمنية" : "Timezone"} 
                value={timezones.find(tz => tz.value === timezone)?.label || timezone}
                onClick={() => {}}
                onSelect={(value) => {
                  setTimezone(value);
                  toast({
                    title: isRTL ? "تم التغيير" : "Changed",
                    description: isRTL ? "تم تحديث المنطقة الزمنية" : "Timezone updated",
                  });
                }}
                options={timezones}
                isRTL={isRTL}
              />
              <ClickableSettingRow 
                icon={Languages} 
                label={isRTL ? "اللغة" : "Language"} 
                value={languages.find(lang => lang.value === language)?.label || (language === "ar" ? "العربية" : "English")}
                onClick={() => {}}
                onSelect={(value) => {
                  handleLanguageChange(value as "ar" | "en");
                }}
                options={languages}
                isRTL={isRTL}
              />
              <SettingRow icon={Moon} label={isRTL ? "الوضع الداكن" : "Dark Mode"} value={isRTL ? "مفعل" : "Enabled"} isRTL={isRTL} />
              <ClickableSettingRow 
                icon={Clock} 
                label={isRTL ? "تنسيق الوقت" : "Time Format"} 
                value={timeFormat === "24" ? (isRTL ? "24 ساعة" : "24 hours") : (isRTL ? "12 ساعة" : "12 hours")}
                onClick={() => {
                  const newFormat = timeFormat === "24" ? "12" : "24";
                  setTimeFormat(newFormat);
                  toast({
                    title: isRTL ? "تم التغيير" : "Changed",
                    description: isRTL ? `تم تغيير تنسيق الوقت إلى ${newFormat} ساعة` : `Time format changed to ${newFormat} hours`,
                  });
                }}
                options={[
                  { value: "24", label: isRTL ? "24 ساعة" : "24 hours" },
                  { value: "12", label: isRTL ? "12 ساعة" : "12 hours" },
                ]}
                onSelect={(value) => {
                  setTimeFormat(value);
                  toast({
                    title: isRTL ? "تم التغيير" : "Changed",
                    description: isRTL ? `تم تغيير تنسيق الوقت إلى ${value} ساعة` : `Time format changed to ${value} hours`,
                  });
                }}
                isRTL={isRTL}
                last
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="px-4 space-y-2">
            <h3 className="font-bold text-right text-muted-foreground text-sm">الإشعارات</h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <NotifRow icon={Bell} label="تذكير الصلاة" checked={settingsNotifications.prayer} onChange={(v) => setSettingsNotifications({ ...settingsNotifications, prayer: v })} />
              <NotifRow icon={Heart} label="تذكير القرآن" checked={settingsNotifications.quran} onChange={(v) => setSettingsNotifications({ ...settingsNotifications, quran: v })} />
              <NotifRow icon={BellRing} label="تذكير العادات" checked={settingsNotifications.habits} onChange={(v) => setSettingsNotifications({ ...settingsNotifications, habits: v })} />
              <NotifRow icon={Volume2} label="الأصوات" checked={settingsNotifications.sounds} onChange={(v) => setSettingsNotifications({ ...settingsNotifications, sounds: v })} last />
            </div>
          </div>


          {/* Action Buttons */}
          <div className="mx-4 space-y-2">
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full"
              variant="outline"
            >
              <Edit className="w-4 h-4 ml-2" />
              {isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}
            </Button>
            <Button
              onClick={handleSignOut}
              className="w-full"
              variant="destructive"
            >
              <LogOut className="w-4 h-4 ml-2" />
              {isRTL ? "تسجيل الخروج" : "Sign Out"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Helper components for settings rows
const SettingRow = ({ icon: Icon, label, value, last, isRTL }: { icon: any; label: string; value: string; last?: boolean; isRTL?: boolean }) => (
  <div className={`flex items-center justify-between px-4 py-3 ${!last ? "border-b border-border" : ""}`}>
    <div className={`flex items-center gap-2 text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-medium text-foreground">{label}</span>
    </div>
    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  </div>
);

// Clickable setting row with popover for selection
const ClickableSettingRow = ({ 
  icon: Icon, 
  label, 
  value, 
  onClick, 
  onSelect,
  options,
  isRTL,
  last 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  onClick?: () => void;
  onSelect?: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  isRTL: boolean;
  last?: boolean;
}) => {
  if (options && onSelect) {
    // Find current selected value
    const currentValue = options.find(opt => value.includes(opt.label.split(" - ")[0]) || value.includes(opt.value))?.value || options[0]?.value;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-primary/5 active:bg-primary/10 transition-all duration-200 ${!last ? "border-b border-border" : ""}`}>
            <div className={`flex items-center gap-2 text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
              <Icon className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{label}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span className="text-sm text-muted-foreground max-w-[180px] truncate">{value}</span>
              <ChevronIcon />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className={`w-72 ${isRTL ? "text-right" : "text-left"}`} align={isRTL ? "end" : "start"}>
          <div className="space-y-2">
            <p className="text-sm font-semibold mb-3">{label}</p>
            <Select value={currentValue} onValueChange={(val) => {
              const option = options.find(opt => opt.value === val);
              if (option) onSelect(option.value);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-primary/5 active:bg-primary/10 transition-all duration-200 ${!last ? "border-b border-border" : ""}`}
    >
      <div className={`flex items-center gap-2 text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
        <Icon className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        <span className="text-sm text-muted-foreground">{value}</span>
        <ChevronIcon />
      </div>
    </button>
  );
};

const ChevronIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const NotifRow = ({ icon: Icon, label, checked, onChange, last }: { icon: any; label: string; checked: boolean; onChange: (v: boolean) => void; last?: boolean }) => (
  <div className={`flex items-center justify-between px-4 py-3 ${!last ? "border-b border-border" : ""}`}>
    <Switch checked={checked} onCheckedChange={onChange} />
    <div className="flex items-center gap-3">
      <span className="text-sm">{label}</span>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
  </div>
);

export default Profile;
