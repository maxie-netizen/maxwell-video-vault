import React from 'react';
import { useVideoHistory } from '@/contexts/VideoHistoryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Play, Clock } from 'lucide-react';

export default function RecentVideos() {
  const { recentVideos, loading } = useVideoHistory();
  const { playVideo } = usePlayer();

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
      <h3 className="text-lg font-semibold mb-3">Recent Videos</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentVideos.map((video) => (
          <Card
            key={video.id}
            className="flex-shrink-0 w-40 cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => playVideo({
              id: video.video_id,
              title: video.video_title,
              thumbnail: video.video_thumbnail || '',
              channelTitle: video.channel_title || ''
            })}
          >
            <div className="relative">
              <img
                src={video.video_thumbnail || '/placeholder.svg'}
                alt={video.video_title}
                className="w-full h-24 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              
              {/* Progress bar */}
              {video.duration && video.watch_progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${getProgressPercentage(video.watch_progress, video.duration)}%` }}
                  />
                </div>
              )}
              
              {/* Duration badge */}
              {video.duration && (
                <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">
                  {formatDuration(video.duration)}
                </Badge>
              )}
            </div>
            
            <div className="p-2">
              <p className="text-xs font-medium line-clamp-2 mb-1">{video.video_title}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(video.last_watched_at), { addSuffix: true })}</span>
              </div>
              {video.channel_title && (
                <p className="text-xs text-muted-foreground truncate mt-1">{video.channel_title}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}