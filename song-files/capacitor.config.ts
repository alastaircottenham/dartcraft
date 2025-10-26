import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourorg.songfiles',
  appName: 'Song Files',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Filesystem: {
      iosIsDocumentPickerEnabled: true
    },
    FilePicker: {
      iosIsDocumentPickerEnabled: true
    }
  }
};

export default config;
