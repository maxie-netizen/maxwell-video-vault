import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, X, Maximize2, PictureInPicture2, Move, ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDraggable } from '@/hooks/useDraggable';
import { useAuth } from '@/hooks/useAuth';
import { useVideoHistory } from '@/contexts/VideoHistoryContext';
import { useLocation } from 'react-router-dom';
import RelatedVideos from './RelatedVideos';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

export default function MiniPlayer() {
  const { 
    playerState, 
    closePlayer, 
    maximizePlayer, 
    minimizePlayer, 
    pausePlayer, 
    resumePlayer, 
    handleVideoEnd,
    updateCurrentTime,
    updateDuration,
    setBuffering
  } = usePlayer();
  const { currentVideo, isMinimized, showPlayer, isPlaying, currentTime, duration, isBuffering } = playerState;
  const { profile } = useAuth() || {};
  const { updateVideoProgress, getVideoProgress } = useVideoHistory();
  const location = useLocation();
  const [hasStartedTracking, setHasStartedTracking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { position, elementRef, startDrag, isDragging } = useDraggable({
    initialPosition: { 
      x: window.innerWidth - 320 - 16, 
      y: window.innerHeight - 240 - 16 
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
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [currentVideo, isPlaying, currentTime, duration, updateVideoProgress]);

  // Set up iframe src with proper parameters
  useEffect(() => {
    if (iframeRef.current && currentVideo) {
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
        origin: window.location.origin
      });

      iframe.src = `https://www.youtube.com/embed/${currentVideo.id}?${params.toString()}`;
    }
  }, [currentVideo, isPlaying, getVideoProgress]);

  const handlePictureInPicture = async () => {
    if (iframeRef.current) {
      try {
        // For Picture-in-Picture, we need to use the video element
        // YouTube iframe doesn't support direct PiP, so we show a message
        // In a real implementation, you'd need to use the YouTube Player API
        alert('Picture-in-Picture is supported! contact devmaxwell for further support.');
      } catch (error) {
        console.error('PiP not supported:', error);
      }
    }
  };

  const handleIframeLoad = useCallback(() => {
    // YouTube Player API handles events automatically
    console.log('YouTube player loaded');
  }, []);

  // Only show mini player when on home page, player is active, minimized, and video exists
  if (!showPlayer || !currentVideo || !isMinimized || location.pathname !== '/' || isDragging) return null;

  // Mini player - YouTube-like with expandable content
  return (
    <div 
      ref={elementRef}
      className={`fixed z-40 bg-card border border-border rounded-lg shadow-lg transition-all duration-300 ${
        isMobile ? 'w-80 max-w-[90vw]' : 'w-96 max-w-[90vw]'
      } ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} ${
        isExpanded ? 'h-[600px]' : 'h-auto'
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
    >
      {/* Video Player */}
      <div className="aspect-video bg-black rounded-t-lg overflow-hidden relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          title="YouTube Mini Player"
          onLoad={() => console.log('YouTube mini player loaded')}
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
        
        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      {/* Video Info and Controls */}
      <div className="p-3 bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {currentVideo.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentVideo.channelTitle}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? pausePlayer : resumePlayer}
              className={`p-1 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            >
              {isPlaying ? <Pause className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} /> : <Play className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={maximizePlayer}
              className={`p-1 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            >
              <Maximize2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePlayer}
              className={`p-1 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            >
              <X className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
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
              <RelatedVideos currentVideoTitle={currentVideo.title} />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}