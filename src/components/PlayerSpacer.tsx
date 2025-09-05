import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

export default function PlayerSpacer() {
  const { playerState } = usePlayer();
  const { showPlayer, isMinimized } = playerState;

  // Only show spacer when player is active and not minimized
  if (!showPlayer || isMinimized) return null;

  return <div className="h-[400px] md:h-[500px] lg:h-[600px]" />;
}