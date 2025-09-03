
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export default function LikeDislikeButtons({ videoId }: { videoId: string }) {
  const { user, profile } = useAuth() || {};
  const [vote, setVote] = useState<number | null>(null);
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });

  // Fetch vote status and counts
  useEffect(() => {
    async function fetchVoteStatus() {
      if (!user?.id || !videoId) return;
      const { data: userVote } = await supabase
        .from("video_votes")
        .select("vote")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .single();

      setVote(userVote?.vote ?? null);

      const { data: allVotes } = await supabase
        .from("video_votes")
        .select("vote")
        .eq("video_id", videoId);
      const likes = (allVotes || []).filter((v) => v.vote === 1).length;
      const dislikes = (allVotes || []).filter((v) => v.vote === -1).length;
      setCounts({ likes, dislikes });
    }
    fetchVoteStatus();
  }, [user?.id, videoId]);

  async function handleVote(newVote: number) {
    if (!user?.id) {
      toast({ title: "Login required", description: "Please log in to vote", variant: "destructive" });
      return;
    }

    // If clicking same vote, remove it
    const finalVote = vote === newVote ? null : newVote;

    try {
      if (finalVote === null) {
        // Remove vote
        const { error } = await supabase
          .from("video_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("video_id", videoId);
        
        if (error) throw error;
      } else {
        // Upsert new vote
        const { error } = await supabase
          .from("video_votes")
          .upsert(
            { user_id: user.id, video_id: videoId, vote: finalVote },
            { onConflict: 'user_id,video_id' }
          );
        
        if (error) throw error;
      }

      setVote(finalVote);
      
      // Reload counts
      const { data: allVotes } = await supabase
        .from("video_votes")
        .select("vote")
        .eq("video_id", videoId);
      
      const likes = (allVotes || []).filter((item) => item.vote === 1).length;
      const dislikes = (allVotes || []).filter((item) => item.vote === -1).length;
      setCounts({ likes, dislikes });

      toast({ 
        title: finalVote === 1 ? "Liked!" : finalVote === -1 ? "Disliked!" : "Vote removed",
        description: finalVote ? "Thank you for your feedback!" : "Your vote has been removed."
      });

    } catch (error: any) {
      toast({ title: "Vote failed", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          vote === 1 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        onClick={() => handleVote(1)}
        aria-label="Like"
      >
        <ThumbsUp size={18} />
        {counts.likes}
      </button>
      <button
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          vote === -1 
            ? "bg-destructive text-destructive-foreground" 
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        onClick={() => handleVote(-1)}
        aria-label="Dislike"
      >
        <ThumbsDown size={18} />
        {counts.dislikes}
      </button>
    </div>
  );
}
