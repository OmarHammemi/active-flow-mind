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
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Settings state
  const [settingsNotifications, setSettingsNotifications] = useState({
    prayer: true,
    quran: true,
    habits: false,
    sounds: true,
  });

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
            <h3 className="font-bold text-right text-muted-foreground text-sm">الإعدادات العامة</h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <SettingRow icon={Globe} label="المنطقة الزمنية" value="UTC+1" />
              <SettingRow icon={Languages} label="اللغة" value="العربية" />
              <SettingRow icon={Moon} label="الوضع الداكن" value="مفعل" />
              <SettingRow icon={Clock} label="تنسيق الوقت" value="24 ساعة" last />
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

          {/* Subscription */}
          <div className="px-4 space-y-2">
            <h3 className="font-bold text-right text-muted-foreground text-sm">الاشتراك والدفع</h3>
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <Button size="sm" variant="outline">ترقية</Button>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">الخطة المجانية</span>
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
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
const SettingRow = ({ icon: Icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) => (
  <div className={`flex items-center justify-between px-4 py-3 ${!last ? "border-b border-border" : ""}`}>
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <ChevronIcon />
      <span>{value}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm">{label}</span>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
  </div>
);

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
