
import { Play, Download } from "lucide-react";
import { useState } from "react";
import VideoPlayerModal from "./VideoPlayerModal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface VideoCardProps {
  video: any;
}
export default function VideoCard({ video }: VideoCardProps) {
  const { snippet, id } = video;
  const [open, setOpen] = useState(false);

  function handleDownload(quality: string) {
    toast({
      title: "Download not available",
      description:
        "Direct download is not available in this demo. Backend required for this feature.",
      variant: "destructive",
    });
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
            variant="secondary"
            className="flex items-center gap-2"
            disabled
            onClick={() => handleDownload("720p")}
            title="Needs backend"
          >
            <Download size={16} /> Download 720p
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            disabled
            onClick={() => handleDownload("480p")}
            title="Needs backend"
          >
            <Download size={16} /> Download 480p
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            disabled
            onClick={() => handleDownload("Audio")}
            title="Needs backend"
          >
            <Download size={16} /> Download Audio
          </Button>
        </div>
      </div>
      <VideoPlayerModal
        open={open}
        onOpenChange={setOpen}
        videoId={id.videoId}
        title={snippet.title}
      />
    </div>
  );
}
