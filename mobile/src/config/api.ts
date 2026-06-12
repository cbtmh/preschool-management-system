import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';


let API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  API_URL = 'http://192.168.0.247:8080/api';

  if (Platform.OS === 'android') {
    API_URL = 'http://10.0.2.2:8080/api';
  }


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
    // bỏ qua localhost và tunnel domains vì chúng không map đúng port của backend
    if (localIp !== 'localhost' && localIp !== '127.0.0.1' && !localIp.includes('ngrok') && !localIp.includes('exp.host') && !localIp.includes('loca.lt')) {
      API_URL = `http://${localIp}:8080/api`;
    }
  }
}

export { API_URL };
