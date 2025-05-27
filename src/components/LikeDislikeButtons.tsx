
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function LikeDislikeButtons({ videoId }: { videoId: string }) {
  const { user, profile } = useAuth() || {};
  const [vote, setVote] = useState<number | null>(null);
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });

  // fetch vote status and counts
  useEffect(() => {
    supabase
      .from("video_votes")
      .select("vote")
      .eq("user_id", profile?.id)
      .eq("video_id", videoId)
      .single()
      .then(({ data }) => {
        setVote(data?.vote ?? null);
      });
    // get total counts
    supabase
      .from("video_votes")
      .select("vote")
      .eq("video_id", videoId)
      .then(({ data }) => {
        const likes = (data || []).filter((v) => v.vote === 1).length;
        const dislikes = (data || []).filter((v) => v.vote === -1).length;
        setCounts({ likes, dislikes });
      });
  }, [profile?.id, videoId]);

  async function handleVote(v: number) {
    if (!profile?.id) {
      toast({ title: "Login required", description: "Please log in to vote", variant: "destructive" });
      return;
    }
    await supabase.from("video_votes").upsert({
      user_id: profile.id,
      video_id: videoId,
      vote: v,
    });
    setVote(v);
    // reload counts
    const { data } = await supabase
      .from("video_votes")
      .select("vote")
      .eq("video_id", videoId);
    const likes = (data || []).filter((v) => v.vote === 1).length;
    const dislikes = (data || []).filter((v) => v.vote === -1).length;
    setCounts({ likes, dislikes });
  }

  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        className={`flex items-center gap-1 px-2 py-1 rounded ${vote === 1 ? "bg-green-600 text-white" : "bg-neutral-800 text-gray-300"}`}
        onClick={() => handleVote(1)}
        aria-label="Like"
      >
        <ThumbsUp size={18} />
        {counts.likes}
      </button>
      <button
        className={`flex items-center gap-1 px-2 py-1 rounded ${vote === -1 ? "bg-red-700 text-white" : "bg-neutral-800 text-gray-300"}`}
        onClick={() => handleVote(-1)}
        aria-label="Dislike"
      >
        <ThumbsDown size={18} />
        {counts.dislikes}
      </button>
    </div>
  );
}
