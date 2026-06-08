import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from './src/hooks/usePushNotifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <StatusBar style="auto" />
          <AppNavigator />
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
