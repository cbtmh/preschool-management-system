import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ParentHomeScreen from '../screens/parent/ParentHomeScreen';
import ParentDailyLogScreen from '../screens/parent/ParentDailyLogScreen';
import ParentServicesScreen from '../screens/parent/ParentServicesScreen';
import ParentNotificationScreen from '../screens/parent/ParentNotificationScreen';
import ParentProfileScreen from '../screens/parent/ParentProfileScreen';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUnreadCount } from '../store/slices/notificationSlice';
import { useFocusEffect } from '@react-navigation/native';
import { notificationService } from '../services/notification.service';

const Tab = createBottomTabNavigator();

export default function ParentTabNavigator() {
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
    }, [dispatch])
  );

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

          if (route.name === 'Trang chủ') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Hoạt động') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Tiện ích') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Thông báo') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Cá nhân') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen name="Trang chủ" component={ParentHomeScreen} />
      <Tab.Screen name="Hoạt động" component={ParentDailyLogScreen} />
      <Tab.Screen name="Tiện ích" component={ParentServicesScreen} />
      <Tab.Screen 
        name="Thông báo" 
        component={ParentNotificationScreen} 
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#ef4444' }
        }}
      />
      <Tab.Screen name="Cá nhân" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
}
