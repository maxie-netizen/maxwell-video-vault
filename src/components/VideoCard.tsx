
import { Play, Download } from "lucide-react";
import { useState, useEffect } from "react";
import VideoPlayerModal from "./VideoPlayerModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import DownloadQualityModal from "./DownloadQualityModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import LikeDislikeButtons from "./LikeDislikeButtons";
import SaveButton from "./SaveButton";
import { usePlayer } from "@/contexts/PlayerContext";

interface VideoCardProps {
  video: any;
}
export default function VideoCard({ video }: VideoCardProps) {
  const { snippet, id } = video;
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const { playVideo, minimizePlayer } = usePlayer();

  useEffect(() => {
    async function fetchDuration() {
      if (!id?.videoId) return;
      const apiKey = "AIzaSyBXbToqkneqDmQv5r3EOxH58PzjygpHSlg";
      const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id.videoId}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const iso = data.items?.[0]?.contentDetails?.duration;
      if (iso) {
        // convert ISO to mm:ss
        const match = iso.match(/PT((\d+)M)?((\d+)S)?/);
        const m = match?.[2] || "0";
        const s = match?.[4] || "0";
        setDuration(`${parseInt(m)}min ${parseInt(s)}s`);
      }
    }
    fetchDuration();
  }, [id.videoId]);

  function handleDownloadClick() {
    if (!user) {
      setModalOpen(false);
      setTimeout(() => navigate("/auth"), 150); // prompt login
      return;
    }
    setModalOpen(true);
  }

  async function handleQualitySelect(quality: string) {
    if (!user) {
      setModalOpen(false);
      setTimeout(() => navigate("/auth"), 150);
      return;
    }
    setModalOpen(false);
    setDownloading(true);

    try {
      const videoUrl = `https://youtu.be/${id.videoId}`;
      const apiUrl = quality === "Audio Only" 
        ? `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`
        : `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(videoUrl)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status && data.result) {
        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = data.result;
        link.download = `${snippet.title.substring(0, 50)}.${quality === "Audio Only" ? "mp3" : "mp4"}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Started",
          description: `Your ${quality === "Audio Only" ? "MP3" : "MP4"} file is downloading.`,
          variant: "default",
          duration: 5000
        });
      } else {
        throw new Error("Unable to retrieve download link. Please try again later.");
      }
    } catch (e: any) {
      toast({
        title: "Download failed",
        description: e.message || "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  }

  const handlePlayVideo = () => {
    playVideo({
      id: id.videoId,
      title: snippet.title,
      thumbnail: snippet.thumbnails.high.url,
    });
    minimizePlayer();
  };

  return (
    <div className="bg-card shadow-lg rounded-2xl mb-6 overflow-hidden border border-border animate-fade-in">
      <img src={snippet.thumbnails.high.url} alt={snippet.title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col gap-2">
        <div className="font-semibold text-base text-foreground mb-1">{snippet.title}</div>
        <div className="text-sm text-muted-foreground">{snippet.channelTitle}</div>
        {duration && (
          <div className="text-xs text-muted-foreground mb-1">Length: {duration}</div>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button
            onClick={handlePlayVideo}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 flex items-center font-semibold gap-2 transition-colors"
          >
            <Play size={16} />
            Play
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handleDownloadClick}
            disabled={downloading}
          >
            <Download size={16} /> {downloading ? "Downloading..." : "Download"}
          </Button>
          <SaveButton videoId={id.videoId} />
        </div>
        <LikeDislikeButtons videoId={id.videoId} />
      </div>
      <DownloadQualityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectQuality={handleQualitySelect}
      />
      <VideoPlayerModal
        open={open}
        onOpenChange={setOpen}
        videoId={id.videoId}
        title={snippet.title}
      />
    </div>
  );
}
