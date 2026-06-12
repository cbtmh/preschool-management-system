import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import TeacherTabNavigator from './TeacherTabNavigator';
import ParentTabNavigator from './ParentTabNavigator';
import ChangePasswordScreen from '../screens/common/ChangePasswordScreen';
import HelpSupportScreen from '../screens/common/HelpSupportScreen';
import LeaveRequestListScreen from '../screens/parent/LeaveRequestListScreen';
import CreateLeaveRequestScreen from '../screens/parent/CreateLeaveRequestScreen';
import NewsDetailScreen from '../screens/parent/NewsDetailScreen';
import MedicationAdviceListScreen from '../screens/parent/MedicationAdviceListScreen';
import CreateMedicationAdviceScreen from '../screens/parent/CreateMedicationAdviceScreen';
import ParentMealMenuScreen from '../screens/parent/ParentMealMenuScreen';
import ParentHealthScreen from '../screens/parent/ParentHealthScreen';
import EditParentProfileScreen from '../screens/parent/EditParentProfileScreen';
import EditTeacherProfileScreen from '../screens/teacher/EditTeacherProfileScreen';
import ParentAllergyScreen from '../screens/parent/ParentAllergyScreen';
import ParentMealRegistrationScreen from '../screens/parent/ParentMealRegistrationScreen';
import NotificationDetailScreen from '../screens/common/NotificationDetailScreen';
import ParentIncidentScreen from '../screens/parent/ParentIncidentScreen';
import ParentIncidentDetailScreen from '../screens/parent/ParentIncidentDetailScreen';
import NewsListScreen from '../screens/parent/NewsListScreen';
import * as SecureStore from 'expo-secure-store';
import { setCredentials } from '../store/slices/authSlice';
import { ActivityIndicator, View, Platform } from 'react-native';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { authService } from '../services/auth.service';

// tắt console.log trên web để ngăn chặn người dùng xem thông tin debug
if (Platform.OS === 'web') {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.debug = () => {};
}

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, role } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (token && expoPushToken?.data) {
      authService.updatePushToken(expoPushToken.data).catch(err => {
        console.error('Failed to update push token', err);
      });
    }
  }, [token, expoPushToken]);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        let savedToken = null;
        let savedRole = null;

        if (Platform.OS === 'web') {
          savedToken = localStorage.getItem('token');
          savedRole = localStorage.getItem('role');
        } else {
          savedToken = await SecureStore.getItemAsync('token');
          savedRole = await SecureStore.getItemAsync('role');
        }

        if (savedToken && savedRole) {
          dispatch(setCredentials({ token: savedToken, role: savedRole }));
        }
      } catch (e) {
        console.log('Failed to restore token', e);
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token == null ? (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            {role === 'TEACHER' ? <Stack.Screen name="TeacherApp" component={TeacherTabNavigator} /> : <Stack.Screen name="ParentApp" component={ParentTabNavigator} />}
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="LeaveRequestList" component={LeaveRequestListScreen} />
            <Stack.Screen name="CreateLeaveRequest" component={CreateLeaveRequestScreen} />
            <Stack.Screen name="MedicationAdviceList" component={MedicationAdviceListScreen} />
            <Stack.Screen name="CreateMedicationAdvice" component={CreateMedicationAdviceScreen} />
            <Stack.Screen name="ParentMealMenu" component={ParentMealMenuScreen} />
            <Stack.Screen name="ParentMealRegistration" component={ParentMealRegistrationScreen} />
            <Stack.Screen name="NewsList" component={NewsListScreen} />
            <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
            <Stack.Screen name="ParentHealth" component={ParentHealthScreen} />
            <Stack.Screen name="ParentAllergy" component={ParentAllergyScreen} />
            <Stack.Screen name="EditParentProfile" component={EditParentProfileScreen} />
            <Stack.Screen name="ParentIncident" component={ParentIncidentScreen} />
            <Stack.Screen name="ParentIncidentDetail" component={ParentIncidentDetailScreen} />
            <Stack.Screen name="EditTeacherProfile" component={EditTeacherProfileScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
