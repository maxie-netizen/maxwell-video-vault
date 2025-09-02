import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8bbeb264f2434c87a15f3776861adcd5',
  appName: 'MAXIE DWNLDER',
  webDir: 'dist',
  server: {
    url: 'https://8bbeb264-f243-4c87-a15f-3776861adcd5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;