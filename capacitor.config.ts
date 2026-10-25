import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gulfjobs.app',
  appName: 'وظائف الخليج',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
