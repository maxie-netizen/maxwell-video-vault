
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Header() {
  const { user, profile, logout } = useAuth() || {};
  const navigate = useNavigate();

  // Placeholder logo image - you can replace this src with your preferred/previous logo asset path!
  // If you upload your own, use: <img src="/lovable-uploads/your-logo.png" ... />
  const logoSrc = "/favicon.ico"; // fallback favicon, or point to a real logo file
  return (
    <header className="w-full bg-neutral-900 py-4 shadow">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img
            src={logoSrc}
            alt="Logo"
            className="h-8 w-8 object-contain rounded"
          />
          <span className="text-2xl font-bold text-white select-none">
            Maxwell Downloader
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-400 mr-2">
                Hi, {profile?.username ?? "User"}
              </span>
              <button
                className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded transition"
                onClick={logout}
                title="Logout"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <button
              className="bg-blue-600 text-white px-4 py-1.5 rounded font-semibold hover:bg-blue-700"
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
