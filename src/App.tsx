import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import Index from "./pages/Index";
import Quran from "./pages/Quran";
import Work from "./pages/Work";
import Sport from "./pages/Sport";
import Knowledge from "./pages/Knowledge";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-lg mx-auto min-h-screen bg-background relative">
          <AppHeader />
          <main className="pb-20">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/work" element={<Work />} />
              <Route path="/sport" element={<Sport />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
