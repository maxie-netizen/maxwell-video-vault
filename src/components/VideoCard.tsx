
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
      setTimeout(() => navigate("/auth"), 150); // prompt login
      return;
    }
    setModalOpen(true);
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
    <div className="video-card bg-card shadow-lg rounded-2xl mb-4 overflow-hidden border border-border animate-fade-in w-full relative z-10">
      <img src={snippet.thumbnails.high.url} alt={snippet.title} className="w-full h-44 sm:h-48 object-cover" />
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        <div className="font-semibold text-sm sm:text-base text-foreground mb-1 line-clamp-2">{snippet.title}</div>
        <div className="text-xs sm:text-sm text-muted-foreground truncate">{snippet.channelTitle}</div>
        {duration && (
          <div className="text-xs text-muted-foreground mb-1">Length: {duration}</div>
        )}
        <div className="flex gap-2 mt-2 sm:mt-3">
          <Button
            onClick={handlePlayVideo}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 flex items-center font-semibold gap-1 sm:gap-2 transition-colors flex-1 text-xs sm:text-sm"
          >
            <Play size={14} />
            Play
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-1 sm:gap-2 flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
            onClick={handleDownloadClick}
          >
            <Download size={14} /> Download
          </Button>
        </div>
        <div className="w-full">
          <SaveButton videoId={id.videoId} />
        </div>
        <LikeDislikeButtons videoId={id.videoId} />
      </div>
      <DownloadQualityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        video={{
          id: id.videoId,
          title: snippet.title,
          thumbnail: snippet.thumbnails.high.url
        }}
        videoUrl={`https://youtu.be/${id.videoId}`}
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
