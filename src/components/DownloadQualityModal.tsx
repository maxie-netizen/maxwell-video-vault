
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DownloadQualityModal({ open, onOpenChange, onSelectQuality }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuality: (q: string) => void;
}) {
  const qualities = ["360p", "Audio Only"];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold pb-1">Choose Quality</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          {qualities.map(q => (
            <Button key={q} onClick={() => onSelectQuality(q)} className="w-full">{q}</Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
