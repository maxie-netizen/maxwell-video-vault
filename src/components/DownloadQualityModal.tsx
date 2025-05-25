
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DownloadQualityModal({ open, onOpenChange, onSelectQuality }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuality: (q: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold pb-1">Choose Quality</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <Button onClick={() => onSelectQuality("720p")} className="w-full">720p</Button>
          <Button onClick={() => onSelectQuality("480p")} className="w-full">480p</Button>
          <Button onClick={() => onSelectQuality("Audio")} className="w-full">Audio Only</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
