import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from './App.tsx'
import './index.css'
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AuthProvider } from "@/hooks/useAuth";
import { VideoHistoryProvider } from "@/contexts/VideoHistoryContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <VideoHistoryProvider>
        <PlayerProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </PlayerProvider>
      </VideoHistoryProvider>
    </AuthProvider>
  </StrictMode>,
);
