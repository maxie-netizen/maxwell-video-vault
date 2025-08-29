import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import { searchYouTube } from "@/lib/youtubeApi";
import { useAuth } from "@/hooks/useAuth";
import FooterReview from "@/components/FooterReview";
import React from "react";
import AdminPanel from "@/components/AdminPanel";
import DeveloperAttribution from "@/components/DeveloperAttribution";
import { VideoCache } from "@/lib/videoCache";
import { Loader2 } from "lucide-react";

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [noResult, setNoResult] = useState(false);
  const { user, profile } = useAuth() || {};

  // Load personalized content on app start
  useEffect(() => {
    const loadInitialContent = async () => {
      setInitialLoading(true);
      
      // Simulate lazy loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get personalized videos based on user's search history
      const personalizedVideos = VideoCache.getPersonalizedVideos(user?.id);
      setResults(personalizedVideos);
      setInitialLoading(false);
    };

    loadInitialContent();
  }, [user?.id]);

  async function handleSearch(query: string) {
    setLoading(true);
    setNoResult(false);
    
    try {
      // Check cache first
      const cachedResults = VideoCache.getCachedResults(query, user?.id);
      
      if (cachedResults) {
        setResults(cachedResults);
        setNoResult(cachedResults.length === 0);
        setLoading(false);
        return;
      }

      // Search API if not in cache
      const items = await searchYouTube(query);
      setResults(items);
      setNoResult(items.length === 0);
      
      // Cache results for future use
      VideoCache.cacheSearchResults(query, items, user?.id);
      
    } catch (err) {
      setResults([]);
      setNoResult(true);
    }
    setLoading(false);
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 flex-1 w-full pb-20 md:pb-4">
        <SearchBar onSearch={handleSearch} loading={loading} />
        
        {initialLoading ? (
          <div className="flex items-center justify-center mt-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading personalized content...</span>
          </div>
        ) : (
          <>
            {noResult && (
              <div className="text-center text-muted-foreground mt-16 text-lg">
                No results found.
              </div>
            )}
            <div className="mt-6 grid gap-6">
              {results.map((video) => (
                <VideoCard key={video.id.videoId} video={video} />
              ))}
            </div>
            {!results.length && !noResult && (
              <div className="text-center text-muted-foreground mt-20">
                <span>Enter a search above to find YouTube videos and music.</span>
              </div>
            )}
          </>
        )}
        {/* Admin Panel */}
        {profile?.role === "admin" && (
          <div className="mt-10">
            <FooterReview />
            <div className="mt-4">
              <React.Suspense fallback={<div>Loading admin...</div>}>
                <AdminPanel />
              </React.Suspense>
            </div>
          </div>
        )}
      </main>
      {/* Extra Footer Sections */}
      <FooterReview />
      <DeveloperAttribution />
    </div>
  );
};

export default Index;
