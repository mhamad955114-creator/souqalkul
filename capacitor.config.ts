import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.souqalkul',
  appName: 'سوق الكل',
  webDir: 'dist',
  plugins: {
    SafeArea: {
       enabled: true,
       customColorsForSystemBars: true,
       statusBarColor: '#00000000',
       statusBarOverlay: true,
       navigationBarColor: '#00000000',
       navigationBarOverlay: true,
       offset: 0
    }
  }
};

export default config;

