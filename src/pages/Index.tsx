
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import { searchYouTube } from "@/lib/youtubeApi";
import { useAuth } from "@/hooks/useAuth";

// More demo videos and shorts
const DEMO_VIDEOS = [
  {
    id: { videoId: "dQw4w9WgXcQ" },
    snippet: {
      title: "Rick Astley - Never Gonna Give You Up (Music Video)",
      thumbnails: { high: { url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } },
      channelTitle: "Official RickAstley",
      publishedAt: "1987-10-25T00:00:00Z"
    }
  },
  {
    id: { videoId: "E7wJTI-1dvQ" },
    snippet: {
      title: "Britney Spears - ...Baby One More Time (Official Video)",
      thumbnails: { high: { url: "https://img.youtube.com/vi/E7wJTI-1dvQ/hqdefault.jpg" } },
      channelTitle: "Britney Spears",
      publishedAt: "1998-10-23T00:00:00Z"
    }
  },
  {
    id: { videoId: "3JZ_D3ELwOQ" },
    snippet: {
      title: "Eminem - Without Me (Official Music Video)",
      thumbnails: { high: { url: "https://img.youtube.com/vi/3JZ_D3ELwOQ/hqdefault.jpg" } },
      channelTitle: "EminemMusic",
      publishedAt: "2009-06-16T00:00:00Z"
    }
  }
];

const SHORTS = [
  {
    id: { videoId: "ShZ978fBl6Y" },
    snippet: {
      title: "Amazing Parkour Flip #shorts",
      thumbnails: { high: { url: "https://img.youtube.com/vi/ShZ978fBl6Y/hqdefault.jpg" } },
      channelTitle: "ParkourWorld",
      publishedAt: "2023-09-12T00:00:00Z"
    }
  },
  {
    id: { videoId: "ZcUf59Yk5ig" },
    snippet: {
      title: "Quick Cat Reaction #shorts",
      thumbnails: { high: { url: "https://img.youtube.com/vi/ZcUf59Yk5ig/hqdefault.jpg" } },
      channelTitle: "FunnyPets",
      publishedAt: "2022-01-15T00:00:00Z"
    }
  }
];

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
      setResults(DEMO_VIDEOS);
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

        {/* Shorts Section */}
        <div className="mt-14">
          <h2 className="text-lg font-bold text-white mb-4">Shorts</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SHORTS.map(video => (
              <VideoCard key={video.id.videoId} video={video} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
