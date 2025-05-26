
import { Play, Download } from "lucide-react";
import { useState } from "react";
import VideoPlayerModal from "./VideoPlayerModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import DownloadQualityModal from "./DownloadQualityModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface VideoCardProps {
  video: any;
}
export default function VideoCard({ video }: VideoCardProps) {
  const { snippet, id } = video;
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth() || {};
  const navigate = useNavigate();

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

    // Only implement Audio Only via backend for now
    if (quality === "Audio Only") {
      setDownloading(true);
      try {
        const res = await fetch(
          `https://viwfeqkuwblobybygilr.functions.supabase.co/youtube-download`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoId: id.videoId }),
          }
        );
        const data = await res.json();
        if (data.downloadUrl) {
          // Open download in a new tab
          window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
          toast({
            title: "Download Started",
            description: "Your MP3 file is being prepared.",
            variant: "default",
          });
        } else {
          throw new Error(data.error || "Unable to retrieve download link");
        }
      } catch (e: any) {
        toast({
          title: "Download failed",
          description: e.message || "Unknown error",
          variant: "destructive",
        });
      } finally {
        setDownloading(false);
      }
    } else {
      toast({
        title: "Not supported",
        description: `Only Audio Only downloads are enabled in demo`,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="bg-neutral-900 shadow-lg rounded-2xl mb-6 overflow-hidden border border-neutral-800 animate-fade-in">
      <img src={snippet.thumbnails.high.url} alt={snippet.title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col gap-2">
        <div className="font-semibold text-base text-white mb-1">{snippet.title}</div>
        <div className="text-sm text-gray-400">{snippet.channelTitle}</div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button
            onClick={() => setOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 flex items-center font-semibold gap-2 transition-colors"
          >
            <Play size={16} />
            Play
          </Button>
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleDownloadClick}
            disabled={downloading}
          >
            <Download size={16} /> {downloading ? "Downloading..." : "Download"}
          </Button>
        </div>
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
