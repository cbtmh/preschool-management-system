import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Image, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parentDashboardService, ChildSummaryDTO } from '../../services/parentDashboard.service';
import { mealMenuService, MealMenuResponse } from '../../services/mealMenu.service';
import { API_URL } from '../../config/api';
import { Calendar } from 'react-native-calendars';

export default function ParentMealMenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<ChildSummaryDTO[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(route.params?.childId || null);
  
  // Menu State
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyMenus, setWeeklyMenus] = useState<MealMenuResponse[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    generateWeekDates(new Date());
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchWeeklyMenus();
  }, [selectedDate, selectedChildId]);

  const generateWeekDates = (baseDate: Date) => {
    const today = new Date(baseDate);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    setWeekDates(dates);
    setSelectedDate(baseDate);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const dashboardData = await parentDashboardService.getDashboardData();
      setChildren(dashboardData.children || []);
      if (dashboardData.children?.length > 0 && !selectedChildId) {
        setSelectedChildId(dashboardData.children[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyMenus = async () => {
    if (weekDates.length === 0) return;
    try {
      setLoading(true);
      const startDateStr = weekDates[0].toISOString().split('T')[0];
      const endDateStr = weekDates[6].toISOString().split('T')[0];
      const menus = await mealMenuService.getMealMenusBetweenDates(startDateStr, endDateStr);
      setWeeklyMenus(menus);
    } catch (error: any) {
      console.error('Error fetching weekly menus:', error.response?.data || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeeklyMenus();
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const dateStr = selectedDate.toISOString().split('T')[0];
  const todaysMenu = weeklyMenus.filter(m => m.date === dateStr);

  const getMealLabel = (type: string) => {
    if (type === 'BREAKFAST') return 'Ăn sáng';
    if (type === 'LUNCH') return 'Ăn trưa';
    if (type === 'SNACK') return 'Ăn xế';
    return type;
  };

  const getMealColor = (type: string) => {
    if (type === 'BREAKFAST') return '#fef3c7'; 
    if (type === 'LUNCH') return '#dcfce7'; 
    if (type === 'SNACK') return '#e0e7ff'; 
    return '#f1f5f9';
  };

  const getMealIconColor = (type: string) => {
    if (type === 'BREAKFAST') return '#f59e0b';
    if (type === 'LUNCH') return '#22c55e';
    if (type === 'SNACK') return '#6366f1';
    return '#64748b';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thực đơn tuần</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistoryModal(true)}>
          <Ionicons name="calendar-outline" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={[styles.tabContent, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <View style={styles.tabContent}>
          {/* Date Selector */}
          <View style={styles.dateSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
              {weekDates.map((date, index) => {
                const isSelected = date.getDate() === selectedDate.getDate();
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                return (
                  <TouchableOpacity 
                    key={index}
                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
                      {dayNames[date.getDay()]}
                    </Text>
                    <Text style={[styles.dateNumber, isSelected && styles.dateTextActive]}>
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Meal List */}
          <ScrollView 
            contentContainerStyle={styles.mealList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />}
          >
            {todaysMenu.length > 0 ? (
              ['BREAKFAST', 'LUNCH', 'SNACK'].map(mealType => {
                const meal = todaysMenu.find(m => m.mealType === mealType);
                if (!meal) return null;
                return (
                  <View key={meal.id} style={styles.mealCard}>
                    <View style={[styles.mealIconBox, { backgroundColor: getMealColor(mealType) }]}>
                      <Ionicons name="restaurant" size={24} color={getMealIconColor(mealType)} />
                    </View>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealType}>{getMealLabel(mealType)}</Text>
                      <Text style={styles.mealDesc}>{meal.description}</Text>
                    </View>
                    {meal.imageUrl && (
                      <Image source={{ uri: getImageUrl(meal.imageUrl) as string }} style={styles.mealImage} />
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="fast-food-outline" size={64} color="#cbd5e1" />
                <Text style={styles.emptyText}>Chưa có thực đơn cho ngày này</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày xem thực đơn</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={selectedDate.toISOString().split('T')[0]}
              onDayPress={(day: any) => {
                const newDate = new Date(day.timestamp + new Date().getTimezoneOffset() * 60000);
                generateWeekDates(newDate);
                setShowHistoryModal(false);
              }}
              theme={{
                todayTextColor: '#0ea5e9',
                arrowColor: '#0ea5e9'
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  historyButton: {
    padding: 4,
  },
  tabContent: {
    flex: 1,
  },
  dateSelectorContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateCard: {
    width: 60,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateCardActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  dateDay: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  mealList: {
    padding: 20,
    gap: 16,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  mealType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  mealDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  mealImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  }
});
