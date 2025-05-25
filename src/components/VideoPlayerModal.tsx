
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VideoPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string | null;
  title?: string;
}

export default function VideoPlayerModal({ open, onOpenChange, videoId, title }: VideoPlayerModalProps) {
  if (!videoId) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold pb-2">{title}</DialogTitle>
        </DialogHeader>
        <iframe
          title="YouTube Video Player"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          width="100%"
          height="400"
          allow="autoplay; encrypted-media"
          className="w-full rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
