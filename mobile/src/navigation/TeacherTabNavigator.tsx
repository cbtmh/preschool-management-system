import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { setUnreadCount } from '../store/slices/notificationSlice';
import TeacherHomeStack from '../screens/teacher/TeacherHomeStack';
import DailyLogScreen from '../screens/teacher/DailyLogScreen';
import AttendanceScreen from '../screens/teacher/AttendanceScreen';
import NotificationScreen from '../screens/teacher/NotificationScreen';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { notificationService } from '../services/notification.service';
import ProfileScreen from '../screens/teacher/ProfileScreen';
const Tab = createBottomTabNavigator();

export default function TeacherTabNavigator() {
  const dispatch = useDispatch();
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUnreadCount = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          dispatch(setUnreadCount(count));
        } catch (error) {
          console.log('Failed to fetch unread notifications count:', error);
        }
      };
      
      fetchUnreadCount();
      // Optional: Set up an interval to poll if real-time is needed
      // const interval = setInterval(fetchUnreadCount, 60000); // every minute
      // return () => clearInterval(interval);
    }, [dispatch])
  );

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Daily Log') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10b981', // Changed to green to match Attendance and new theme
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={TeacherHomeStack} 
        options={{ headerShown: false, tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen}
        options={{ headerShown: false, tabBarLabel: 'Điểm danh' }}
      />
      <Tab.Screen 
        name="Daily Log" 
        component={DailyLogScreen}
        options={{ headerShown: false, tabBarLabel: 'Hoạt động' }}
      />
      <Tab.Screen 
        name="Notification" 
        component={NotificationScreen}
        options={{ 
          headerShown: false,
          tabBarLabel: 'Thông báo',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444' }
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false, tabBarLabel: 'Cá nhân' }}
      />
    </Tab.Navigator>
  );
}
