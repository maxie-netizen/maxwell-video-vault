import { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const useYouTubePlayer = (videoId: string | null, isPlaying: boolean) => {
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const { updateCurrentTime, updateDuration, setBuffering } = usePlayer();

  const initializePlayer = useCallback(() => {
    if (!videoId || !iframeRef.current || playerRef.current) return;

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
      },
      events: {
        onReady: (event: any) => {
          console.log('YouTube player ready');
          const duration = event.target.getDuration();
          updateDuration(duration);
        },
        onStateChange: (event: any) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setBuffering(false);
          } else if (state === window.YT.PlayerState.BUFFERING) {
            setBuffering(true);
          } else if (state === window.YT.PlayerState.PAUSED) {
            setBuffering(false);
          } else if (state === window.YT.PlayerState.ENDED) {
            setBuffering(false);
          }
        },
        onError: (event: any) => {
          console.error('YouTube player error:', event.data);
          setBuffering(false);
        }
      }
    });
  }, [videoId, isPlaying, updateDuration, setBuffering]);

  const loadYouTubeAPI = useCallback(() => {
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, [initializePlayer]);

  useEffect(() => {
    loadYouTubeAPI();
  }, [loadYouTubeAPI]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current) return;

    const interval = setInterval(() => {
      try {
        const currentTime = playerRef.current.getCurrentTime();
        updateCurrentTime(currentTime);
      } catch (error) {
        console.error('Error getting current time:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateCurrentTime]);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    if (playerRef.current) {
      return playerRef.current.getCurrentTime();
    }
    return 0;
  }, []);

  const getDuration = useCallback(() => {
    if (playerRef.current) {
      return playerRef.current.getDuration();
    }
    return 0;
  }, []);

  return {
    iframeRef,
    seekTo,
    getCurrentTime,
    getDuration,
    player: playerRef.current
  };
};
