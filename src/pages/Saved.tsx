import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import VideoCard from "@/components/VideoCard";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

export default function Saved() {
  const { profile } = useAuth() || {};
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedVideos() {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("saved_videos")
          .select("video_id, saved_at")
          .eq("user_id", profile.id)
          .order("saved_at", { ascending: false });

        if (error) throw error;

        // Convert saved video IDs back to video objects
        const videoObjects = data.map(item => ({
          id: { videoId: item.video_id },
          snippet: {
            title: `Saved Video ${item.video_id}`,
            thumbnails: { 
              high: { url: `https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg` } 
            },
            channelTitle: "Unknown Channel",
            publishedAt: item.saved_at
          }
        }));

        setSavedVideos(videoObjects);
      } catch (error) {
        console.error('Error fetching saved videos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedVideos();
  }, [profile?.id]);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 flex-1 w-full pb-20 md:pb-4">
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Saved Videos</h1>
          
          {loading ? (
            <div className="flex items-center justify-center mt-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading saved videos...</span>
            </div>
          ) : savedVideos.length === 0 ? (
            <div className="text-center text-muted-foreground mt-20">
              <p className="text-lg">No saved videos yet.</p>
              <p className="text-sm mt-2">Videos you save will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {savedVideos.map((video) => (
                <VideoCard key={video.id.videoId} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}