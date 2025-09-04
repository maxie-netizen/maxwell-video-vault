import React from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

export default function PlayerSpacer() {
  const { playerState } = usePlayer();
  const { showPlayer, isMinimized } = playerState;

  // Only show spacer when player is active and not minimized
  if (!showPlayer || isMinimized) return null;

  return <div className="h-[250px] md:h-[350px] lg:h-[400px]" />;
}