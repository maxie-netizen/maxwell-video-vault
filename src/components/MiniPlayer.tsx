import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  X, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Move,
  ChevronUp, 
  ChevronDown,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '@/contexts/PlayerContext';
import { useDraggable } from '@/hooks/useDraggable';
import { useAuth } from '@/hooks/useAuth';
import { useVideoHistory } from '@/contexts/VideoHistoryContext';
import { useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
}

export default function MiniPlayer() {
  const { 
    playerState, 
    closePlayer, 
    maximizePlayer, 
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { position, elementRef, startDrag, isDragging } = useDraggable({
    initialPosition: { 
      x: window.innerWidth - 380 - 16, 
      y: window.innerHeight - 280 - 16 
    },
    bounds: {
      left: 16,
      top: 16,
      right: window.innerWidth - 16,
      bottom: window.innerHeight - 16
    }
  });

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
        setVideoProgress(currentTime);
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
    if (iframeRef.current && currentVideo && isMinimized) {
      const iframe = iframeRef.current;
      const savedProgress = getVideoProgress(currentVideo.id);
      
      const params = new URLSearchParams({
        autoplay: '1',
        enablejsapi: '1',
        rel: '0',
        modestbranding: '1',
        start: Math.floor(savedProgress).toString(),
        controls: '1',
        showinfo: '0',
        iv_load_policy: '3',
<<<<<<< HEAD
        mute: isMuted ? '1' : '0'
=======
        origin: window.location.origin,
        mute: '0'
>>>>>>> 8eaf53f82631743e50128b6c64223925c7a01fe8
      });

      // Clear src first to prevent multiple players
      iframe.src = '';
      
      const timer = setTimeout(() => {
        iframe.src = `https://www.youtube.com/embed/${currentVideo.id}?${params.toString()}`;
      }, 50);
      
      return () => clearTimeout(timer);
    }
<<<<<<< HEAD
  }, [currentVideo, isPlaying, getVideoProgress, isMuted]);
=======
  }, [currentVideo, isMinimized, getVideoProgress]);
>>>>>>> 8eaf53f82631743e50128b6c64223925c7a01fe8

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    // Note: Direct seeking in YouTube iframe is limited
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoClick = (video: Video) => {
    playVideo(video);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Only show mini player when on home page, player is active, minimized, and video exists
  if (!showPlayer || !currentVideo || !isMinimized || location.pathname !== '/' || !currentVideo.id) return null;

  return (
    <div 
      ref={elementRef}
<<<<<<< HEAD
      className={`fixed z-50 bg-card border border-border rounded-lg shadow-lg transition-all duration-300 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${
        isExpanded ? 'w-96 h-[600px]' : 'w-80 h-auto'
=======
      className={`fixed z-40 bg-card border border-border rounded-lg shadow-lg transition-all duration-300 ${
        isMobile ? 'w-80 max-w-[90vw]' : 'w-96 max-w-[90vw]'
      } ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} ${
        isExpanded ? 'h-[600px]' : 'h-auto'
>>>>>>> 8eaf53f82631743e50128b6c64223925c7a01fe8
      }`}
      style={{ 
        left: position.x, 
        top: position.y, 
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: isDragging ? 'none' : 'auto',
        pointerEvents: 'auto'
      }}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      <div className="aspect-video bg-black rounded-t-lg overflow-hidden relative group">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          title="YouTube Mini Player"
          onLoad={() => setBuffering(false)}
          onError={() => setBuffering(false)}
        />
        
        {/* Progress Bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        )}
        
        {/* Controls Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={isPlaying ? pausePlayer : resumePlayer}
              className="text-white hover:bg-white/20 h-12 w-12 rounded-full"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isPlaying ? pausePlayer : resumePlayer}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <div className="w-16">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={maximizePlayer}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePlayer}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      {/* Video Info and Controls */}
      <div className="p-3 bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate text-sm mb-1">
              {currentVideo.title}
            </p>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${currentVideo.channelTitle}&background=random`} />
                <AvatarFallback className="text-xs">{currentVideo.channelTitle?.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground truncate">
                {currentVideo.channelTitle}
              </p>
            </div>
          </div>
        </div>
        
        {/* Time Display */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Drag indicator and expand button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Move className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Drag to move</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-6 w-6"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      
      {/* Expandable Content - Related Videos */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20">
          <div className="p-3">
            <h4 className="text-sm font-medium text-foreground mb-3">Up next</h4>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {relatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex gap-2 cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors group"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative w-20 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-12 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-medium text-foreground line-clamp-2 leading-tight mb-1">
                        {video.title}
                      </h5>
                      <p className="text-xs text-muted-foreground truncate">
                        {video.channelTitle}
                      </p>
                    </div>
                  </div>
                ))}
                
                {relatedVideos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No related videos available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
