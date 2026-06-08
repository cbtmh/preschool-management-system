import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Image, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { mealMenuService, MealMenuResponse } from '../../services/mealMenu.service';
import { API_URL } from '../../config/api';
import { Calendar } from 'react-native-calendars';

export default function TeacherMenuScreen() {
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyMenus, setWeeklyMenus] = useState<MealMenuResponse[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    generateWeekDates(new Date());
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (weekDates.length > 0) {
        fetchWeeklyMenus();
      }
    }, [weekDates])
  );

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

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xóa thực đơn',
      'Bạn có chắc chắn muốn xóa thực đơn này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await mealMenuService.deleteMealMenu(id);
              fetchWeeklyMenus();
              Alert.alert('Thành công', 'Đã xóa thực đơn');
            } catch (error) {
              console.log(error);
              Alert.alert('Lỗi', 'Không thể xóa thực đơn lúc này');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
    if (type === 'BREAKFAST') return '#fef3c7'; // amber-100
    if (type === 'LUNCH') return '#dcfce7'; // green-100
    if (type === 'SNACK') return '#e0e7ff'; // indigo-100
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
        <Text style={styles.headerTitle}>Quản lý Thực đơn</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.headerActionBtn}>
            <Ionicons name="calendar-outline" size={24} color="#0ea5e9" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionBtn}
            onPress={() => navigation.navigate('TeacherUpdateMenu', { date: dateStr })}
          >
            <Ionicons name="add" size={24} color="#0ea5e9" />
          </TouchableOpacity>
        </View>
      </View>

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
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
        ) : todaysMenu.length > 0 ? (
          ['BREAKFAST', 'LUNCH', 'SNACK'].map(mealType => {
            const meal = todaysMenu.find(m => m.mealType === mealType);
            if (!meal) return null;
            return (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealCardTop}>
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
                
                <View style={styles.mealCardActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => navigation.navigate('TeacherUpdateMenu', { menu: meal, date: dateStr })}
                  >
                    <Ionicons name="create-outline" size={18} color="#0ea5e9" />
                    <Text style={styles.editBtnText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(meal.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    <Text style={styles.deleteBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="fast-food-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có thực đơn cho ngày này</Text>
            <TouchableOpacity 
              style={styles.addMenuBtn}
              onPress={() => navigation.navigate('TeacherUpdateMenu', { date: dateStr })}
            >
              <Text style={styles.addMenuBtnText}>Thêm thực đơn ngay</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    padding: 4,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
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
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealCardTop: {
    flexDirection: 'row',
    marginBottom: 16,
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
  mealCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  editBtn: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  editBtnText: {
    color: '#0ea5e9',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
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
    marginBottom: 24,
  },
  addMenuBtn: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addMenuBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
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
