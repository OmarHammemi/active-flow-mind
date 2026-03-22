import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
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

// Global OAuth callback handler - redirects to /auth/callback if access_token is in hash
const OAuthHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if there's an access_token in the URL hash (OAuth callback)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    // If we have an access_token but we're NOT on /auth/callback, redirect there
    // IMPORTANT: Use window.location to preserve hash (React Router navigate doesn't handle hash well)
    // Only redirect if we're not already on the callback page and we have a token
    if (accessToken && location.pathname !== '/auth/callback') {
      // Use window.location to preserve hash - this will cause a full page reload
      // but it's necessary to ensure Supabase can process the OAuth callback
      window.location.href = '/auth/callback' + window.location.hash;
    }
  }, [location.pathname]); // Only re-run if pathname changes
  
  return null;
};

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

// HTTPS Enforcement Component - REMOVED to prevent redirect loops
// Nginx should handle HTTPS redirects at the server level

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <OAuthHandler />
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
