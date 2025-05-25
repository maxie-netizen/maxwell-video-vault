
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import { searchYouTube } from "@/lib/youtubeApi";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const DEMO_VIDEO = {
  id: { videoId: "dQw4w9WgXcQ" },
  snippet: {
    title: "Rick Astley - Never Gonna Give You Up (Music Video)",
    thumbnails: { high: { url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } },
    channelTitle: "Official RickAstley",
    publishedAt: "1987-10-25T00:00:00Z"
  }
};

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [noResult, setNoResult] = useState(false);

  // For restoring previous search
  useEffect(() => {
    const prev = localStorage.getItem("recentResults");
    if (prev) {
      setResults(JSON.parse(prev));
    } else {
      setResults([DEMO_VIDEO]);
    }
  }, []);

  async function handleSearch(query: string) {
    setLoading(true);
    setNoResult(false);
    try {
      const items = await searchYouTube(query);
      setResults(items);
      setNoResult(items.length === 0);
      localStorage.setItem("recentResults", JSON.stringify(items));
    } catch (err) {
      setResults([]);
      setNoResult(true);
    }
    setLoading(false);
  }

  return (
    <div className="bg-neutral-950 min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto px-2">
        <SearchBar onSearch={handleSearch} loading={loading} />
        {noResult && (
          <div className="text-center text-gray-400 mt-16 text-lg">
            No results found.
          </div>
        )}
        <div className="mt-6 grid gap-6">
          {results.map((video) => (
            <VideoCard key={video.id.videoId} video={video} />
          ))}
        </div>
        {!results.length && !noResult && (
          <div className="text-center text-gray-600 mt-20">
            <span>Enter a search above to find YouTube videos and music.</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

