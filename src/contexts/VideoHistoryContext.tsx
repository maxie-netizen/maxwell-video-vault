import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VideoHistoryItem {
  id: string;
  video_id: string;
  video_title: string;
  video_thumbnail?: string;
  channel_title?: string;
  duration?: number;
  watch_progress: number;
  last_watched_at: string;
}

interface VideoHistoryContextType {
  recentVideos: VideoHistoryItem[];
  updateVideoProgress: (videoId: string, title: string, thumbnail?: string, channelTitle?: string, progress?: number, duration?: number) => Promise<void>;
  getVideoProgress: (videoId: string) => number;
  loading: boolean;
}

const VideoHistoryContext = createContext<VideoHistoryContextType | null>(null);

export function VideoHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth() || {};
  const [recentVideos, setRecentVideos] = useState<VideoHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recent videos when user changes
  useEffect(() => {
    if (user) {
      loadRecentVideos();
    } else {
      setRecentVideos([]);
      setLoading(false);
    }
  }, [user]);

  const loadRecentVideos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('video_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentVideos(data || []);
    } catch (error) {
      console.error('Error loading recent videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVideoProgress = async (
    videoId: string, 
    title: string, 
    thumbnail?: string, 
    channelTitle?: string, 
    progress: number = 0, 
    duration?: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('video_history')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          video_title: title,
          video_thumbnail: thumbnail,
          channel_title: channelTitle,
          duration,
          watch_progress: progress,
          last_watched_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,video_id',
          ignoreDuplicates: false
        });

      if (error) throw error;
      
      // Refresh recent videos
      await loadRecentVideos();
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const getVideoProgress = (videoId: string): number => {
    const video = recentVideos.find(v => v.video_id === videoId);
    return video?.watch_progress || 0;
  };

  return (
    <VideoHistoryContext.Provider value={{
      recentVideos,
      updateVideoProgress,
      getVideoProgress,
      loading
    }}>
      {children}
    </VideoHistoryContext.Provider>
  );
}

export function useVideoHistory() {
  const context = useContext(VideoHistoryContext);
  if (!context) {
    throw new Error('useVideoHistory must be used within a VideoHistoryProvider');
  }
  return context;
}