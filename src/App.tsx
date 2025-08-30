import React, { useEffect, Suspense } from "react";
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

// Loading component with spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function AppContent() {
  const isMobile = useIsMobile();

  // Mobile optimization - prevent zoom on input focus and restrict scrolling
  useEffect(() => {
    // Prevent zooming on mobile
    const disableZoom = () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    };
    
    // Prevent horizontal scrolling and fix layout
    const preventHorizontalScroll = () => {
      document.body.style.overflowX = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    };
    
    // Prevent pull-to-refresh
    const preventPullToRefresh = () => {
      document.body.style.overscrollBehavior = 'none';
    };
    
    // Add mobile class for CSS targeting
    const addMobileClass = () => {
      document.body.classList.add('mobile-app');
    };

    if (isMobile) {
      disableZoom();
      preventHorizontalScroll();
      preventPullToRefresh();
      addMobileClass();
      
      // Additional touch event handling to prevent default behaviors
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    
    return () => {
      document.body.classList.remove('mobile-app');
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile]);

  // Prevent default touch behaviors that could cause zooming or scrolling
  const handleTouchStart = (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e) => {
    // Prevent horizontal scrolling
    if (Math.abs(e.touches[0].pageX - startX) > Math.abs(e.touches[0].pageY - startY)) {
      e.preventDefault();
    }
  };

  let startX = 0;
  let startY = 0;

  const handleTouchStartRecord = (e) => {
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStartRecord, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStartRecord);
    };
  }, []);

  return (
    <PlayerProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full fixed overflow-hidden">
          {!isMobile && <AppSidebar />}
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route 
                  path="/saved" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <SavedPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/downloads" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DownloadsPage />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ProfilePage />
                    </Suspense>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
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
