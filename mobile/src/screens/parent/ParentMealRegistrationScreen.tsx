import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parentDashboardService, ChildSummaryDTO } from '../../services/parentDashboard.service';
import { mealRegistrationService, MealRegistrationResponse } from '../../services/mealRegistration.service';
import dayjs from 'dayjs';

type TabType = 'MONTHLY' | 'DAILY';

export default function ParentMealRegistrationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [childId, setChildId] = useState<number | null>(route.params?.childId || null);
  const [currentChild, setCurrentChild] = useState<ChildSummaryDTO | null>(null);
  const [children, setChildren] = useState<ChildSummaryDTO[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabType>('DAILY');
  const [registrations, setRegistrations] = useState<MealRegistrationResponse[]>([]);
  

  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  

  const [mealTypes, setMealTypes] = useState({
    BREAKFAST: true,
    LUNCH: true,
    SNACK: true
  });
  
  const loadData = async () => {
    let currentChildId = childId;
    let foundChild = null;

    try {
      const dashboardData = await parentDashboardService.getDashboardData();
      if (dashboardData.children && dashboardData.children.length > 0) {
        setChildren(dashboardData.children);
        if (!currentChildId) {
          currentChildId = dashboardData.children[0].id;
          setChildId(currentChildId);
        }
        foundChild = dashboardData.children.find(c => c.id === currentChildId) || dashboardData.children[0];
        setCurrentChild(foundChild);
        
        await fetchRegistrations(currentChildId, selectedMonth, selectedYear);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin học sinh.');
      }
    } catch (error) {
      console.log('Lỗi tải thông tin:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin suất ăn.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRegistrations = async (cId: number, month: number, year: number) => {
    try {
      const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
      const data = await mealRegistrationService.getRegistrationsByChildAndDateRange(cId, startDate, endDate);
      setRegistrations(data);
    } catch (error) {
      console.log('Error fetching registrations:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [childId, selectedMonth, selectedYear]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMonthlySubmit = async (isRegistered: boolean) => {
    if (!currentChild) return;
    
    const selectedTypes = Object.keys(mealTypes).filter(k => mealTypes[k as keyof typeof mealTypes]);
    if (selectedTypes.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 bữa ăn.');
      return;
    }

    try {
      setProcessing(true);
      await mealRegistrationService.processMonthlyRegistration({
        childId: currentChild.id,
        month: selectedMonth,
        year: selectedYear,
        isRegistered,
        mealTypes: selectedTypes
      });
      Alert.alert('Thành công', `Đã ${isRegistered ? 'đăng ký' : 'hủy'} suất ăn cho tháng ${selectedMonth}/${selectedYear}`);
      fetchRegistrations(currentChild.id, selectedMonth, selectedYear);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xử lý yêu cầu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDailySubmit = async (date: string, isRegistered: boolean) => {
    if (!currentChild) return;

    // kiểm tra điều kiện trước khi gửi
    const targetDate = dayjs(date);
    const today = dayjs();
    
    if (targetDate.isBefore(today, 'day')) {
      Alert.alert('Lỗi', 'Không thể chỉnh sửa suất ăn trong quá khứ.');
      return;
    }
    
    if (targetDate.isSame(today, 'day') && dayjs().hour() >= 8) {
      Alert.alert('Lỗi', 'Đã quá 8h00 sáng, không thể thay đổi thông tin hôm nay.');
      return;
    }

    const selectedTypes = Object.keys(mealTypes).filter(k => mealTypes[k as keyof typeof mealTypes]);
    if (selectedTypes.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn bữa ăn trong cấu hình để áp dụng.');
      return;
    }

    try {
      setProcessing(true);
      await mealRegistrationService.processDailyRegistration({
        childId: currentChild.id,
        date: date,
        isRegistered,
        mealTypes: selectedTypes
      });
      Alert.alert('Thành công', `Đã ${isRegistered ? 'đăng ký lại' : 'báo cắt cơm'} cho ngày ${dayjs(date).format('DD/MM/YYYY')}`);
      fetchRegistrations(currentChild.id, selectedMonth, selectedYear);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xử lý yêu cầu.');
    } finally {
      setProcessing(false);
    }
  };

  const toggleMealType = (type: keyof typeof mealTypes) => {
    setMealTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // nhóm các suất ăn đã đăng ký theo ngày
  const groupedRegistrations: Record<string, MealRegistrationResponse[]> = {};
  registrations.forEach(r => {
    if (!groupedRegistrations[r.date]) groupedRegistrations[r.date] = [];
    groupedRegistrations[r.date].push(r);
  });
  
  // tạo danh sách các ngày trong tháng để hiển thị
  const daysInMonth = Array.from(
    { length: dayjs(`${selectedYear}-${selectedMonth}-01`).daysInMonth() },
    (_, i) => dayjs(`${selectedYear}-${selectedMonth}-${i + 1}`).format('YYYY-MM-DD')
  ).filter(d => {
    const dayOfWeek = dayjs(d).day();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // bỏ qua cuối tuần
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký suất ăn</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Child Selector */}
      {children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector}>
          {children.map(child => (
            <TouchableOpacity 
              key={child.id}
              style={[styles.childChip, childId === child.id && styles.childChipActive]}
              onPress={() => setChildId(child.id)}
            >
              <Text style={[styles.childChipText, childId === child.id && styles.childChipTextActive]}>
                {child.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'DAILY' && styles.tabActive]}
              onPress={() => setActiveTab('DAILY')}
            >
              <Text style={[styles.tabText, activeTab === 'DAILY' && styles.tabTextActive]}>Theo Ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'MONTHLY' && styles.tabActive]}
              onPress={() => setActiveTab('MONTHLY')}
            >
              <Text style={[styles.tabText, activeTab === 'MONTHLY' && styles.tabTextActive]}>Cả Tháng</Text>
            </TouchableOpacity>
          </View>

          {/* Month Selector */}
          <View style={styles.monthSelector}>
            <TouchableOpacity 
              onPress={() => {
                const newDate = dayjs(`${selectedYear}-${selectedMonth}-01`).subtract(1, 'month');
                setSelectedMonth(newDate.month() + 1);
                setSelectedYear(newDate.year());
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.monthText}>Tháng {selectedMonth}/{selectedYear}</Text>
            <TouchableOpacity 
              onPress={() => {
                const newDate = dayjs(`${selectedYear}-${selectedMonth}-01`).add(1, 'month');
                setSelectedMonth(newDate.month() + 1);
                setSelectedYear(newDate.year());
              }}
            >
              <Ionicons name="chevron-forward" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Meal Types Configuration */}
          <View style={styles.mealTypeConfig}>
            <Text style={styles.sectionTitle}>Cấu hình Bữa ăn thao tác:</Text>
            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <Switch value={mealTypes.BREAKFAST} onValueChange={() => toggleMealType('BREAKFAST')} trackColor={{ true: '#10b981', false: '#cbd5e1' }} />
                <Text style={styles.switchLabel}>Sáng</Text>
              </View>
              <View style={styles.switchItem}>
                <Switch value={mealTypes.LUNCH} onValueChange={() => toggleMealType('LUNCH')} trackColor={{ true: '#10b981', false: '#cbd5e1' }} />
                <Text style={styles.switchLabel}>Trưa</Text>
              </View>
              <View style={styles.switchItem}>
                <Switch value={mealTypes.SNACK} onValueChange={() => toggleMealType('SNACK')} trackColor={{ true: '#10b981', false: '#cbd5e1' }} />
                <Text style={styles.switchLabel}>Xế</Text>
              </View>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
          >
            {activeTab === 'MONTHLY' ? (
              <View style={styles.monthlyContainer}>
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={24} color="#0ea5e9" style={{ marginTop: 2 }} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }}>Đăng ký theo tháng</Text>
                    <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
                      Tính năng này cho phép bạn đăng ký hoặc hủy đăng ký hàng loạt cho TẤT CẢ các ngày trong tháng được chọn (bỏ qua T7, CN). Vui lòng cấu hình các bữa ăn ở trên trước khi bấm Đăng ký.
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.btnPrimary, { opacity: processing ? 0.7 : 1 }]}
                    onPress={() => handleMonthlySubmit(true)}
                    disabled={processing}
                  >
                    <Ionicons name="calendar" size={20} color="white" />
                    <Text style={styles.btnPrimaryText}>Đăng ký tháng {selectedMonth}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.btnDanger, { opacity: processing ? 0.7 : 1 }]}
                    onPress={() => handleMonthlySubmit(false)}
                    disabled={processing}
                  >
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                    <Text style={styles.btnDangerText}>Hủy suất ăn tháng {selectedMonth}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.dailyContainer}>
                <View style={styles.infoBox}>
                  <Ionicons name="warning" size={24} color="#f59e0b" style={{ marginTop: 2 }} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }}>Báo cắt cơm theo ngày</Text>
                    <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
                      Bạn có thể báo cắt cơm cho bé từng ngày cụ thể (VD: Khi bé ốm). Vui lòng thao tác trước 8:00 AM của ngày hôm đó để được hoàn trả tiền ăn.
                    </Text>
                  </View>
                </View>

                <View style={styles.dayList}>
                  {daysInMonth.map(date => {
                    const today = dayjs().format('YYYY-MM-DD');
                    const isPast = dayjs(date).isBefore(dayjs(), 'day');
                    const isToday = date === today;
                    const isLockedToday = isToday && dayjs().hour() >= 8;
                    const isLocked = isPast || isLockedToday;
                    
                    const dayRegs = groupedRegistrations[date] || [];
                    const isRegistered = dayRegs.some(r => r.status === 'REGISTERED');
                    // tìm xem đã đăng ký những bữa nào
                    const registeredMeals = dayRegs.filter(r => r.status === 'REGISTERED').map(r => r.mealType);
                    
                    return (
                      <View key={date} style={[styles.dayCard, isToday && styles.dayCardToday]}>
                        <View style={styles.dayHeader}>
                          <View>
                            <Text style={styles.dayDate}>{dayjs(date).format('DD/MM/YYYY')}</Text>
                            <Text style={styles.dayOfWeek}>
                              {dayjs(date).day() === 1 ? 'Thứ Hai' : 
                               dayjs(date).day() === 2 ? 'Thứ Ba' : 
                               dayjs(date).day() === 3 ? 'Thứ Tư' : 
                               dayjs(date).day() === 4 ? 'Thứ Năm' : 
                               dayjs(date).day() === 5 ? 'Thứ Sáu' : ''}
                            </Text>
                          </View>
                          <View style={styles.statusBadge}>
                            <View style={[styles.dot, { backgroundColor: isRegistered ? '#10b981' : '#cbd5e1' }]} />
                            <Text style={{ fontSize: 12, color: isRegistered ? '#10b981' : '#64748b', fontWeight: 'bold' }}>
                              {isRegistered ? 'Đã đăng ký' : 'Đã cắt cơm'}
                            </Text>
                          </View>
                        </View>
                        
                        {isRegistered && (
                          <View style={styles.mealTags}>
                            {registeredMeals.includes('BREAKFAST') && <View style={styles.tag}><Text style={styles.tagText}>Sáng</Text></View>}
                            {registeredMeals.includes('LUNCH') && <View style={styles.tag}><Text style={styles.tagText}>Trưa</Text></View>}
                            {registeredMeals.includes('SNACK') && <View style={styles.tag}><Text style={styles.tagText}>Xế</Text></View>}
                          </View>
                        )}

                        <View style={styles.dayAction}>
                          {!isLocked ? (
                            <TouchableOpacity 
                              style={[styles.actionBtn, isRegistered ? styles.btnCancel : styles.btnRegister]}
                              onPress={() => handleDailySubmit(date, !isRegistered)}
                              disabled={processing}
                            >
                              <Text style={[styles.btnRegisterText, isRegistered && styles.btnCancelText]}>
                                {isRegistered ? 'Báo cắt cơm' : 'Đăng ký lại'}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={styles.lockedText}>
                              <Ionicons name="lock-closed" size={12} /> Đã khóa
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  placeholder: {
    width: 40,
  },
  childSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    maxHeight: 60,
  },
  childChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  childChipActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  childChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  childChipTextActive: {
    color: '#10b981',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#10b981',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  mealTypeConfig: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  switchItem: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  monthlyContainer: {
    flex: 1,
  },
  actionButtons: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnDanger: {
    backgroundColor: '#fff1f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecdd3',
    gap: 8,
  },
  btnDangerText: {
    color: '#e11d48',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dailyContainer: {
    flex: 1,
  },
  dayList: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#cbd5e1',
  },
  dayCardToday: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dayOfWeek: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mealTags: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
  },
  dayAction: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnRegister: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  btnRegisterText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  btnCancel: {
    backgroundColor: 'white',
    borderColor: '#ef4444',
  },
  btnCancelText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13,
  },
  lockedText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  }
});
