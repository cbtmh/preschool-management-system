import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { teacherService } from '../../services/teacher.service';
import { leaveRequestService, LeaveRequestResponse } from '../../services/leaveRequest.service';
import { SchoolClassResponse } from '../../types/teacher';

export default function TeacherLeaveRequestScreen() {
  const navigation = useNavigation();
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<SchoolClassResponse | null>(null);
  const [requests, setRequests] = useState<LeaveRequestResponse[]>([]);
  
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const me = await teacherService.getMe();
      if (!me?.profile?.teacherId) throw new Error("Không tìm thấy thông tin giáo viên");
      
      const fetchedClasses = await teacherService.getClassesByTeacherId(me.profile.teacherId);
      setClasses(fetchedClasses);
      
      const years = Array.from(new Set(fetchedClasses.map(c => c.academicYearName))).sort((a, b) => b.localeCompare(a));
      setAcademicYears(years);
      
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học');
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      const filtered = classes.filter(c => c.academicYearName === selectedYear);
      if (filtered.length > 0) {
        setSelectedClass(filtered[0]);
      } else {
        setSelectedClass(null);
      }
    }
  }, [selectedYear, classes]);

  const loadRequests = async () => {
    if (!selectedClass) return;
    try {
      setLoadingRequests(true);
      const fetchedRequests = await leaveRequestService.getClassRequests(selectedClass.id);
      setRequests(fetchedRequests);
    } catch (e) {
      console.log('Lỗi tải danh sách đơn:', e);
      // backend có thể chưa có dữ liệu hoặc lỗi
      setRequests([]);
    } finally {
      setLoadingRequests(false);
      setRefreshing(false);
    }
  };

  // tự động tải dữ liệu
  useFocusEffect(
    useCallback(() => {
      if (selectedClass) {
        loadRequests();
      }
    }, [selectedClass])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await leaveRequestService.updateStatus(id, status);
      Alert.alert('Thành công', status === 'APPROVED' ? 'Đã duyệt đơn' : 'Đã từ chối đơn');
      loadRequests(); // tải lại danh sách
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const confirmUpdateStatus = (id: number, status: 'APPROVED' | 'REJECTED') => {
    const actionText = status === 'APPROVED' ? 'duyệt' : 'từ chối';
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${actionText} đơn xin nghỉ này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: () => handleUpdateStatus(id, status) }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      default: return status;
    }
  };

  const filteredClasses = selectedYear ? classes.filter(c => c.academicYearName === selectedYear) : classes;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn xin nghỉ học</Text>
        <View style={{ width: 32 }} />
      </View>

      {loadingClasses ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <>
          <View style={styles.selectorContainer}>
            {academicYears.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearSelector} contentContainerStyle={styles.selectorContent}>
                {academicYears.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[styles.yearTab, selectedYear === year && styles.yearTabActive]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[styles.yearTabText, selectedYear === year && styles.yearTabTextActive]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {filteredClasses.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classSelector} contentContainerStyle={styles.selectorContent}>
                {filteredClasses.map(cls => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[styles.classTab, selectedClass?.id === cls.id && styles.classTabActive]}
                    onPress={() => setSelectedClass(cls)}
                  >
                    <Text style={[styles.classTabText, selectedClass?.id === cls.id && styles.classTabTextActive]}>
                      {cls.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noClassText}>Bạn chưa được phân công lớp nào trong năm học này</Text>
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f59e0b']} />}
          >
            {loadingRequests && !refreshing ? (
              <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 40 }} />
            ) : requests.length > 0 ? (
              requests.map(request => (
                <View key={request.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.studentInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{request.childFullName.charAt(0)}</Text>
                      </View>
                      <Text style={styles.studentName} numberOfLines={1}>{request.childFullName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '15' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                        {getStatusText(request.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#64748b" />
                      <Text style={styles.infoLabel}>Thời gian:</Text>
                      <Text style={styles.infoValue}>
                        {request.startDate === request.endDate
                          ? formatDate(request.startDate)
                          : `${formatDate(request.startDate)} - ${formatDate(request.endDate)}`}
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Ionicons name="document-text-outline" size={16} color="#64748b" />
                      <Text style={styles.infoLabel}>Lý do:</Text>
                      <Text style={styles.infoValue}>{request.reason}</Text>
                    </View>
                  </View>

                  {request.status === 'PENDING' && (
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => confirmUpdateStatus(request.id, 'REJECTED')}
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#ef4444" style={{marginRight: 4}} />
                        <Text style={styles.rejectBtnText}>Từ chối</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => confirmUpdateStatus(request.id, 'APPROVED')}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" style={{marginRight: 4}} />
                        <Text style={styles.approveBtnText}>Duyệt đơn</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="mail-unread-outline" size={48} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyText}>Chưa có đơn xin nghỉ nào trong lớp này</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  selectorContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectorContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
  },
  yearSelector: {
    maxHeight: 45,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  yearTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  yearTabActive: {
    backgroundColor: '#334155',
  },
  yearTabText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
  },
  yearTabTextActive: {
    color: '#ffffff',
  },
  classSelector: {
    maxHeight: 50,
    paddingVertical: 8,
  },
  classTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  classTabActive: {
    backgroundColor: '#f59e0b',
  },
  classTabText: {
    color: '#64748b',
    fontWeight: '500',
  },
  classTabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  noClassText: {
    padding: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#d97706',
    fontWeight: 'bold',
    fontSize: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
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
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  rejectBtnText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  approveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
