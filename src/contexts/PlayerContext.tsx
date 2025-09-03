import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  });

  const playVideo = (video: Video) => {
    setPlayerState({
      isPlaying: true,
      currentVideo: video,
      isMinimized: false,
      showPlayer: true,
    });
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
    });
  };

  const handleVideoEnd = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
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