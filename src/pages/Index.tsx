import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, BookOpen, Briefcase, Dumbbell, GraduationCap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";

const weekData = [
  { day: "السبت", quran: 10, work: 5, sport: 8, knowledge: 3 },
  { day: "الأحد", quran: 40, work: 20, sport: 30, knowledge: 15 },
  { day: "الإثنين", quran: 55, work: 40, sport: 45, knowledge: 30 },
  { day: "الثلاثاء", quran: 60, work: 50, sport: 55, knowledge: 45 },
  { day: "الأربعاء", quran: 70, work: 60, sport: 50, knowledge: 55 },
  { day: "الخميس", quran: 80, work: 65, sport: 70, knowledge: 60 },
  { day: "الجمعة", quran: 90, work: 50, sport: 85, knowledge: 70 },
];

const sections = [
  { name: "العمل والإنتاجية", icon: Briefcase, color: "bg-blue-500", progress: 0, habits: "0/2", xp: 0 },
  { name: "القرآن والصلاة", icon: BookOpen, color: "bg-emerald-500", progress: 0, habits: "0/3", xp: 0 },
  { name: "المعرفة والتعلم", icon: GraduationCap, color: "bg-pink-500", progress: 0, habits: "0/1", xp: 0 },
  { name: "الصحة والرياضة", icon: Dumbbell, color: "bg-orange-500", progress: 0, habits: "0/3", xp: 0 },
];

const Index = () => {
  return (
    <div className="pb-4 space-y-6">
      {/* Greeting */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">السلام عليكم 👋</h2>
        <p className="text-sm text-muted-foreground">هل أنت مستعد لجعل اليوم مميزاً؟ دعنا نتتبع تقدمك.</p>
      </div>

      {/* Level Badge */}
      <div className="flex justify-center">
        <span className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          🏆 المستوى 1
        </span>
      </div>

      {/* Progress Card */}
      <div className="mx-4 bg-card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg font-bold">0%</span>
              <p className="text-[8px] text-muted-foreground">مكتمل</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg">التقدم اليوم</h3>
            <p className="text-xs text-muted-foreground">اسعَ في التقدم!</p>
          </div>
        </div>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <span className="font-bold text-xl">9</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-xs text-muted-foreground">أيام السلسلة</span>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <span className="font-bold text-xl">0</span>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="text-xs text-muted-foreground">إجمالي النقاط</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>XP 500 / 0</span>
            <span>المستوى التالي</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </div>

      {/* Journey Cards */}
      <div className="px-4 space-y-3">
        <h3 className="text-lg font-bold text-right">رحلاتك</h3>
        <div className="grid grid-cols-2 gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.name} className="bg-card rounded-2xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">+XP {section.xp}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{section.name}</span>
                    <div className={`w-7 h-7 rounded-lg ${section.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-left text-xs text-muted-foreground">عادات {section.habits}</p>
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
                    <span className="text-sm font-bold">{section.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="px-4 space-y-3">
        <h3 className="text-lg font-bold text-right">التحليلات الأسبوعية</h3>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> القرآن</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> العمل</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> الرياضة</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> المعرفة</span>
            </div>
            <h4 className="font-semibold text-sm">نظرة عامة</h4>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weekData}>
              <XAxis dataKey="day" tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(220,18%,14%)", border: "1px solid hsl(220,14%,22%)", borderRadius: "8px", fontSize: 12 }} />
              <Line type="monotone" dataKey="quran" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="work" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sport" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="knowledge" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="px-4 space-y-3">
        <h3 className="text-lg font-bold text-right">تحليل تفصيلي</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "القرآن", icon: BookOpen, color: "bg-emerald-500", stroke: "#10b981", fill: "#10b98133", dataKey: "quran", avg: 33, high: 100 },
            { name: "العمل", icon: Briefcase, color: "bg-blue-500", stroke: "#3b82f6", fill: "#3b82f633", dataKey: "work", avg: 17, high: 100 },
            { name: "الرياضة", icon: Dumbbell, color: "bg-orange-500", stroke: "#f97316", fill: "#f9731633", dataKey: "sport", avg: 21, high: 80 },
            { name: "المعرفة", icon: GraduationCap, color: "bg-pink-500", stroke: "#ec4899", fill: "#ec489933", dataKey: "knowledge", avg: 29, high: 100 },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="bg-card rounded-2xl p-4 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-semibold">0%</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold">{cat.name}</span>
                    <div className={`w-5 h-5 rounded-md ${cat.color} flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <div><span className="font-semibold text-foreground">{cat.high}%</span><br/>الأعلى</div>
                  <div className="text-right"><span className="font-semibold text-foreground">{cat.avg}%</span><br/>المتوسط</div>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={weekData}>
                    <defs>
                      <linearGradient id={`grad-${cat.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={cat.stroke} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={cat.stroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey={cat.dataKey} stroke={cat.stroke} fill={`url(#grad-${cat.dataKey})`} strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
