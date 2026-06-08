import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';

// Base URL handling for different environments
let API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  API_URL = 'http://192.168.0.247:8080/api'; // Default fallback

  if (Platform.OS === 'android') {
    API_URL = 'http://10.0.2.2:8080/api'; // Default for Android Emulator
  }

  // Extract IP from React Native's SourceCode scriptURL or Expo Constants
  let debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (!debuggerHost && NativeModules.SourceCode?.scriptURL) {
    const scriptURL = NativeModules.SourceCode.scriptURL;
    const match = scriptURL.match(/^https?:\/\/([^:]+)/);
    if (match) {
      debuggerHost = match[1];
    }
  }

  if (Platform.OS !== 'web' && debuggerHost) {
    const localIp = debuggerHost.split(':')[0];
    // Ignore localhost/127.0.0.1, as they won't work on physical devices or Android emulator (needs 10.0.2.2)
    // Also ignore tunnel domains like ngrok because they only forward Metro port (8081), not the API port (8080)
    if (localIp !== 'localhost' && localIp !== '127.0.0.1' && !localIp.includes('ngrok') && !localIp.includes('exp.host') && !localIp.includes('loca.lt')) {
      API_URL = `http://${localIp}:8080/api`;
    }
  }
}

export { API_URL };
