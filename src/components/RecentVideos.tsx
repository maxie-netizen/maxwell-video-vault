import React, { useState, useEffect, useRef } from 'react';
import { useVideoHistory } from '@/contexts/VideoHistoryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Play, Clock, ChevronLeft, ChevronRight, Pause, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RecentVideos() {
  const { recentVideos, loading } = useVideoHistory();
  const { playVideo } = usePlayer();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (progress: number, duration?: number) => {
    if (!duration || duration === 0) return 0;
    return Math.min(100, (progress / duration) * 100);
  };

  // Auto-slideshow functionality
  useEffect(() => {
    if (recentVideos.length <= 1 || !isAutoPlaying || isSlideshowPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentVideos.length);
    }, 3000); // Change slide every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recentVideos.length, isAutoPlaying, isSlideshowPaused]);

  // Pause slideshow on hover
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setIsSlideshowPaused(true);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsSlideshowPaused(false);
  };

  const handlePlayVideo = (video: any, event: React.MouseEvent) => {
    event.stopPropagation();
    playVideo({
      id: video.video_id,
      title: video.video_title,
      thumbnail: video.video_thumbnail || '',
      channelTitle: video.channel_title || ''
    });
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + recentVideos.length) % recentVideos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recentVideos.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Recent Videos</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-40 h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recentVideos.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Recent Videos</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoPlay}
            className="text-xs"
          >
            {isAutoPlaying ? <Pause className="h-3 w-3 mr-1" /> : <PlayCircle className="h-3 w-3 mr-1" />}
            {isAutoPlaying ? 'Pause' : 'Play'} Slideshow
          </Button>
        </div>
      </div>

      {/* Main Slideshow Display */}
      <div className="relative mb-4">
        <div 
          ref={containerRef}
          className="relative h-48 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg overflow-hidden"
        >
          {recentVideos.map((video, index) => (
            <div
              key={video.id}
              className={cn(
                "absolute inset-0 transition-all duration-500 ease-in-out",
                index === currentIndex 
                  ? "opacity-100 scale-100 z-10" 
                  : "opacity-0 scale-95 z-0"
              )}
            >
              <div className="relative h-full">
                <img
                  src={video.video_thumbnail || '/placeholder.svg'}
                  alt={video.video_title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Video Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                    {video.video_title}
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">{video.channel_title}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(video.last_watched_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  {video.duration && video.watch_progress > 0 && (
                    <div className="mt-2 w-full h-1 bg-white/30 rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(video.watch_progress, video.duration)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-16 h-16 transition-all duration-300 hover:scale-110"
                    onClick={(e) => handlePlayVideo(video, e)}
                  >
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          {recentVideos.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0 z-20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0 z-20"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Slide Indicators */}
          {recentVideos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {recentVideos.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? "bg-white scale-125" 
                      : "bg-white/50 hover:bg-white/75"
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 thumbnail-scroll">
        {recentVideos.map((video, index) => (
          <Card
            key={video.id}
            className={cn(
              "flex-shrink-0 w-32 cursor-pointer smooth-transition group relative",
              index === currentIndex 
                ? "ring-2 ring-primary scale-105 shadow-lg animate-fade-in-scale" 
                : "hover:scale-105 hover:shadow-md",
              hoveredIndex === index && "scale-110 shadow-xl z-10 animate-bounce"
            )}
            onClick={() => setCurrentIndex(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative">
              <img
                src={video.video_thumbnail || '/placeholder.svg'}
                alt={video.video_title}
                className="w-full h-20 object-cover rounded-t-lg"
              />
              
              {/* Hover Overlay with Animation */}
              <div className={cn(
                "absolute inset-0 bg-black/50 smooth-transition rounded-t-lg flex items-center justify-center",
                hoveredIndex === index 
                  ? "opacity-100 scale-100 animate-fade-in-scale" 
                  : "opacity-0 scale-95"
              )}>
                <div className="transform smooth-transition hover:scale-110">
                  <Play className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Progress bar */}
              {video.duration && video.watch_progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                  <div 
                    className="h-full bg-primary smooth-transition"
                    style={{ width: `${getProgressPercentage(video.watch_progress, video.duration)}%` }}
                  />
                </div>
              )}
              
              {/* Duration badge */}
              {video.duration && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "absolute bottom-1 right-1 text-xs smooth-transition",
                    hoveredIndex === index && "scale-110"
                  )}
                >
                  {formatDuration(video.duration)}
                </Badge>
              )}

              {/* Current slide indicator */}
              {index === currentIndex && (
                <div className="absolute top-1 left-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            <div className="p-2">
              <p className="text-xs font-medium line-clamp-2 mb-1 group-hover:text-primary smooth-transition">
                {video.video_title}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(video.last_watched_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Hover Popup Effect */}
            {hoveredIndex === index && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 animate-in fade-in-0 zoom-in-95 duration-200">
                {video.video_title}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}