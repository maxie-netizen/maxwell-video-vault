import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface NetworkStatus {
  isOnline: boolean;
  ping: number | null;
  isConnecting: boolean;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    ping: null,
    isConnecting: false,
    quality: 'excellent'
  });

  const measurePing = useCallback(async () => {
    if (!navigator.onLine) {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        ping: null,
        quality: 'offline'
      }));
      return;
    }

    setNetworkStatus(prev => ({ ...prev, isConnecting: true }));
    
    try {
      const start = performance.now();
      
      // Use Google's reliable endpoint for ping testing
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      const end = performance.now();
      const pingTime = Math.round(end - start);
      
      let quality: NetworkStatus['quality'] = 'excellent';
      if (pingTime > 1000) quality = 'poor';
      else if (pingTime > 500) quality = 'good';
      
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        ping: pingTime,
        quality,
        isConnecting: false
      }));

      // Show toast for poor connection
      if (quality === 'poor') {
        toast({
          title: "Poor Internet Connection",
          description: `High latency detected (${pingTime}ms). Consider switching to offline mode.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        ping: null,
        quality: 'offline',
        isConnecting: false
      }));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      measurePing();
      toast({
        title: "Connection Restored",
        description: "You're back online!",
        variant: "default"
      });
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        ping: null,
        quality: 'offline'
      }));
      toast({
        title: "Connection Lost",
        description: "You're now offline. Redirecting to downloads...",
        variant: "destructive"
      });
      
      // Redirect to downloads page after 2 seconds
      setTimeout(() => {
        window.location.href = '/downloads';
      }, 2000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial ping measurement
    measurePing();

    // Set up periodic ping monitoring (every 30 seconds)
    const interval = setInterval(measurePing, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [measurePing]);

  return { networkStatus, measurePing };
}
