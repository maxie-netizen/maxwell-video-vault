import React, { createContext, useContext, useState, ReactNode } from 'react';
import { searchYouTube } from '@/lib/youtubeApi';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentVideo: Video | null;
  isMinimized: boolean;
  showPlayer: boolean;
  relatedVideos: Video[];
}

interface PlayerContextType {
  playerState: PlayerState;
  playVideo: (video: Video) => void;
  minimizePlayer: () => void;
  maximizePlayer: () => void;
  closePlayer: () => void;
  pausePlayer: () => void;
  resumePlayer: () => void;
  handleVideoEnd: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentVideo: null,
    isMinimized: false,
    showPlayer: false,
    relatedVideos: [],
  });

  const playVideo = async (video: Video) => {
    setPlayerState({
      isPlaying: true,
      currentVideo: video,
      isMinimized: false,
      showPlayer: true,
      relatedVideos: [],
    });

    // Fetch related videos for auto-play
    try {
      const searchTerms = video.title
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(' ');
      
      const response = await searchYouTube(searchTerms);
      const relatedVideos = response.items
        .slice(0, 10)
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
        }))
        .filter((relatedVideo: Video) => relatedVideo.id !== video.id); // Don't include current video

      setPlayerState(prev => ({ ...prev, relatedVideos }));
    } catch (error) {
      console.error('Failed to fetch related videos:', error);
    }
  };

  const minimizePlayer = () => {
    setPlayerState(prev => ({ ...prev, isMinimized: true }));
  };

  const maximizePlayer = () => {
    setPlayerState(prev => ({ ...prev, isMinimized: false }));
  };

  const closePlayer = () => {
    setPlayerState({
      isPlaying: false,
      currentVideo: null,
      isMinimized: false,
      showPlayer: false,
      relatedVideos: [],
    });
  };

  const handleVideoEnd = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    
    // Auto-play next video if available
    setTimeout(() => {
      const nextVideo = playerState.relatedVideos[0];
      if (nextVideo) {
        playVideo(nextVideo);
      }
    }, 1000); // Wait 1 second before auto-playing next video
  };

  const pausePlayer = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumePlayer = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
  };

  return (
    <PlayerContext.Provider
      value={{
        playerState,
        playVideo,
        minimizePlayer,
        maximizePlayer,
        closePlayer,
        pausePlayer,
        resumePlayer,
        handleVideoEnd,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};