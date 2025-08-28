
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

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
        <div className="flex items-center gap-3">
          {isMobile && <SidebarTrigger className="text-foreground" />}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <img
              src="https://files.catbox.moe/urnjdz.jpg"
              alt="Maxwell Logo"
              className="h-8 w-8 object-cover rounded-full"
            />
            <span className="text-xl font-bold text-foreground select-none">
              Maxwell Downloader
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!isMobile && (
                <span className="text-sm text-muted-foreground mr-2">
                  Hi, {profile?.username ?? "User"}
                </span>
              )}
              <button
                className="flex items-center gap-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-md transition-colors text-sm"
                onClick={logout}
                title="Logout"
              >
                <LogOut size={15} />
                {!isMobile && "Logout"}
              </button>
            </>
          ) : (
            <button
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-semibold hover:bg-primary/90 transition-colors"
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
