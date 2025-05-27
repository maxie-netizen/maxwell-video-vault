
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function SaveButton({ videoId }: { videoId: string }) {
  const { profile } = useAuth() || {};
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function checkSaved() {
      if (!profile?.id || !videoId) return;
      const { data } = await supabase
        .from("saved_videos")
        .select("id")
        .eq("user_id", profile.id)
        .eq("video_id", videoId);
      setSaved(!!(data && data.length > 0));
    }
    checkSaved();
  }, [profile?.id, videoId]);

  const handleClick = async () => {
    if (!profile?.id) {
      toast({ title: "Login required", description: "Please log in to save videos.", variant: "destructive" });
      return;
    }
    if (!saved) {
      const { error } = await supabase.from("saved_videos").insert({
        user_id: profile.id,
        video_id: videoId,
      });
      if (!error) {
        toast({ title: "Saved for later!" });
        setSaved(true);
      } else {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
      }
    } else {
      const { error } = await supabase.from("saved_videos")
        .delete()
        .eq("user_id", profile.id)
        .eq("video_id", videoId);
      if (!error) {
        toast({ title: "Removed from saved!" });
        setSaved(false);
      } else {
        toast({ title: "Remove failed", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <Button
      variant={saved ? "secondary" : "default"}
      className="flex items-center gap-2"
      onClick={handleClick}
    >
      <Bookmark size={16} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
