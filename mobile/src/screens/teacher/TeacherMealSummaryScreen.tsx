import dayjs from 'dayjs';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { mealRegistrationService } from '../../services/mealRegistration.service';
import { teacherService } from '../../services/teacher.service';
import { SchoolClassResponse } from '../../types/teacher';
import { Calendar } from 'react-native-calendars';

export default function TeacherMealSummaryScreen() {
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [selectedClass, setSelectedClass] = useState<SchoolClassResponse | null>(null);
  
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Override Modal state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideChild, setOverrideChild] = useState<{id: number, name: string} | null>(null);
  const [overrideMeals, setOverrideMeals] = useState<string[]>([]);

  const [stats, setStats] = useState({
    totalBreakfast: 0,
    totalLunch: 0,
    totalSnack: 0,
    totalMeals: 0
  });
  const [cancelledList, setCancelledList] = useState<{childId: number, childName: string, meals: string[]}[]>([]);

  useEffect(() => {
    generateWeekDates(new Date());
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const me = await teacherService.getMe();
      const fetchedClasses = await teacherService.getClassesByTeacherId(me.profile.teacherId);
      setClasses(fetchedClasses);
      if (fetchedClasses.length > 0) {
        setSelectedClass(fetchedClasses[0]);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (selectedClass && selectedDate) {
        fetchMealSummary();
      }
    }, [selectedClass, selectedDate])
  );

  const generateWeekDates = (baseDate: Date) => {
    const today = new Date(baseDate);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
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

  const fetchMealSummary = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const registrations = await mealRegistrationService.getRegistrationsByClassAndDate(selectedClass.id, dateStr);
      
      let breakfast = 0;
      let lunch = 0;
      let snack = 0;
      const cancelled: Record<string, { childId: number, childName: string, meals: string[] }> = {};

      registrations.forEach(reg => {
        if (reg.status === 'REGISTERED') {
          if (reg.mealType === 'BREAKFAST') breakfast++;
          else if (reg.mealType === 'LUNCH') lunch++;
          else if (reg.mealType === 'SNACK') snack++;
        } else if (reg.status === 'CANCELLED' || reg.status === 'CANCELLED_BY_LEAVE') {
          const key = reg.childId.toString();
          if (!cancelled[key]) {
            cancelled[key] = {
              childId: reg.childId,
              childName: reg.childFullName,
              meals: []
            };
          }
          if (reg.mealType === 'BREAKFAST') cancelled[key].meals.push('Sáng');
          else if (reg.mealType === 'LUNCH') cancelled[key].meals.push('Trưa');
          else if (reg.mealType === 'SNACK') cancelled[key].meals.push('Xế');
        }
      });

      const cancelledArray = Object.values(cancelled);
      setCancelledList(cancelledArray);

      setStats({
        totalBreakfast: breakfast,
        totalLunch: lunch,
        totalSnack: snack,
        totalMeals: breakfast + lunch + snack
      });

    } catch (error: any) {
      console.error('Error fetching meal summary:', error);
      setStats({ totalBreakfast: 0, totalLunch: 0, totalSnack: 0, totalMeals: 0 });
      setCancelledList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMealSummary();
  };

  const openOverrideModal = (childId: number, childName: string, cancelledMeals: string[]) => {
    setOverrideChild({ id: childId, name: childName });
    // Mặc định chọn sẵn những bữa mà bé đã cắt
    const defaultSelected = cancelledMeals.map(m => {
      if (m === 'Sáng') return 'BREAKFAST';
      if (m === 'Trưa') return 'LUNCH';
      return 'SNACK';
    });
    setOverrideMeals(defaultSelected);
    setShowOverrideModal(true);
  };

  const toggleOverrideMeal = (mealType: string) => {
    setOverrideMeals(prev => 
      prev.includes(mealType) 
        ? prev.filter(m => m !== mealType)
        : [...prev, mealType]
    );
  };

  const submitOverrideRegistration = async () => {
    if (!overrideChild) return;
    if (overrideMeals.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một bữa ăn để bổ sung');
      return;
    }

    try {
      setLoading(true);
      setShowOverrideModal(false);
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      await mealRegistrationService.overrideDailyRegistration({
        childId: overrideChild.id,
        date: dateStr,
        mealTypes: overrideMeals,
        isRegistered: true
      });
      Alert.alert('Thành công', `Đã đăng ký bổ sung suất ăn cho bé ${overrideChild.name}`);
      fetchMealSummary();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng ký bổ sung');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tổng Suất Ăn</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.headerActionBtn}>
            <Ionicons name="calendar-outline" size={24} color="#0ea5e9" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {weekDates.map((date, index) => {
            const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
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

      {classes.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classSelector}>
          {classes.map(cls => (
            <TouchableOpacity
              key={cls.id}
              style={[
                styles.classTab,
                selectedClass?.id === cls.id && styles.classTabActive
              ]}
              onPress={() => setSelectedClass(cls)}
            >
              <Text style={[
                styles.classTabText,
                selectedClass?.id === cls.id && styles.classTabTextActive
              ]}>
                {cls.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView 
        contentContainerStyle={styles.statsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
              <View style={styles.statIconBox}>
                <Ionicons name="cafe" size={24} color="#ea580c" />
              </View>
              <Text style={[styles.statTitle, { color: '#9a3412' }]}>Ăn Sáng</Text>
              <Text style={[styles.statValue, { color: '#7c2d12' }]}>{stats.totalBreakfast}</Text>
              <Text style={[styles.statDesc, { color: '#c2410c' }]}>suất chuẩn bị</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <View style={styles.statIconBox}>
                <Ionicons name="restaurant" size={24} color="#16a34a" />
              </View>
              <Text style={[styles.statTitle, { color: '#166534' }]}>Ăn Trưa</Text>
              <Text style={[styles.statValue, { color: '#14532d' }]}>{stats.totalLunch}</Text>
              <Text style={[styles.statDesc, { color: '#15803d' }]}>suất chuẩn bị</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}>
              <View style={styles.statIconBox}>
                <Ionicons name="nutrition" size={24} color="#7c3aed" />
              </View>
              <Text style={[styles.statTitle, { color: '#5b21b6' }]}>Ăn Xế</Text>
              <Text style={[styles.statValue, { color: '#4c1d95' }]}>{stats.totalSnack}</Text>
              <Text style={[styles.statDesc, { color: '#6d28d9' }]}>suất chuẩn bị</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderWidth: 2 }]}>
              <View style={styles.statIconBox}>
                <Ionicons name="people" size={24} color="#475569" />
              </View>
              <Text style={[styles.statTitle, { color: '#334155' }]}>Tổng Tất Cả</Text>
              <Text style={[styles.statValue, { color: '#0f172a' }]}>{stats.totalMeals}</Text>
              <Text style={[styles.statDesc, { color: '#475569' }]}>suất trong ngày</Text>
            </View>
          </View>

          {cancelledList.length > 0 && (
            <View style={styles.cancelledSection}>
              <View style={styles.cancelledHeader}>
                <Ionicons name="warning" size={20} color="#ea580c" />
                <Text style={styles.cancelledTitle}>Danh sách bé cắt cơm ({cancelledList.length})</Text>
              </View>
              {cancelledList.map((item, index) => (
                <View key={index} style={styles.cancelledItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cancelledName}>• {item.childName}</Text>
                    <View style={styles.cancelledMeals}>
                      {item.meals.map((m, idx) => (
                        <View key={idx} style={styles.mealBadge}>
                          <Text style={styles.mealBadgeText}>{m}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  {/* Nút mở modal đăng ký bổ sung */}
                  {dayjs(selectedDate).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') && (
                    <TouchableOpacity 
                      style={styles.overrideButton}
                      onPress={() => openOverrideModal(item.childId, item.childName, item.meals)}
                    >
                      <Ionicons name="add-circle" size={18} color="#fff" />
                      <Text style={styles.overrideButtonText}>Bổ sung</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
          </>
        )}
      </ScrollView>

      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày xem tổng kết</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={dayjs(selectedDate).format('YYYY-MM-DD')}
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

      {/* Override Modal */}
      <Modal visible={showOverrideModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.overrideModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bổ sung suất ăn</Text>
              <TouchableOpacity onPress={() => setShowOverrideModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.overrideSubtitle}>
              Chọn các bữa ăn cần đăng ký bổ sung cho bé <Text style={{fontWeight: 'bold', color: '#0ea5e9'}}>{overrideChild?.name}</Text>:
            </Text>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={[styles.checkboxItem, overrideMeals.includes('BREAKFAST') && styles.checkboxItemActive]} 
                onPress={() => toggleOverrideMeal('BREAKFAST')}
              >
                <Ionicons name={overrideMeals.includes('BREAKFAST') ? "checkbox" : "square-outline"} size={24} color={overrideMeals.includes('BREAKFAST') ? "#0ea5e9" : "#94a3b8"} />
                <Text style={styles.checkboxText}>Bữa Sáng</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.checkboxItem, overrideMeals.includes('LUNCH') && styles.checkboxItemActive]} 
                onPress={() => toggleOverrideMeal('LUNCH')}
              >
                <Ionicons name={overrideMeals.includes('LUNCH') ? "checkbox" : "square-outline"} size={24} color={overrideMeals.includes('LUNCH') ? "#0ea5e9" : "#94a3b8"} />
                <Text style={styles.checkboxText}>Bữa Trưa</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.checkboxItem, overrideMeals.includes('SNACK') && styles.checkboxItemActive]} 
                onPress={() => toggleOverrideMeal('SNACK')}
              >
                <Ionicons name={overrideMeals.includes('SNACK') ? "checkbox" : "square-outline"} size={24} color={overrideMeals.includes('SNACK') ? "#0ea5e9" : "#94a3b8"} />
                <Text style={styles.checkboxText}>Bữa Xế</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowOverrideModal(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={submitOverrideRegistration}>
                <Text style={styles.confirmBtnText}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
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
  classSelector: {
    maxHeight: 55,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  classTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    justifyContent: 'center',
  },
  classTabActive: {
    backgroundColor: '#0ea5e9',
  },
  classTabText: {
    color: '#64748b',
    fontWeight: '500',
  },
  classTabTextActive: {
    color: '#fff',
  },
  statsList: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statIconBox: {
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  statDesc: {
    fontSize: 12,
    fontWeight: '500',
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
  },
  cancelledSection: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cancelledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  cancelledItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cancelledName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  cancelledMeals: {
    flexDirection: 'row',
    gap: 6,
  },
  mealBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mealBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c2410c',
  },
  overrideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  overrideButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  overrideModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  overrideSubtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 22,
  },
  checkboxContainer: {
    gap: 12,
    marginBottom: 24,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  checkboxItemActive: {
    borderColor: '#bae6fd',
    backgroundColor: '#f0f9ff',
  },
  checkboxText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0ea5e9',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  }
});
