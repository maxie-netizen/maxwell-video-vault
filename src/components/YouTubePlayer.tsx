import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  X,
  SkipBack,
  SkipForward,
  RotateCcw,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  BookmarkPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/hooks/useAuth';
import { useVideoHistory } from '@/contexts/VideoHistoryContext';
import { useLocation } from 'react-router-dom';
import { searchYouTube } from '@/lib/youtubeApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: string;
  description?: string;
}

export default function YouTubePlayer() {
  const { 
    playerState, 
    closePlayer, 
    minimizePlayer, 
    pausePlayer, 
    resumePlayer,
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
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

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
    }, 5000);

    return () => clearInterval(interval);
  }, [currentVideo, isPlaying, currentTime, duration, updateVideoProgress]);

  // Set up iframe src with proper parameters
  useEffect(() => {
    if (iframeRef.current && currentVideo) {
      const iframe = iframeRef.current;
      const savedProgress = getVideoProgress(currentVideo.id);
      
      setIsVideoLoading(true);
      
      const params = new URLSearchParams({
        autoplay: isPlaying ? '1' : '0',
        enablejsapi: '1',
        rel: '0',
        modestbranding: '1',
        start: savedProgress.toString(),
        controls: '1',
        showinfo: '0',
        iv_load_policy: '3',
        mute: isMuted ? '1' : '0'
      });

      const videoUrl = `https://www.youtube.com/embed/${currentVideo.id}?${params.toString()}`;
      
      iframe.src = '';
      setTimeout(() => {
        iframe.src = videoUrl;
      }, 100);
    }
  }, [currentVideo, isPlaying, getVideoProgress, isMuted]);

  // Load related videos
  const loadRelatedVideos = useCallback(async (pageToken?: string) => {
    if (!currentVideo || loading) return;
    
    setLoading(true);
    try {
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
          publishedAt: item.snippet.publishedAt,
        }))
        .filter((video: Video) => video.id !== currentVideo.id);

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

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    // Note: Direct seeking in YouTube iframe is limited
    // In a real implementation, you'd use the YouTube Player API
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Hide player when not on home page or when minimized
  if (!showPlayer || !currentVideo || location.pathname !== '/' || isMinimized) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          {/* Video Player Section */}
          <div className="lg:w-2/3 xl:w-3/4 max-w-5xl">
            <div 
              ref={playerRef}
              className="aspect-video bg-black relative group"
              style={{ maxHeight: '500px' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowControls(false)}
            >
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="YouTube Video Player"
                onLoad={() => {
                  setIsVideoLoading(false);
                }}
                onError={() => {
                  setIsVideoLoading(false);
                }}
                style={{ 
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              
              {/* Loading indicator */}
              {isVideoLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">Loading video...</p>
                  </div>
                </div>
              )}

              {/* Video Controls Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Top Controls */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={minimizePlayer}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closePlayer}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={isPlaying ? pausePlayer : resumePlayer}
                    className="text-white hover:bg-white/20 h-16 w-16 rounded-full"
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <Slider
                      value={duration > 0 ? [(currentTime / duration) * 100] : [0]}
                      onValueChange={handleSeek}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={isPlaying ? pausePlayer : resumePlayer}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      
                      <div className="w-20">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Video Info Section */}
            <div className="p-4">
              <h1 className="text-xl font-semibold text-foreground mb-2">
                {currentVideo.title}
              </h1>
              
              {/* Video Stats and Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{currentVideo.viewCount ? formatViewCount(currentVideo.viewCount) : 'No views'}</span>
                  <span>•</span>
                  <span>{currentVideo.publishedAt ? formatDate(currentVideo.publishedAt) : 'Unknown date'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setLiked(!liked);
                      if (liked) setDisliked(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Like
                  </Button>
                  
                  <Button
                    variant={disliked ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setDisliked(!disliked);
                      if (disliked) setLiked(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Dislike
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    Save
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Channel Info */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${currentVideo.channelTitle}&background=random`} />
                  <AvatarFallback>{currentVideo.channelTitle?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{currentVideo.channelTitle}</h3>
                    <Badge variant="secondary">Subscribe</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">1.2M subscribers</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Description</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDescription(!showDescription)}
                    className="h-auto p-0 text-sm"
                  >
                    {showDescription ? 'Show less' : 'Show more'}
                  </Button>
                </div>
                <p className={`text-sm text-foreground ${showDescription ? '' : 'line-clamp-3'}`}>
                  {currentVideo.description || 'No description available for this video.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar for related videos */}
          <div className="lg:w-1/3 xl:w-1/4 border-l border-border bg-muted/30 p-4 max-h-[600px] overflow-y-auto hidden lg:block">
            <h3 className="font-medium text-foreground mb-3">Up next</h3>
            
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
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1">
                        {video.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {video.channelTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {video.publishedAt ? formatDate(video.publishedAt) : 'Unknown date'}
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
