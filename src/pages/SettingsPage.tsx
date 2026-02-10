import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Globe, Languages, Moon, Clock, Bell, Heart, BellRing, Volume2, CreditCard, Edit2 } from "lucide-react";

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    name: "مستخدم فلاح",
    email: "user@falah.app",
  });
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    prayer: true,
    quran: true,
    habits: false,
    sounds: true,
  });

  return (
    <div className="pb-4 space-y-4">
      {/* Profile Card */}
      <div className="mx-4 bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-4">
          <div className="text-right flex-1">
            {editing ? (
              <div className="space-y-2">
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="text-right" />
                <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="text-right" />
                <Button size="sm" onClick={() => setEditing(false)}>حفظ</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <h2 className="text-lg font-bold">{profile.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex gap-2 mt-2 justify-end">
                  <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">المستوى 1</span>
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">XP 0</span>
                </div>
              </>
            )}
          </div>
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* General Settings */}
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
          <NotifRow icon={Bell} label="تذكير الصلاة" checked={notifications.prayer} onChange={(v) => setNotifications({ ...notifications, prayer: v })} />
          <NotifRow icon={Heart} label="تذكير القرآن" checked={notifications.quran} onChange={(v) => setNotifications({ ...notifications, quran: v })} />
          <NotifRow icon={BellRing} label="تذكير العادات" checked={notifications.habits} onChange={(v) => setNotifications({ ...notifications, habits: v })} />
          <NotifRow icon={Volume2} label="الأصوات" checked={notifications.sounds} onChange={(v) => setNotifications({ ...notifications, sounds: v })} last />
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
    </div>
  );
};

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

export default SettingsPage;
