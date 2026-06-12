import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { healthService, ChildHealthSummaryDto } from '../../services/health.service';
import { teacherService } from '../../services/teacher.service';
import { Calendar } from 'react-native-calendars';

export default function TeacherHealthScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<ChildHealthSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState<{year: number, month: number}>({ 
    year: new Date().getFullYear(), 
    month: new Date().getMonth() + 1 
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const loadData = async () => {
    try {
      const me = await teacherService.getMe();
      const classes = await teacherService.getClassesByTeacherId(me.profile.teacherId);
      
      if (classes.length > 0) {
        const classId = classes[0].id;
        const data = await healthService.getClassHealthSummary(classId, selectedMonth.year, selectedMonth.month);
        setStudents(data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.log('Error fetching class health summary:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sức khỏe');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, [selectedMonth])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updatedCount = students.filter(s => s.hasRecord).length;
  const totalCount = students.length;
  const missingCount = totalCount - updatedCount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sức khỏe lớp</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistoryModal(true)}>
          <Ionicons name="calendar-outline" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm học sinh..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{updatedCount}/{totalCount}</Text>
          <Text style={styles.statLabel}>Đã cập nhật T{selectedMonth.month}</Text>
        </View>
        <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{missingCount}</Text>
          <Text style={styles.statLabel}>Chưa cập nhật</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0ea5e9"]} />
        }
      >
        <Text style={styles.sectionTitle}>Danh sách học sinh</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 20 }} />
        ) : (
          <>
            {filteredStudents.map(student => (
              <TouchableOpacity 
                key={student.id} 
                style={styles.studentCard}
                onPress={() => navigation.navigate('TeacherUpdateHealth', { student })}
              >
                <View style={styles.studentInfo}>
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={20} color="#64748b" />
                  </View>
                  <View>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.lastUpdate}>
                      Lần cuối: {student.lastRecord ? new Date(student.lastRecord).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.actionContainer}>
                  <View style={[
                    styles.statusBadge, 
                    student.hasRecord ? styles.statusBadgeSuccess : styles.statusBadgeWarning
                  ]}>
                    <Text style={[
                      styles.statusText,
                      student.hasRecord ? styles.statusTextSuccess : styles.statusTextWarning
                    ]}>{student.status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={styles.chevron} />
                </View>
              </TouchableOpacity>
            ))}

            {filteredStudents.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateText}>Không tìm thấy học sinh nào.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn tháng báo cáo</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={`${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-01`}
              onDayPress={(day: any) => {
                setSelectedMonth({ year: day.year, month: day.month });
                setShowHistoryModal(false);
              }}
              onMonthChange={(month: any) => {

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
  historyButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#0f172a',
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
    color: '#10b981',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  chevron: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    color: '#94a3b8',
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
