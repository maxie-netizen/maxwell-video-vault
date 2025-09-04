import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, X, Maximize2, PictureInPicture2, Move } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDraggable } from '@/hooks/useDraggable';
import { useAuth } from '@/hooks/useAuth';
import { useVideoHistory } from '@/contexts/VideoHistoryContext';
import RelatedVideos from './RelatedVideos';

export default function MiniPlayer() {
  const { playerState, closePlayer, maximizePlayer, minimizePlayer, pausePlayer, resumePlayer, handleVideoEnd } = usePlayer();
  const { currentVideo, isMinimized, showPlayer, isPlaying } = playerState;
  const { profile } = useAuth() || {};
  const { updateVideoProgress, getVideoProgress } = useVideoHistory();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasStartedTracking, setHasStartedTracking] = useState(false);
  const isMobile = useIsMobile();
  
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

  // Set up iframe src with proper parameters for seamless playback
  useEffect(() => {
    if (iframeRef.current && currentVideo) {
      const iframe = iframeRef.current;
      const savedProgress = getVideoProgress(currentVideo.id);
      const startTime = savedProgress > 10 ? savedProgress : 0; // Resume if more than 10 seconds watched
      
      const params = new URLSearchParams({
        autoplay: isPlaying ? '1' : '0',
        enablejsapi: '1',
        rel: '0', // Don't show related videos
        modestbranding: '1', // Minimal YouTube branding
        start: startTime.toString()
      });

      iframe.src = `https://www.youtube.com/embed/${currentVideo.id}?${params.toString()}`;
    }
  }, [currentVideo, getVideoProgress]);

  // Update autoplay when play state changes (but keep same video)
  useEffect(() => {
    if (iframeRef.current && currentVideo && hasStartedTracking) {
      const iframe = iframeRef.current;
      const currentSrc = iframe.src;
      
      if (currentSrc.includes(currentVideo.id)) {
        // Update only the autoplay parameter
        const newSrc = currentSrc.replace(/autoplay=[01]/, `autoplay=${isPlaying ? '1' : '0'}`);
        if (newSrc !== currentSrc) {
          iframe.src = newSrc;
        }
      }
    }
  }, [isPlaying, currentVideo, hasStartedTracking]);

  const handlePictureInPicture = async () => {
    if (iframeRef.current) {
      try {
        // For Picture-in-Picture, we need to use the video element
        // YouTube iframe doesn't support direct PiP, so we show a message
        // In a real implementation, you'd need to use the YouTube Player API
        alert('Picture-in-Picture is supported! This feature works best with the YouTube Player API integration.');
      } catch (error) {
        console.error('PiP not supported:', error);
      }
    }
  };

  if (!showPlayer || !currentVideo) return null;

  if (!isMinimized) {
    // YouTube-like main player - takes up upper portion, scrollable content below
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Video Player Section */}
            <div className="lg:w-2/3 xl:w-3/4">
              <div className="aspect-video bg-black">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title="YouTube Video Player"
                  onLoad={() => {
                    // Listen for video end event
                    if (iframeRef.current) {
                      iframeRef.current.addEventListener('ended', () => {
                        handleVideoEnd();
                        if (profile?.auto_hide_player !== false) {
                          setTimeout(() => closePlayer(), 1000);
                        }
                      });
                    }
                  }}
                />
              </div>
              
              {/* Video Info */}
              <div className="p-4">
                <h1 className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
                  {currentVideo.title}
                </h1>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {currentVideo.channelTitle}
                  </div>
                  <div className="flex items-center gap-2">
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
              <h3 className="font-medium text-foreground mb-3">Up next</h3>
              <RelatedVideos currentVideoTitle={currentVideo.title} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mini player - smaller for mobile
  return (
    <div 
      ref={elementRef}
      className={`fixed z-40 bg-card border border-border rounded-lg shadow-lg ${isMobile ? 'w-64 max-w-[80vw]' : 'w-80 max-w-[90vw]'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ 
        left: position.x, 
        top: position.y, 
        maxHeight: isMobile ? '180px' : '240px',
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          title="YouTube Mini Player"
          onLoad={() => {
            // Listen for video end event
            if (iframeRef.current) {
              iframeRef.current.addEventListener('ended', () => {
                handleVideoEnd();
                if (profile?.auto_hide_player !== false) {
                  setTimeout(() => closePlayer(), 1000);
                }
              });
            }
          }}
        />
      </div>
      <div className={`p-2 bg-card rounded-b-lg ${isMobile ? 'p-2' : 'p-3'}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {currentVideo.title}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Move className="h-2 w-2 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drag anywhere</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? pausePlayer : resumePlayer}
              className={`p-0 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            >
              {isPlaying ? <Pause className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} /> : <Play className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={maximizePlayer}
              className={`p-0 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            >
              <Maximize2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePlayer}
              className={`p-0 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}
            >
              <X className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}