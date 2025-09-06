import React, { createContext, useContext, useState, ReactNode } from 'react';
import { searchYouTube } from '@/lib/youtubeApi';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: string;
  description?: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentVideo: Video | null;
  isMinimized: boolean;
  showPlayer: boolean;
  relatedVideos: Video[];
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  quality: string;
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
  updateCurrentTime: (time: number) => void;
  updateDuration: (duration: number) => void;
  setBuffering: (buffering: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: string) => void;
  seekTo: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentVideo: null,
    isMinimized: false,
    showPlayer: false,
    relatedVideos: [],
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    volume: 100,
    isMuted: false,
    playbackRate: 1,
    quality: 'auto',
  });

  const playVideo = async (video: Video) => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: true,
      currentVideo: video,
      isMinimized: false,
      showPlayer: true,
      currentTime: 0,
      duration: 0,
      isBuffering: true,
    }));

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
        ? response.items
            .slice(0, 10)
            .map((item: any) => ({
              id: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.high.url,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
            }))
            .filter((relatedVideo: Video) => relatedVideo.id !== video.id)
        : [];

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
      currentTime: 0,
      duration: 0,
      isBuffering: false,
      volume: 100,
      isMuted: false,
      playbackRate: 1,
      quality: 'auto',
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

  const updateCurrentTime = (time: number) => {
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  };

  const updateDuration = (duration: number) => {
    setPlayerState(prev => ({ ...prev, duration }));
  };

  const setBuffering = (buffering: boolean) => {
    setPlayerState(prev => ({ ...prev, isBuffering: buffering }));
  };

  const setVolume = (volume: number) => {
    setPlayerState(prev => ({ ...prev, volume }));
  };

  const setMuted = (isMuted: boolean) => {
    setPlayerState(prev => ({ ...prev, isMuted }));
  };

  const setPlaybackRate = (playbackRate: number) => {
    setPlayerState(prev => ({ ...prev, playbackRate }));
  };

  const setQuality = (quality: string) => {
    setPlayerState(prev => ({ ...prev, quality }));
  };

  const seekTo = (time: number) => {
    setPlayerState(prev => ({ ...prev, currentTime: time }));
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
        updateCurrentTime,
        updateDuration,
        setBuffering,
        setVolume,
        setMuted,
        setPlaybackRate,
        setQuality,
        seekTo,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
