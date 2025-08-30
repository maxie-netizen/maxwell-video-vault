import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import BottomNavigation from "@/components/BottomNavigation";
import MiniPlayer from "@/components/MiniPlayer";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import AuthPage from "@/pages/Auth";

// Lazy load pages for better performance
const SavedPage = React.lazy(() => import("./pages/Saved"));
const DownloadsPage = React.lazy(() => import("./pages/Downloads"));
const ProfilePage = React.lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

function AppContent() {
  const isMobile = useIsMobile();

  // Mobile optimization - prevent zoom on input focus
  useEffect(() => {
    if (isMobile) {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Prevent pull-to-refresh
      document.body.style.overscrollBehavior = 'none';
      
      // Add mobile class for CSS targeting
      document.body.classList.add('mobile-app');
    }
    
    return () => {
      document.body.classList.remove('mobile-app');
    };
  }, [isMobile]);

  return (
    <PlayerProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {!isMobile && <AppSidebar />}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/saved" element={<React.Suspense fallback={<div>Loading...</div>}><SavedPage /></React.Suspense>} />
              <Route path="/downloads" element={<React.Suspense fallback={<div>Loading...</div>}><DownloadsPage /></React.Suspense>} />
              <Route path="/profile" element={<React.Suspense fallback={<div>Loading...</div>}><ProfilePage /></React.Suspense>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        {isMobile && <BottomNavigation />}
        <MiniPlayer />
      </SidebarProvider>
    </PlayerProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
