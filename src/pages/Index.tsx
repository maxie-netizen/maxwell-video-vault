import { useState, useEffect, useRef, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [noResult, setNoResult] = useState(false);
  const { user, profile } = useAuth() || {};
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  // Load personalized content on app start
  useEffect(() => {
    const loadInitialContent = async () => {
      // Get personalized videos based on user's search history
      const personalizedVideos = VideoCache.getPersonalizedVideos(user?.id, false);
      
      // If user has no search history, show trending/random content
      if (personalizedVideos.length === 0) {
        // In a real app, you would fetch trending videos from YouTube API
        // For demo, we'll simulate a small delay and show empty state
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      setResults(personalizedVideos);
      setInitialLoading(false);
    };

    loadInitialContent();
  }, [user?.id]);

  // Lazy loading setup
  useEffect(() => {
    if (initialLoading) return;
    
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // In a real app, this would load more videos
        // For demo, we're just observing but not loading additional content
      }
    }, options);
    
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [initialLoading, results]);

  const handleSearch = useCallback(async (query: string) => {
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
  }, [user?.id]);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 flex-1 w-full pb-20 md:pb-4">
        <div className="sticky top-2 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
        
        {initialLoading ? (
          <div className="mt-8 grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-4">
                  <Skeleton className="h-5 w-4/5 mb-2" />
                  <Skeleton className="h-4 w-3/5 mb-3" />
                  <div className="flex items-center mt-2">
                    <Skeleton className="h-3 w-1/4 mr-2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {noResult && (
              <div className="text-center py-16">
                <div className="text-muted-foreground text-lg mb-2">No results found</div>
                <p className="text-sm text-muted-foreground">Try different keywords or search for something else</p>
              </div>
            )}
            
            {results.length > 0 && (
              <>
                <div className="mt-2 mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {user?.id ? "Personalized for you" : "Recommended videos"}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {results.length} {results.length === 1 ? 'video' : 'videos'}
                  </span>
                </div>
                
                <div className="grid gap-6">
                  {results.map((video) => (
                    <VideoCard key={video.id.videoId} video={video} />
                  ))}
                </div>
                
                <div ref={loadingRef} className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground opacity-60" />
                </div>
              </>
            )}
            
            {!results.length && !noResult && (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Search for videos</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Find your favorite YouTube videos, music, and content by entering a search query above.
                </p>
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
