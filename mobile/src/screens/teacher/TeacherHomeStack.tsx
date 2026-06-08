import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherHomeScreen from './TeacherHomeScreen';
import ClassDetailsScreen from './ClassDetailsScreen';

import TeacherHealthScreen from './TeacherHealthScreen';
import TeacherUpdateHealthScreen from './TeacherUpdateHealthScreen';
import TeacherMenuScreen from './TeacherMenuScreen';
import TeacherUpdateMenuScreen from './TeacherUpdateMenuScreen';
import TeacherMedicationScreen from './TeacherMedicationScreen'
import TeacherIncidentScreen from './TeacherIncidentScreen';
import TeacherCreateIncidentScreen from './TeacherCreateIncidentScreen';
import TeacherIncidentDetailScreen from './TeacherIncidentDetailScreen';
import TeacherAllergyScreen from './TeacherAllergyScreen';
import TeacherChildProfileScreen from './TeacherChildProfileScreen';
const Stack = createNativeStackNavigator();

export default function TeacherHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
      <Stack.Screen name="TeacherChildProfile" component={TeacherChildProfileScreen} />
      <Stack.Screen name="TeacherHealth" component={TeacherHealthScreen} />
      <Stack.Screen name="TeacherUpdateHealth" component={TeacherUpdateHealthScreen} />
      <Stack.Screen name="TeacherMenu" component={TeacherMenuScreen} />
      <Stack.Screen name="TeacherUpdateMenu" component={TeacherUpdateMenuScreen} />
      <Stack.Screen name="TeacherMedication" component={TeacherMedicationScreen} />
      <Stack.Screen name="TeacherIncident" component={TeacherIncidentScreen} />
      <Stack.Screen name="TeacherCreateIncident" component={TeacherCreateIncidentScreen} />
      <Stack.Screen name="TeacherIncidentDetail" component={TeacherIncidentDetailScreen} />
      <Stack.Screen name="TeacherAllergy" component={TeacherAllergyScreen} />
    </Stack.Navigator>
  );
}
