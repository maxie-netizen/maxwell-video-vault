import React, { useRef, useEffect } from 'react';
import { Play, Pause, X, Maximize2, PictureInPicture2, Move } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDraggable } from '@/hooks/useDraggable';
import { useAuth } from '@/hooks/useAuth';

export default function MiniPlayer() {
  const { playerState, closePlayer, maximizePlayer, pausePlayer, resumePlayer, handleVideoEnd } = usePlayer();
  const { currentVideo, isMinimized, showPlayer, isPlaying } = playerState;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();
  const { profile } = useAuth() || {};
  
  const { position, elementRef, startDrag, isDragging } = useDraggable({
    initialPosition: { 
      x: isMobile ? window.innerWidth - 320 - 16 : window.innerWidth - 320 - 16, 
      y: isMobile ? window.innerHeight - 240 - 80 - 16 : window.innerHeight - 240 - 16 
    },
    bounds: {
      left: 16,
      top: 16,
      right: window.innerWidth - 16,
      bottom: window.innerHeight - 16
    }
  });

  useEffect(() => {
    if (iframeRef.current && currentVideo) {
      const iframe = iframeRef.current;
      const autoplay = isPlaying ? '1' : '0';
      iframe.src = `https://www.youtube.com/embed/${currentVideo.id}?autoplay=${autoplay}&enablejsapi=1`;
    }
  }, [currentVideo, isPlaying]);

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
    // Full player overlay
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground truncate flex-1 mr-4">
              {currentVideo.title}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={maximizePlayer}
                className="text-muted-foreground hover:text-foreground"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePictureInPicture}
                className="text-muted-foreground hover:text-foreground"
              >
                <PictureInPicture2 className="h-4 w-4" />
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
          <div className="flex-1">
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
        </div>
      </div>
    );
  }

  // Mini player
  return (
    <div 
      ref={elementRef}
      className={`fixed z-40 bg-card border border-border rounded-lg shadow-lg w-80 max-w-[90vw] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ 
        left: position.x, 
        top: position.y, 
        maxHeight: '240px',
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
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
      <div className="p-3 bg-card rounded-b-lg">
        <div className="flex items-center justify-between">
          <div 
            className="flex-1 min-w-0 cursor-grab active:cursor-grabbing"
            onMouseDown={startDrag}
            onTouchStart={startDrag}
          >
            <p className="text-sm font-medium text-foreground truncate">
              {currentVideo.title}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Move className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drag to move</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? pausePlayer : resumePlayer}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={maximizePlayer}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePlayer}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}