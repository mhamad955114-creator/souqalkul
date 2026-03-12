import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ddb3d223b5b54708966b845064964fb6',
  appName: 'سوق الكل',
  webDir: 'dist',
  plugins: {
    SafeArea: {
       enabled: true,
       customColorsForSystemBars: true,
       statusBarColor: '#transparent',
       statusBarOverlay: true,
       navigationBarColor: '#transparent',
       navigationBarOverlay: true,
       offset: 0
    }
  }
};

export default config;

