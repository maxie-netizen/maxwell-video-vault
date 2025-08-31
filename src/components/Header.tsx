
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import NetworkStatus from "@/components/NetworkStatus";

export default function Header() {
  const { user, profile, logout } = useAuth() || {};
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Placeholder logo image - you can replace this src with your preferred/previous logo asset path!
  // If you upload your own, use: <img src="/lovable-uploads/your-logo.png" ... />
  const logoSrc = "/favicon.ico"; // fallback favicon, or point to a real logo file
  return (
    <header className="w-full bg-card border-b border-border py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isMobile && <SidebarTrigger className="text-foreground flex-shrink-0" />}
          <div 
            className="flex items-center gap-2 cursor-pointer min-w-0 flex-1" 
            onClick={() => navigate("/")}
          >
            <img
              src="https://files.catbox.moe/urnjdz.jpg"
              alt="Maxwell Logo"
              className="h-8 w-8 object-cover rounded-full flex-shrink-0"
            />
            <span className={`font-bold text-foreground select-none truncate ${isMobile ? 'text-sm' : 'text-lg'}`}>
              MAXIE DWNLDER
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <NetworkStatus />
          {user ? (
            <>
              {!isMobile && (
                <span className="text-sm text-muted-foreground mr-2 truncate">
                  Hi, {profile?.username ?? "User"}
                </span>
              )}
              <button
                className={`flex items-center gap-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors ${isMobile ? 'px-2 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'}`}
                onClick={logout}
                title="Logout"
              >
                <LogOut size={isMobile ? 14 : 15} />
                {!isMobile && "Logout"}
              </button>
            </>
          ) : (
            <button
              className={`bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-1.5 text-base'}`}
              onClick={() => navigate("/auth")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
