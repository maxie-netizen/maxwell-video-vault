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

  // Mobile optimization for better performance and UX
  useEffect(() => {
    if (isMobile) {
      // Enhanced mobile viewport settings
      const viewport = document.querySelector('meta[name=viewport]') || document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      if (!document.querySelector('meta[name=viewport]')) {
        document.head.appendChild(viewport);
      }
      
      // Mobile-specific body styling
      document.body.style.cssText = `
        overflow-x: hidden;
        overflow-y: auto;
        position: relative;
        width: 100%;
        height: 100vh;
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      `;
      
      document.body.classList.add('mobile-app');
      
      // Prevent default touch behaviors
      const preventMultiTouch = (e: TouchEvent) => {
        if (e.touches.length > 1) e.preventDefault();
      };
      
      document.addEventListener('touchstart', preventMultiTouch, { passive: false });
      document.addEventListener('gesturestart', (e) => e.preventDefault());
      
      return () => {
        document.body.classList.remove('mobile-app');
        document.removeEventListener('touchstart', preventMultiTouch);
      };
    }
  }, [isMobile]);


  return (
    <PlayerProvider>
      <SidebarProvider>
        <div className={`min-h-screen flex w-full ${isMobile ? 'flex-col' : ''} overflow-hidden`}>
          {!isMobile && <AppSidebar />}
          <main className={`flex-1 flex flex-col ${isMobile ? 'h-screen' : ''} overflow-hidden`}>
            <div className={`flex-1 ${isMobile ? 'overflow-y-auto scroll-smooth' : 'overflow-y-auto'}`} 
                 style={isMobile ? { WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' } : {}}>
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
