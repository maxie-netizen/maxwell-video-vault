
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function FooterReview() {
  const { user, profile } = useAuth() || {};
  const [comment, setComment] = useState("");
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("comments")
      .select("content, created_at, user_id")
      .order("created_at", { ascending: false })
      .then(({ data }) => setAllComments(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !comment.trim()) {
      toast({ title: "Enter a review.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      user_id: profile.id,
      content: comment,
    });
    if (!error) {
      setAllComments([{ content: comment, created_at: new Date().toISOString(), user_id: profile.id }, ...allComments]);
      setComment("");
      // Email via edge function
      fetch("https://viwfeqkuwblobybygilr.functions.supabase.co/send-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, username: profile?.username }),
      });
      toast({ title: "Review submitted!" });
    } else {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <footer className="mx-auto max-w-2xl p-6 mt-10 border-t border-neutral-800 bg-neutral-950">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 md:items-center">
        <input
          type="text"
          placeholder="Add a site review/change suggestion..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="flex-1 px-3 py-2 rounded bg-neutral-800 text-white border border-neutral-700"
          maxLength={420}
        />
        <Button type="submit" disabled={loading}>
          Submit
        </Button>
      </form>
      <div className="text-xs mt-4 text-gray-400">
        {allComments.map((c, i) => (
          <div key={i} className="mb-2">
            <span className="font-semibold text-white">{c.user_id?.slice(0, 8) ?? "user"}:</span>{" "}
            <span>{c.content}</span>{" "}
            <span className="text-gray-500 ml-1">{new Date(c.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}
