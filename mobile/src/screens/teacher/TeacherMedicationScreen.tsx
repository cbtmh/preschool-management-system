import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { medicationService, MedicationResponse } from '../../services/medication.service';
import { teacherService } from '../../services/teacher.service';
import { Calendar } from 'react-native-calendars';

export default function TeacherMedicationScreen() {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<MedicationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [classId, setClassId] = useState<number | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    generateWeekDates(new Date());
  }, []);

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

  const dateStr = selectedDate.toISOString().split('T')[0];

  const loadData = async (dateStr: string) => {
    try {
      let currentClassId = classId;
      if (!currentClassId) {
        const me = await teacherService.getMe();
        const classes = await teacherService.getClassesByTeacherId(me.profile.teacherId);
        if (classes.length > 0) {
          currentClassId = classes[0].id;
          setClassId(currentClassId);
        } else {
          return;
        }
      }
      
      const data = await medicationService.getClassRequests(currentClassId, dateStr);
      setRequests(data);
    } catch (error) {
      console.log('Error fetching class medication requests:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách dặn thuốc');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData(dateStr).finally(() => setLoading(false));
    }, [dateStr])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(dateStr);
    setRefreshing(false);
  };

  const handleComplete = (id: number, childName: string) => {
    Alert.alert(
      'Xác nhận',
      `Xác nhận đã cho bé ${childName} uống thuốc?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              await medicationService.markAsCompleted(id);
              await loadData(dateStr);
              Alert.alert('Thành công', 'Đã cập nhật trạng thái dặn thuốc.');
            } catch (error) {
              console.log('Error completing medication:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý dặn thuốc</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistoryModal(true)}>
          <Ionicons name="calendar-outline" size={24} color="#0ea5e9" />
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

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Chờ uống</Text>
        </View>
        <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Đã uống</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0ea5e9"]} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 20 }} />
        ) : (
          <>
            {requests.map(request => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.childInfo}>
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={20} color="#64748b" />
                    </View>
                    <Text style={styles.childName}>{request.childFullName}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    request.status === 'COMPLETED' ? styles.statusBadgeSuccess : styles.statusBadgeWarning
                  ]}>
                    <Text style={[
                      styles.statusText,
                      request.status === 'COMPLETED' ? styles.statusTextSuccess : styles.statusTextWarning
                    ]}>
                      {request.status === 'COMPLETED' ? 'Đã uống' : 'Chờ uống'}
                    </Text>
                  </View>
                </View>

                {request.allergies && request.allergies.length > 0 && (
                  <View style={styles.allergyWarning}>
                    <Ionicons name="warning" size={16} color="#ef4444" />
                    <Text style={styles.allergyText}>
                      Dị ứng: {request.allergies.join(', ')}
                    </Text>
                  </View>
                )}

                <View style={styles.medicationDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="medkit-outline" size={18} color="#64748b" />
                    <Text style={styles.detailText}>Thuốc: <Text style={styles.detailValue}>{request.medicationName}</Text></Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="color-filter-outline" size={18} color="#64748b" />
                    <Text style={styles.detailText}>Liều lượng: <Text style={styles.detailValue}>{request.dosage}</Text></Text>
                  </View>
                  {request.notes ? (
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={18} color="#64748b" />
                      <Text style={styles.detailText}>Ghi chú: <Text style={styles.detailValue}>{request.notes}</Text></Text>
                    </View>
                  ) : null}
                </View>

                {request.status === 'PENDING' && (
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={() => handleComplete(request.id, request.childFullName)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Xác nhận đã uống</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {requests.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="medkit-outline" size={48} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyStateText}>Không có dặn thuốc nào trong ngày này.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

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
  dateButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  requestCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeWarning: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: '#15803d',
  },
  statusTextWarning: {
    color: '#b45309',
  },
  allergyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  allergyText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  medicationDetails: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontWeight: '500',
    color: '#0f172a',
  },
  confirmButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 15,
    textAlign: 'center',
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
