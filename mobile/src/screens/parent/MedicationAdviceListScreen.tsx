import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { medicationService, MedicationResponse } from '../../services/medication.service';
import { parentDashboardService } from '../../services/parentDashboard.service';
import { Calendar } from 'react-native-calendars';

export default function MedicationAdviceListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [requests, setRequests] = useState<MedicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childId, setChildId] = useState<number | null>(route.params?.childId || null);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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

  useEffect(() => {
    generateWeekDates(new Date());
  }, []);

  const loadRequests = async () => {
    let currentChildId = childId;
    
    // nếu chưa có childid (đi từ màn hình tiện ích)
    if (!currentChildId) {
      try {
        const dashboardData = await parentDashboardService.getDashboardData();
        if (dashboardData.children && dashboardData.children.length > 0) {
          currentChildId = dashboardData.children[0].id;
          setChildId(currentChildId);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin học sinh.');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Lỗi tải thông tin học sinh:', error);
        Alert.alert('Lỗi', 'Không thể lấy thông tin học sinh.');
        setLoading(false);
        return;
      }
    }

    try {
      const data = await medicationService.getParentRequests(currentChildId);

      setRequests(data);
    } catch (error) {
      console.log('Lỗi tải danh sách dặn thuốc:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách dặn thuốc.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [childId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const filteredRequests = requests.filter(req => {
    return req.startDate <= selectedDateStr && req.endDate >= selectedDateStr;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#22c55e';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Đã hoàn thành';
      default: return 'Chờ duyệt / Đang xử lý';
    }
  };

  const renderItem = ({ item }: { item: MedicationResponse }) => (
    <View style={styles.card}>
      {item.allergies && item.allergies.length > 0 && (
        <View style={styles.allergyAlert}>
          <Ionicons name="warning" size={16} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.allergyText}>
            Lưu ý bé dị ứng với: {item.allergies.join(', ')}
          </Text>
        </View>
      )}
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={18} color="#64748b" />
          <Text style={styles.dateText}>
            {new Date(item.startDate).toLocaleDateString('vi-VN')} 
            {item.startDate !== item.endDate ? ` - ${new Date(item.endDate).toLocaleDateString('vi-VN')}` : ''}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>Thuốc: {item.medicationName}</Text>
        <Text style={styles.dosageText}>Liều lượng: {item.dosage}</Text>
      </View>
      {item.notes ? (
        <Text style={styles.reasonText}>Lời dặn: {item.notes}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử dặn thuốc</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistoryModal(true)}>
          <Ionicons name="calendar-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có đơn dặn thuốc nào trong ngày này.</Text>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateMedicationAdvice', { childId, onGoBack: loadRequests })}
      >
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày xem dặn thuốc</Text>
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
                todayTextColor: '#ef4444',
                arrowColor: '#ef4444'
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  historyButton: {
    padding: 8,
    marginRight: -8,
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
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
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
  listContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  allergyAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  allergyText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  medicationInfo: {
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  dosageText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
