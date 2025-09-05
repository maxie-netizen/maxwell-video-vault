import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, X, PictureInPicture2, ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useVideoHistory } from '@/contexts/VideoHistoryContext';
import { useLocation } from 'react-router-dom';
// import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { searchYouTube } from '@/lib/youtubeApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
}

export default function YouTubeMainPlayer() {
  const { 
    playerState, 
    closePlayer, 
    minimizePlayer, 
    pausePlayer, 
    resumePlayer, 
    handleVideoEnd,
    updateCurrentTime,
    updateDuration,
    setBuffering,
    playVideo
  } = usePlayer();
  const { currentVideo, isMinimized, showPlayer, isPlaying, currentTime, duration, isBuffering } = playerState;
  const { profile } = useAuth() || {};
  const { updateVideoProgress, getVideoProgress } = useVideoHistory();
  const location = useLocation();
  const [hasStartedTracking, setHasStartedTracking] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const isMobile = useIsMobile();
  const loadingRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Track video progress and update history
  useEffect(() => {
    if (currentVideo && !hasStartedTracking) {
      setHasStartedTracking(true);
      updateVideoProgress(
        currentVideo.id,
        currentVideo.title,
        currentVideo.thumbnail,
        currentVideo.channelTitle
      );
    }
  }, [currentVideo, hasStartedTracking, updateVideoProgress]);

  // Update video progress periodically
  useEffect(() => {
    if (!currentVideo || !isPlaying) return;

    const interval = setInterval(() => {
      if (currentTime > 0) {
        updateVideoProgress(
          currentVideo.id,
          currentVideo.title,
          currentVideo.thumbnail,
          currentVideo.channelTitle,
          currentTime,
          duration
        );
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [currentVideo, isPlaying, currentTime, duration, updateVideoProgress]);

  // Set up iframe src with proper parameters
  useEffect(() => {
    if (iframeRef.current && currentVideo) {
      const iframe = iframeRef.current;
      const savedProgress = getVideoProgress(currentVideo.id);
      
      console.log('=== YouTube Player Setup ===');
      console.log('Current video:', currentVideo);
      console.log('Video ID:', currentVideo.id);
      console.log('Video title:', currentVideo.title);
      console.log('Saved progress:', savedProgress);
      console.log('Is playing:', isPlaying);
      console.log('Iframe element:', iframe);
      
      setIsVideoLoading(true);
      setBuffering(true);
      
      const params = new URLSearchParams({
        autoplay: isPlaying ? '1' : '0',
        enablejsapi: '1',
        rel: '0',
        modestbranding: '1',
        start: savedProgress.toString(),
        controls: '1',
        showinfo: '0',
        iv_load_policy: '3'
      });

      const videoUrl = `https://www.youtube.com/embed/${currentVideo.id}?${params.toString()}`;
      console.log('Final video URL:', videoUrl);
      
      // Clear previous src first
      iframe.src = '';
      
      // Set new src
      setTimeout(() => {
        iframe.src = videoUrl;
        console.log('Iframe src set to:', iframe.src);
      }, 100);
    }
  }, [currentVideo, isPlaying, getVideoProgress, setBuffering]);

  // Load related videos
  const loadRelatedVideos = useCallback(async (pageToken?: string) => {
    if (!currentVideo || loading) return;
    
    setLoading(true);
    try {
      // Extract key terms from title for related search
      const searchTerms = currentVideo.title
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(' ');
      
      const response = await searchYouTube(searchTerms, pageToken);
      const newVideos = response.items
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
        }))
        .filter((video: Video) => video.id !== currentVideo.id); // Don't include current video

      if (pageToken) {
        setRelatedVideos(prev => [...prev, ...newVideos]);
      } else {
        setRelatedVideos(newVideos);
      }
      
      setNextPageToken(response.nextPageToken);
      setHasMore(!!response.nextPageToken);
    } catch (error) {
      console.error('Failed to fetch related videos:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [currentVideo, loading]);

  // Load initial related videos
  useEffect(() => {
    if (currentVideo) {
      loadRelatedVideos();
    }
  }, [currentVideo, loadRelatedVideos]);

  // Infinite scroll setup
  useEffect(() => {
    if (!hasMore || loading) return;
    
    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadRelatedVideos(nextPageToken || undefined);
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
  }, [hasMore, loading, loadRelatedVideos, nextPageToken]);

  const handleVideoClick = (video: Video) => {
    playVideo(video);
  };

  const handlePictureInPicture = async () => {
    alert('Picture-in-Picture is supported! contact devmaxwell for further support.');
  };

  // Hide player when not on home page or when minimized
  if (!showPlayer || !currentVideo || location.pathname !== '/' || isMinimized) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          {/* Video Player Section */}
          <div className="lg:w-2/3 xl:w-3/4 max-w-5xl">
            <div className="aspect-video bg-black relative" style={{ maxHeight: isMobile ? '250px' : '500px' }}>
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="YouTube Video Player"
                onLoad={() => {
                  console.log('YouTube player loaded successfully');
                  setBuffering(false);
                  setIsVideoLoading(false);
                }}
                onError={() => {
                  console.error('YouTube player failed to load');
                  setBuffering(false);
                  setIsVideoLoading(false);
                }}
                style={{ 
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              
              {/* Loading indicator */}
              {(isBuffering || isVideoLoading) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">Loading video...</p>
                    <p className="text-white text-xs mt-1">Video ID: {currentVideo.id}</p>
                  </div>
                </div>
              )}
              
              {/* Fallback message if video fails to load */}
              {!isVideoLoading && !isBuffering && currentVideo && (
                <div className="absolute bottom-2 right-2">
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {currentVideo.id}
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Info and Controls */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-foreground line-clamp-2 mb-2">
                    {currentVideo.title}
                  </h1>
                  <div className="text-sm text-muted-foreground mb-3">
                    {currentVideo.channelTitle}
                  </div>
                  
                  {/* Debug info */}
                  <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded">
                    <div>Video ID: {currentVideo.id}</div>
                    <div>Status: {isVideoLoading ? 'Loading...' : isBuffering ? 'Buffering...' : 'Ready'}</div>
                    <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (iframeRef.current) {
                            const testUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
                            console.log('Testing with known video:', testUrl);
                            iframeRef.current.src = testUrl;
                          }
                        }}
                        className="text-xs"
                      >
                        Test with Rick Roll
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {duration > 0 && (
                    <div className="w-full h-1 bg-muted rounded-full mb-2">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-300"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Time Display */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                    <span>{Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isPlaying ? pausePlayer : resumePlayer}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={minimizePlayer}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <PictureInPicture2 className="h-4 w-4 mr-1" />
                    Mini Player
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closePlayer}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar for related videos - shown on larger screens */}
          <div className="lg:w-1/3 xl:w-1/4 border-l border-border bg-muted/30 p-4 max-h-[600px] overflow-y-auto hidden lg:block">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">Up next</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
            </div>
            
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {relatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex gap-3 cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors group"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative w-32 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-20 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                        {video.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {video.channelTitle}
                      </p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-32 h-20 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {hasMore && (
                  <div ref={loadingRef} className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
