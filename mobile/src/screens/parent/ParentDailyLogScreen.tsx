import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { parentDashboardService, ChildSummaryDTO } from '../../services/parentDashboard.service';
import { dailyLogService } from '../../services/dailyLog.service';
import { DailyLogResponse, DailyLogHistoryResponse } from '../../types/dailyLog';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
  dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

export default function ParentDailyLogScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<ChildSummaryDTO[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(route.params?.childId || null);
  
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [dailyLog, setDailyLog] = useState<DailyLogResponse | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<DailyLogHistoryResponse[]>([]);
  const [historyMonth, setHistoryMonth] = useState<{year: number, month: number}>({ 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1 
  });

  useEffect(() => {
    generateWeekDates();
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedChildId && weekDates.length > 0) {
      fetchDailyLog();
    }
  }, [selectedDate, selectedChildId]);

  useEffect(() => {
    if (showHistoryModal && selectedChildId) {
      loadHistory(historyMonth.year, historyMonth.month);
    }
  }, [showHistoryModal, historyMonth, selectedChildId]);

  const loadHistory = async (year: number, month: number) => {
    if (!selectedChildId) return;
    try {
      const data = await dailyLogService.getChildAttendanceHistory(selectedChildId, year, month);
      setHistoryData(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const getMarkedDates = () => {
    const marks: any = {};
    historyData.forEach(log => {
      let dotColor = '#cbd5e1';
      if (log.attendanceStatus === 'PRESENT') dotColor = '#10b981';
      else if (log.attendanceStatus === 'ABSENT_EXCUSED') dotColor = '#f59e0b';
      else if (log.attendanceStatus === 'ABSENT_UNEXCUSED') dotColor = '#ef4444';

      // sửa lỗi lệch múi giờ
      const localDateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      marks[log.date] = {
        marked: true,
        dotColor: dotColor,
        selected: log.date === localDateStr,
        selectedColor: '#0ea5e9',
      };
    });
    return marks;
  };

  const generateWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // thứ hai
    const monday = new Date(today.setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    setWeekDates(dates);
    
    // chọn ngày hiện tại hoặc thứ 2
    const actualToday = new Date();
    const isThisWeek = dates.some(d => d.getDate() === actualToday.getDate() && d.getMonth() === actualToday.getMonth());
    if (isThisWeek) {
      setSelectedDate(actualToday);
    } else {
      setSelectedDate(dates[0]); // mặc định là thứ 2
    }
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
      if (selectedChildId) {

      } else {
        setLoading(false);
      }
    }
  };

  const fetchDailyLog = async () => {
    if (!selectedChildId) return;
    try {
      setLoading(true);
      const dateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const log = await dailyLogService.getDailyLogForChild(selectedChildId, dateStr);
      setDailyLog(log);
    } catch (error: any) {
      console.error('Error fetching daily log:', error.response?.data || error);
      setDailyLog(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDailyLog();
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';

    return timeStr.substring(0, 5);
  };

  const getAttendanceStatusText = (status?: string) => {
    switch (status) {
      case 'PRESENT': return 'Có mặt';
      case 'ABSENT_EXCUSED': return 'Nghỉ có phép';
      case 'ABSENT_UNEXCUSED': return 'Nghỉ không phép';
      default: return 'Chưa cập nhật';
    }
  };

  const getMealStatusText = (status?: string) => {
    switch (status) {
      case 'ALL': return 'Ăn hết suất';
      case 'MOST': return 'Ăn gần hết';
      case 'HALF': return 'Ăn phân nửa';
      case 'LITTLE': return 'Ăn ít';
      case 'NONE': return 'Bỏ bữa';
      default: return 'Chưa cập nhật';
    }
  };

  const getSleepStatusText = (status?: string) => {
    switch (status) {
      case 'GOOD': return 'Ngủ ngon';
      case 'RESTLESS': return 'Trằn trọc';
      case 'NONE': return 'Không ngủ';
      default: return 'Chưa cập nhật';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hoạt động hàng ngày</Text>
        <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.backButton}>
          <Ionicons name="calendar-outline" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Date Selector */}
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

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />}
        >
          {/* Child Selector */}
          {children.length > 1 && (
            <View style={styles.childSelectorContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {children.map(child => (
                  <TouchableOpacity 
                    key={child.id} 
                    style={[styles.childTab, selectedChildId === child.id && styles.childTabActive]}
                    onPress={() => setSelectedChildId(child.id)}
                  >
                    <Ionicons name="person" size={16} color={selectedChildId === child.id ? '#fff' : '#64748b'} style={{marginRight: 6}} />
                    <Text style={[styles.childTabName, selectedChildId === child.id && styles.childTabNameActive]}>
                      {child.fullName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : !dailyLog ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có thông tin sổ tay cho ngày này</Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              
              {/* Attendance Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="calendar" size={24} color="#22c55e" />
                  </View>
                  <Text style={styles.cardTitle}>Điểm danh</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: dailyLog.attendanceStatus === 'PRESENT' ? '#dcfce7' : '#fee2e2' }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: dailyLog.attendanceStatus === 'PRESENT' ? '#16a34a' : '#ef4444' }
                    ]}>
                      {getAttendanceStatusText(dailyLog.attendanceStatus)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBodyRow}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeLabel}>Giờ đến</Text>
                    <Text style={styles.timeValue}>{formatTime(dailyLog.checkInTime)}</Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeLabel}>Giờ về</Text>
                    <Text style={styles.timeValue}>{formatTime(dailyLog.checkOutTime)}</Text>
                  </View>
                </View>
              </View>

              {/* Meal Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="restaurant" size={24} color="#f59e0b" />
                  </View>
                  <Text style={styles.cardTitle}>Bữa ăn</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.metricValue}>
                    {getMealStatusText(dailyLog.mealStatus)}
                  </Text>
                </View>
              </View>

              {/* Sleep Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                    <Ionicons name="moon" size={24} color="#6366f1" />
                  </View>
                  <Text style={styles.cardTitle}>Giấc ngủ</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.metricValue}>
                    {getSleepStatusText(dailyLog.sleepStatus)}
                  </Text>
                </View>
              </View>

              {/* Teacher Notes Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                    <Ionicons name="chatbubbles" size={24} color="#64748b" />
                  </View>
                  <Text style={styles.cardTitle}>Nhận xét của giáo viên</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.notesValue}>
                    {dailyLog.teacherNotes ? dailyLog.teacherNotes : "Không có nhận xét nào."}
                  </Text>
                </View>
              </View>

            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lịch sử điểm danh</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={`${historyMonth.year}-${String(historyMonth.month).padStart(2, '0')}-01`}
              onMonthChange={(month: any) => {
                setHistoryMonth({ year: month.year, month: month.month });
              }}
              onDayPress={(day: any) => {
                const newDate = new Date(day.timestamp + new Date().getTimezoneOffset() * 60000);
                setSelectedDate(newDate);
                // cập nhật lại danh sách ngày trong tuần
                const monday = new Date(newDate);
                const dayOfWeek = monday.getDay();
                const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                monday.setDate(diff);
                const dates = [];
                for (let i = 0; i < 7; i++) {
                  const d = new Date(monday);
                  d.setDate(monday.getDate() + i);
                  dates.push(d);
                }
                setWeekDates(dates);
                setShowHistoryModal(false);
              }}
              markedDates={getMarkedDates()}
              theme={{
                todayTextColor: '#0ea5e9',
                arrowColor: '#0ea5e9',
                dotStyle: { width: 8, height: 8, borderRadius: 4, marginTop: 4 }
              }}
            />
            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#10b981'}]} /><Text style={styles.legendText}>Có mặt</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#f59e0b'}]} /><Text style={styles.legendText}>Có phép</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#ef4444'}]} /><Text style={styles.legendText}>Không phép</Text></View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
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
  scrollContent: {
    flexGrow: 1,
  },
  childSelectorContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  childTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  childTabActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  childTabName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  childTabNameActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
  cardsContainer: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  timeDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e2e8f0',
  },
  cardBody: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  notesValue: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    fontStyle: 'italic',
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    color: '#64748b'
  }
});
