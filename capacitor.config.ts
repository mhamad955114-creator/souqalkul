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
    },
    // Capgo OTA updates — downloads new web bundles silently and notifies
    // the app via the `updateAvailable` event. autoUpdate uses Capgo's
    // managed cloud (https://capgo.app) by default.
    CapacitorUpdater: {
      autoUpdate: true,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      // Default release channel. You can override per-build in Capgo dashboard.
      defaultChannel: 'production',
      // Show a small overlay during the very first download (optional).
      directUpdate: false,
      // Reset to the bundled APK version when the user reinstalls.
      resetWhenUpdate: true,
    },
  },
};

export default config;
