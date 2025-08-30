import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

export default function NetworkStatus() {
  const { networkStatus } = useNetworkStatus();
  const { isOnline, ping, isConnecting, quality } = networkStatus;

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      case 'offline': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getQualityBgColor = () => {
    switch (quality) {
      case 'excellent': return 'bg-green-500/10 border-green-500/20';
      case 'good': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'poor': return 'bg-red-500/10 border-red-500/20';
      case 'offline': return 'bg-muted/50 border-border';
      default: return 'bg-muted/50 border-border';
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium transition-colors",
      getQualityBgColor()
    )}>
      {isConnecting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isOnline ? (
        <Wifi className={cn("h-3 w-3", getQualityColor())} />
      ) : (
        <WifiOff className="h-3 w-3 text-muted-foreground" />
      )}
      
      <span className={getQualityColor()}>
        {isConnecting 
          ? 'Testing...' 
          : isOnline 
            ? `${ping || '--'}ms`
            : 'Offline'
        }
      </span>
    </div>
  );
}