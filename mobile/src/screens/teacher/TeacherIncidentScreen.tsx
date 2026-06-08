import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { incidentService, IncidentReportResponse, IncidentStatus, SeverityLevel } from '../../services/incident.service';
import { Calendar } from 'react-native-calendars';

export default function TeacherIncidentScreen() {
  const navigation = useNavigation<any>();
  const [incidents, setIncidents] = useState<IncidentReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Date selection states
  const [date, setDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    generateWeekDates(date);
  }, []);

  const generateWeekDates = (baseDate: Date) => {
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date(baseDate).setDate(diff));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    setWeekDates(dates);
  };

  const loadData = async () => {
    try {
      const data = await incidentService.getTeacherIncidents();
      setIncidents(data);
    } catch (error) {
      console.log('Error fetching incidents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW': return '#eab308'; // yellow
      case 'IN_PROGRESS': return '#f97316'; // orange
      case 'RESOLVED': return '#22c55e'; // green
      default: return '#64748b';
    }
  };

  const getStatusText = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW': return 'Chờ BGH duyệt';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã giải quyết';
      default: return status;
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'MILD': return '#3b82f6'; // blue
      case 'MODERATE': return '#f59e0b'; // amber
      case 'SEVERE': return '#ef4444'; // red
      case 'CRITICAL': return '#b91c1c'; // dark red
      default: return '#64748b';
    }
  };

  const getSeverityText = (severity: SeverityLevel) => {
    switch (severity) {
      case 'MILD': return 'Nhẹ';
      case 'MODERATE': return 'Vừa';
      case 'SEVERE': return 'Nghiêm trọng';
      case 'CRITICAL': return 'Khẩn cấp';
      default: return severity;
    }
  };

  // Filter incidents by selected date
  const filteredIncidents = incidents.filter(incident => {
    const incidentDate = new Date(incident.incidentTime);
    return incidentDate.getDate() === date.getDate() && 
           incidentDate.getMonth() === date.getMonth() && 
           incidentDate.getFullYear() === date.getFullYear();
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tường trình sự việc</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowHistoryModal(true)}>
            <Ionicons name="calendar-outline" size={24} color="#0ea5e9" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('TeacherCreateIncident')}
          >
            <Ionicons name="add" size={26} color="#0ea5e9" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {weekDates.map((d, index) => {
            const isSelected = d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            return (
              <TouchableOpacity 
                key={index}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setDate(d)}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
                  {dayNames[d.getDay()]}
                </Text>
                <Text style={[styles.dateNumber, isSelected && styles.dateTextActive]}>
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 40 }} />
        ) : filteredIncidents.length > 0 ? (
          filteredIncidents.map(incident => (
            <TouchableOpacity 
              key={incident.id} 
              style={styles.card}
              onPress={() => navigation.navigate('TeacherIncidentDetail', { id: incident.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{incident.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
                    {getStatusText(incident.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.infoText}>
                  {new Date(incident.incidentTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="warning-outline" size={16} color={getSeverityColor(incident.severityLevel)} />
                <Text style={[styles.infoText, { color: getSeverityColor(incident.severityLevel), fontWeight: '500' }]}>
                  Mức độ: {getSeverityText(incident.severityLevel)}
                </Text>
              </View>

              {incident.involvedChildren && incident.involvedChildren.length > 0 && (
                <View style={styles.involvedContainer}>
                  <Text style={styles.involvedLabel}>Liên quan:</Text>
                  <Text style={styles.involvedNames} numberOfLines={1}>
                    {incident.involvedChildren.map(c => c.childFullName).join(', ')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyText}>Chưa có bản tường trình nào trong ngày này</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => navigation.navigate('TeacherCreateIncident')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#ffffff" style={{marginRight: 8}} />
              <Text style={styles.addBtnText}>Tạo tường trình mới</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showHistoryModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày xem tường trình</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={date.toISOString().split('T')[0]}
              onDayPress={(day: any) => {
                const newDate = new Date(day.timestamp + new Date().getTimezoneOffset() * 60000);
                setDate(newDate);
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBtn: {
    padding: 4,
  },
  addButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateSelectorContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateCard: {
    width: 50,
    height: 60,
    borderRadius: 12,
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
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
  },
  involvedContainer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  involvedLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 6,
  },
  involvedNames: {
    fontSize: 13,
    color: '#0f172a',
    flex: 1,
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
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  addBtn: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});
