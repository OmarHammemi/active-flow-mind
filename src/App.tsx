import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Quran from "./pages/Quran";
import Work from "./pages/Work";
import Sport from "./pages/Sport";
import Knowledge from "./pages/Knowledge";
import SettingsPage from "./pages/SettingsPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
// Cache bust: 2024-02-15-19:40
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <Routes>
          {/* Public routes - no header/nav */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* App routes - with header/nav (original structure) */}
          <Route
            path="/dashboard"
            element={
              <div className="max-w-lg mx-auto min-h-screen bg-background relative">
                <AppHeader />
                <main className="pb-20">
                  <Index />
                </main>
                <BottomNav />
              </div>
            }
          />
          <Route
            path="/quran"
            element={
              <div className="max-w-lg mx-auto min-h-screen bg-background relative">
                <AppHeader />
                <main className="pb-20">
                  <Quran />
                </main>
                <BottomNav />
              </div>
            }
          />
          <Route
            path="/work"
            element={
              <div className="max-w-lg mx-auto min-h-screen bg-background relative">
                <AppHeader />
                <main className="pb-20">
                  <Work />
                </main>
                <BottomNav />
              </div>
            }
          />
          <Route
            path="/sport"
            element={
              <div className="max-w-lg mx-auto min-h-screen bg-background relative">
                <AppHeader />
                <main className="pb-20">
                  <Sport />
                </main>
                <BottomNav />
              </div>
            }
          />
          <Route
            path="/knowledge"
            element={
              <div className="max-w-lg mx-auto min-h-screen bg-background relative">
                <AppHeader />
                <main className="pb-20">
                  <Knowledge />
                </main>
                <BottomNav />
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div className="max-w-lg mx-auto min-h-screen bg-background relative">
                <AppHeader />
                <main className="pb-20">
                  <SettingsPage />
                </main>
                <BottomNav />
              </div>
            }
          />
          <Route
            path="/profile"
            element={
              <div className="max-w-lg mx-auto min-h-screen bg-background relative">
                <AppHeader />
                <main className="pb-20">
                  <Profile />
                </main>
                <BottomNav />
              </div>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
