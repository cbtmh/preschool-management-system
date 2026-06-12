import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherHomeScreen from './TeacherHomeScreen';
import ClassDetailsScreen from './ClassDetailsScreen';
import DailyLogScreen from './DailyLogScreen';
import TeacherMenuScreen from './TeacherMenuScreen';
import TeacherUpdateMenuScreen from './TeacherUpdateMenuScreen';
import TeacherMedicationScreen from './TeacherMedicationScreen';
import TeacherChildProfileScreen from './TeacherChildProfileScreen';
import TeacherLeaveRequestScreen from './TeacherLeaveRequestScreen';
const Stack = createNativeStackNavigator();

export default function TeacherHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
      <Stack.Screen name="Daily Log" component={DailyLogScreen} />
      <Stack.Screen name="TeacherChildProfile" component={TeacherChildProfileScreen} />
      <Stack.Screen name="TeacherMenu" component={TeacherMenuScreen} />
      <Stack.Screen name="TeacherUpdateMenu" component={TeacherUpdateMenuScreen} />
      <Stack.Screen name="TeacherMedication" component={TeacherMedicationScreen} />
      <Stack.Screen name="TeacherLeaveRequest" component={TeacherLeaveRequestScreen} />
    </Stack.Navigator>
  );
}
