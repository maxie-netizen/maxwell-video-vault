import React, { useState, useEffect } from 'react';
import { searchYouTube } from '@/lib/youtubeApi';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RelatedVideosProps {
  currentVideoTitle: string;
}

export default function RelatedVideos({ currentVideoTitle }: RelatedVideosProps) {
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { playVideo, playerState } = usePlayer();

  useEffect(() => {
    // Use related videos from PlayerContext if available
    if (playerState.relatedVideos.length > 0) {
      setRelatedVideos(playerState.relatedVideos.map(video => ({
        id: { videoId: video.id },
        snippet: {
          title: video.title,
          channelTitle: video.channelTitle,
          thumbnails: {
            medium: { url: video.thumbnail },
            high: { url: video.thumbnail }
          }
        }
      })));
      return;
    }

    const fetchRelatedVideos = async () => {
      if (!currentVideoTitle) return;
      
      setLoading(true);
      try {
        // Extract key terms from title for related search
        const searchTerms = currentVideoTitle
          .replace(/[^\w\s]/gi, '')
          .split(' ')
          .filter(word => word.length > 3)
          .slice(0, 3)
          .join(' ');
        
        const response = await searchYouTube(searchTerms);
        setRelatedVideos(response.items.slice(0, 10)); // Show first 10 related videos
      } catch (error) {
        console.error('Failed to fetch related videos:', error);
        setRelatedVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedVideos();
  }, [currentVideoTitle, playerState.relatedVideos]);

  const handleVideoClick = (video: any) => {
    playVideo({
      id: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-2 animate-pulse">
            <div className="w-32 h-18 bg-muted rounded"></div>
            <div className="flex-1">
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {relatedVideos.map((video) => (
        <div
          key={video.id.videoId}
          className="flex gap-2 cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors group"
          onClick={() => handleVideoClick(video)}
        >
          <div className="relative w-32 flex-shrink-0">
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className="w-full h-18 object-cover rounded"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
              {video.snippet.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {video.snippet.channelTitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}