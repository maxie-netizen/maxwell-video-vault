
import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import { searchYouTube } from "@/lib/youtubeApi";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [noResult, setNoResult] = useState(false);

  async function handleSearch(query: string) {
    setLoading(true);
    setNoResult(false);
    try {
      const items = await searchYouTube(query);
      setResults(items);
      setNoResult(items.length === 0);
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
