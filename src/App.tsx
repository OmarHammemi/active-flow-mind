import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Quran from "./pages/Quran";
import Work from "./pages/Work";
import Sport from "./pages/Sport";
import Knowledge from "./pages/Knowledge";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// Layout wrapper that forces remount on route change
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="max-w-lg mx-auto min-h-screen bg-background relative">
      <AppHeader />
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

const queryClient = new QueryClient();

// HTTPS Enforcement Component
const HTTPSEnforcer = () => {
  useEffect(() => {
    // Only enforce HTTPS in production (not localhost)
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      !window.location.hostname.startsWith('192.168.') &&
      !window.location.hostname.startsWith('10.')
    ) {
      window.location.replace(
        'https:' + window.location.href.substring(window.location.protocol.length)
      );
    }
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HTTPSEnforcer />
    <AuthProvider>
      <LanguageProvider>
        <TaskProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                {/* Public routes - no header/nav */}
                <Route path="/" element={<Landing />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* App routes - with header/nav - PROTECTED */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Index />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quran"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Quran />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/work"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Work />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sport"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Sport />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/knowledge"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Knowledge />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Profile />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TaskProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
