import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import VideoCard from "@/components/VideoCard";
import { searchYouTube, getTrendingVideos } from "@/lib/youtubeApi";
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
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const { user, profile } = useAuth() || {};
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  // Load personalized content on app start
  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        // Get personalized videos based on user's search history
        const personalizedVideos = VideoCache.getPersonalizedVideos(user?.id, false);
        
        // If user has no search history, show trending content
        if (personalizedVideos.length === 0) {
          const response = await getTrendingVideos();
          setResults(response.items);
          setNextPageToken(response.nextPageToken);
          setCurrentQuery("");
        } else {
          setResults(personalizedVideos);
          setCurrentQuery("");
        }
      } catch (err) {
        console.error("Failed to load initial content:", err);
        setResults([]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialContent();
  }, [user?.id]);

  // Load more videos function
  const loadMoreVideos = useCallback(async () => {
    if (!hasMore || loading || !nextPageToken) return;
    
    setLoading(true);
    try {
      let response;
      if (currentQuery) {
        response = await searchYouTube(currentQuery, nextPageToken);
      } else {
        response = await getTrendingVideos(nextPageToken);
      }
      
      const newVideos = response.items;
      setResults(prev => [...prev, ...newVideos]);
      setNextPageToken(response.nextPageToken);
      setHasMore(!!response.nextPageToken);
    } catch (err) {
      console.error("Failed to load more videos:", err);
      setHasMore(false);
    }
    setLoading(false);
  }, [hasMore, loading, nextPageToken, currentQuery]);

  // Infinite scroll setup
  useEffect(() => {
    if (initialLoading) return;
    
    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreVideos();
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
  }, [initialLoading, hasMore, loading, loadMoreVideos]);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setNoResult(false);
    setCurrentQuery(query);
    
    try {
      // Check cache first
      const cachedResults = VideoCache.getCachedResults(query, user?.id);
      
      if (cachedResults) {
        setResults(cachedResults);
        setNoResult(cachedResults.length === 0);
        setNextPageToken(null);
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Search API if not in cache
      const response = await searchYouTube(query);
      const items = response.items;
      setResults(items);
      setNoResult(items.length === 0);
      setNextPageToken(response.nextPageToken);
      setHasMore(!!response.nextPageToken);
      
      // Cache results for future use
      VideoCache.cacheSearchResults(query, items, user?.id);
      
    } catch (err) {
      setResults([]);
      setNoResult(true);
      setHasMore(false);
    }
    setLoading(false);
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-32 md:pb-6 overflow-x-hidden relative z-10">
        <div className="sticky top-2 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 rounded-lg mb-6">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
        <div className="relative z-10">
          {initialLoading ? (
            <div className="mt-8 grid gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border bg-white dark:bg-slate-800 shadow-sm mx-2 md:mx-0">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-4/5 mb-3" />
                    <Skeleton className="h-4 w-3/5 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3 w-1/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {noResult && (
                <div className="text-center py-16 mx-2 md:mx-0">
                  <div className="mx-auto w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">No results found</h3>
                  <p className="text-slate-600 dark:text-slate-400">Try different keywords or search for something else</p>
                </div>
              )}
            
              {results.length > 0 && (
                <>
                  <div className="mt-6 mb-4 flex justify-between items-center mx-2 md:mx-0">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      {VideoCache.hasSearchHistory(user?.id) ? "Personalized for you" : "Trending videos"}
                    </h2>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {results.length} {results.length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>
                  
                  <div className="video-grid grid gap-6 mx-2 md:mx-0 mb-8">
                    {results.map((video) => (
                      <VideoCard key={video.id.videoId || video.id} video={video} />
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div ref={loadingRef} className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                </>
              )}
            
            {!results.length && !noResult && (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">Discover videos</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                  Find your favorite YouTube videos, music, and content by entering a search query above.
                </p>
                <div className="inline-flex flex-col sm:flex-row gap-3">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">Music</span>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">Tutorials</span>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">Gaming</span>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">News</span>
                </div>
              </div>
            )}
          </>
        )}
        </div>
        
        {/* Admin Panel */}
        {profile?.role === "admin" && (
          <div className="mt-16 mb-8 mx-2 md:mx-0 relative z-0">
            <div className="bg-background border border-border rounded-lg p-4 mb-4">
              <FooterReview />
            </div>
            <div className="bg-background border border-border rounded-lg p-4">
              <React.Suspense fallback={<div>Loading admin...</div>}>
                <AdminPanel />
              </React.Suspense>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer Sections - Fixed at bottom with proper spacing */}
      <div className="relative z-0 mt-auto">
        <FooterReview />
        <DeveloperAttribution />
      </div>
    </div>
  );
};

export default Index;
