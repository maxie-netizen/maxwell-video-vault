
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function SaveButton({ videoId }: { videoId: string }) {
  const { user, profile } = useAuth() || {};
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from("saved_videos")
      .select("id")
      .eq("user_id", profile.id)
      .eq("video_id", videoId)
      .then(({ data }) => setSaved(!!(data && data.length > 0)));
  }, [profile?.id, videoId]);

  const handleClick = async () => {
    if (!profile?.id) {
      toast({ title: "Login required", description: "Please log in to save videos.", variant: "destructive" });
      return;
    }
    if (!saved) {
      await supabase.from("saved_videos").insert({
        user_id: profile.id,
        video_id: videoId,
      });
      toast({ title: "Saved for later!" });
    } else {
      await supabase.from("saved_videos")
        .delete()
        .eq("user_id", profile.id)
        .eq("video_id", videoId);
      toast({ title: "Removed from saved!" });
    }
    setSaved((v) => !v);
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
