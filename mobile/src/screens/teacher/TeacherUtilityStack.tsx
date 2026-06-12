import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherUtilitiesScreen from './TeacherUtilitiesScreen';
import DailyLogScreen from './DailyLogScreen';
import TeacherHealthScreen from './TeacherHealthScreen';
import TeacherUpdateHealthScreen from './TeacherUpdateHealthScreen';
import TeacherMenuScreen from './TeacherMenuScreen';
import TeacherUpdateMenuScreen from './TeacherUpdateMenuScreen';
import TeacherMedicationScreen from './TeacherMedicationScreen';
import TeacherIncidentScreen from './TeacherIncidentScreen';
import TeacherCreateIncidentScreen from './TeacherCreateIncidentScreen';
import TeacherIncidentDetailScreen from './TeacherIncidentDetailScreen';
import TeacherAllergyScreen from './TeacherAllergyScreen';
import TeacherLeaveRequestScreen from './TeacherLeaveRequestScreen';

const Stack = createNativeStackNavigator();

export default function TeacherUtilityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherUtilities" component={TeacherUtilitiesScreen} />
      <Stack.Screen name="Daily Log" component={DailyLogScreen} />
      <Stack.Screen name="TeacherHealth" component={TeacherHealthScreen} />
      <Stack.Screen name="TeacherUpdateHealth" component={TeacherUpdateHealthScreen} />
      <Stack.Screen name="TeacherMenu" component={TeacherMenuScreen} />
      <Stack.Screen name="TeacherUpdateMenu" component={TeacherUpdateMenuScreen} />
      <Stack.Screen name="TeacherMedication" component={TeacherMedicationScreen} />
      <Stack.Screen name="TeacherIncident" component={TeacherIncidentScreen} />
      <Stack.Screen name="TeacherCreateIncident" component={TeacherCreateIncidentScreen} />
      <Stack.Screen name="TeacherIncidentDetail" component={TeacherIncidentDetailScreen} />
      <Stack.Screen name="TeacherAllergy" component={TeacherAllergyScreen} />
      <Stack.Screen name="TeacherLeaveRequest" component={TeacherLeaveRequestScreen} />
    </Stack.Navigator>
  );
}
