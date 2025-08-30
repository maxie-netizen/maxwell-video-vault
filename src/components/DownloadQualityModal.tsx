import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileVideo, Music } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { DownloadManager } from "@/lib/downloadManager";
import { useAuth } from "@/hooks/useAuth";

interface DownloadQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    thumbnail: string;
  } | null;
  videoUrl: string;
}

export default function DownloadQualityModal({ 
  isOpen, 
  onClose, 
  video, 
  videoUrl 
}: DownloadQualityModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth() || {};

  const handleDownload = async (format: 'video' | 'audio') => {
    if (!video) return;
    
    setIsDownloading(true);
    
    try {
      await DownloadManager.downloadVideo(
        video.id, 
        video.title, 
        video.thumbnail, 
        format, 
        user?.id
      );
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
      onClose();
    }
  };

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Choose Download Quality
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium truncate">{video.title}</p>
          </div>
          
          <div className="grid gap-3">
            <Button
              onClick={() => handleDownload("video")}
              disabled={isDownloading}
              className="flex items-center gap-2 p-4 h-auto bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            >
              <FileVideo className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">360p Video</div>
                <div className="text-sm opacity-80">Standard quality MP4</div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleDownload("audio")}
              disabled={isDownloading}
              className="flex items-center gap-2 p-4 h-auto bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground border border-secondary/20"
            >
              <Music className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Audio Only</div>
                <div className="text-sm opacity-80">MP3 format</div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}