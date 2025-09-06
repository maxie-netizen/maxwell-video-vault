import { useEffect, useRef, useCallback, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface YouTubePlayerHook {
  iframeRef: React.RefObject<HTMLDivElement>;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  player: any;
  isReady: boolean;
  error: string | null;
}

export const useYouTubePlayer = (videoId: string | null, isPlaying: boolean): YouTubePlayerHook => {
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateCurrentTime, updateDuration, setBuffering, handleVideoEnd } = usePlayer();

  const initializePlayer = useCallback(() => {
    if (!videoId || !iframeRef.current || playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          fs: 1,
          cc_load_policy: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            setIsReady(true);
            setError(null);
            try {
              const duration = event.target.getDuration();
              updateDuration(duration);
            } catch (err) {
              console.error('Error getting duration:', err);
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            console.log('Player state changed:', state);
            
            switch (state) {
              case window.YT.PlayerState.PLAYING:
                setBuffering(false);
                break;
              case window.YT.PlayerState.PAUSED:
                setBuffering(false);
                break;
              case window.YT.PlayerState.BUFFERING:
                setBuffering(true);
                break;
              case window.YT.PlayerState.ENDED:
                setBuffering(false);
                handleVideoEnd();
                break;
              case window.YT.PlayerState.CUED:
                setBuffering(false);
                break;
              default:
                setBuffering(false);
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            setError(`Player error: ${event.data}`);
            setBuffering(false);
            setIsReady(false);
          },
          onPlaybackQualityChange: (event: any) => {
            console.log('Playback quality changed:', event.data);
          },
          onPlaybackRateChange: (event: any) => {
            console.log('Playback rate changed:', event.data);
          }
        }
      });
    } catch (err) {
      console.error('Error initializing YouTube player:', err);
      setError('Failed to initialize player');
      setIsReady(false);
    }
  }, [videoId, isPlaying, updateDuration, setBuffering, handleVideoEnd]);

  const loadYouTubeAPI = useCallback(() => {
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API loaded');
        initializePlayer();
      };

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, [initializePlayer]);

  useEffect(() => {
    loadYouTubeAPI();
  }, [loadYouTubeAPI]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (err) {
      console.error('Error controlling playback:', err);
    }
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    const interval = setInterval(() => {
      try {
        const currentTime = playerRef.current.getCurrentTime();
        updateCurrentTime(currentTime);
      } catch (error) {
        console.error('Error getting current time:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateCurrentTime, isReady]);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current && isReady) {
      try {
        playerRef.current.seekTo(time, true);
      } catch (err) {
        console.error('Error seeking:', err);
      }
    }
  }, [isReady]);

  const getCurrentTime = useCallback(() => {
    if (playerRef.current && isReady) {
      try {
        return playerRef.current.getCurrentTime();
      } catch (err) {
        console.error('Error getting current time:', err);
        return 0;
      }
    }
    return 0;
  }, [isReady]);

  const getDuration = useCallback(() => {
    if (playerRef.current && isReady) {
      try {
        return playerRef.current.getDuration();
      } catch (err) {
        console.error('Error getting duration:', err);
        return 0;
      }
    }
    return 0;
  }, [isReady]);

  const setVolume = useCallback((volume: number) => {
    if (playerRef.current && isReady) {
      try {
        playerRef.current.setVolume(volume);
      } catch (err) {
        console.error('Error setting volume:', err);
      }
    }
  }, [isReady]);

  const mute = useCallback(() => {
    if (playerRef.current && isReady) {
      try {
        playerRef.current.mute();
      } catch (err) {
        console.error('Error muting:', err);
      }
    }
  }, [isReady]);

  const unMute = useCallback(() => {
    if (playerRef.current && isReady) {
      try {
        playerRef.current.unMute();
      } catch (err) {
        console.error('Error unmuting:', err);
      }
    }
  }, [isReady]);

  const isMuted = useCallback(() => {
    if (playerRef.current && isReady) {
      try {
        return playerRef.current.isMuted();
      } catch (err) {
        console.error('Error checking mute status:', err);
        return false;
      }
    }
    return false;
  }, [isReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying player:', err);
        }
      }
    };
  }, []);

  return {
    iframeRef,
    seekTo,
    getCurrentTime,
    getDuration,
    setVolume,
    mute,
    unMute,
    isMuted,
    player: playerRef.current,
    isReady,
    error
  };
};
