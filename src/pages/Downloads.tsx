import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Download, FileVideo, Music, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadManager, DownloadItem } from "@/lib/downloadManager";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import { toast } from "@/components/ui/use-toast";

export default function Downloads() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth() || {};
  const { playVideo } = usePlayer();

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userDownloads = await DownloadManager.getUserDownloads(user.id);
        setDownloads(userDownloads);
      } catch (error) {
        console.error('Error fetching downloads:', error);
        toast({
          title: "Error",
          description: "Failed to load downloads.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user?.id]);

  const handlePlayVideo = (videoId: string, title: string, thumbnail: string) => {
    playVideo({
      id: videoId,
      title,
      thumbnail
    });
  };

  const handleDeleteDownload = async (downloadId: string) => {
    await DownloadManager.deleteDownload(downloadId);
    setDownloads(prev => prev.filter(d => d.id !== downloadId));
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 flex-1 w-full pb-20 md:pb-4">
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Downloads</h1>
          
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card shadow-lg rounded-2xl overflow-hidden border border-border">
                  <div className="flex gap-4 p-4">
                    <Skeleton className="w-24 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2 mt-3">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !user ? (
            <div className="text-center text-muted-foreground mt-20">
              <Download className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg">Sign in to view your downloads</p>
              <p className="text-sm mt-2">Login to track your download history.</p>
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center text-muted-foreground mt-20">
              <Download className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg">No downloads yet.</p>
              <p className="text-sm mt-2">Downloaded videos will appear here.</p>
              
              <div className="mt-8 space-y-4">
                <h3 className="text-foreground font-semibold">Supported Formats:</h3>
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-5 w-5 text-primary" />
                    <span className="text-sm">MP4 Video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    <span className="text-sm">MP3 Audio</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {downloads.map((download) => (
                <div key={download.id} className="bg-card shadow-lg rounded-2xl overflow-hidden border border-border">
                  <div className="flex gap-4 p-4">
                    <div className="relative w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={download.thumbnail}
                        alt={download.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        {download.format === 'audio' ? (
                          <Music className="h-4 w-4 text-white" />
                        ) : (
                          <FileVideo className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">
                        {download.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {download.format === 'audio' ? 'Audio (MP3)' : 'Video (MP4)'} • 
                        {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlayVideo(download.video_id, download.title, download.thumbnail)}
                          className="h-8 px-3 text-xs"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(download.download_url, '_blank')}
                          className="h-8 px-3 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Re-download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDownload(download.id)}
                          className="h-8 px-3 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}