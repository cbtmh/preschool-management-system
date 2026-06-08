import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { healthService, HealthRecordDto } from '../../services/health.service';
import { parentDashboardService, ChildSummaryDTO } from '../../services/parentDashboard.service';

export default function ParentHealthScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [records, setRecords] = useState<HealthRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childId, setChildId] = useState<number | null>(route.params?.childId || null);
  const [currentChild, setCurrentChild] = useState<ChildSummaryDTO | null>(null);



  const loadRecords = async () => {
    let currentChildId = childId;
    let foundChild = null;

    try {
      const dashboardData = await parentDashboardService.getDashboardData();
      if (dashboardData.children && dashboardData.children.length > 0) {
        if (!currentChildId) {
          currentChildId = dashboardData.children[0].id;
          setChildId(currentChildId);
        }
        foundChild = dashboardData.children.find(c => c.id === currentChildId) || dashboardData.children[0];
        setCurrentChild(foundChild);
        

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

    try {
      const data = await healthService.getHealthRecordsByChildId(currentChildId);
      setRecords(data);
    } catch (error) {
      console.log('Lỗi tải danh sách sức khỏe:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử sức khỏe.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  useEffect(() => {
    loadRecords();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  const latestRecord = records.length > 0 ? records[0] : null;

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
        <Text style={styles.headerTitle}>Sức khỏe của trẻ</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />
          }
        >
          {latestRecord ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="fitness" size={24} color="#0ea5e9" />
                <Text style={styles.summaryTitle}>Chỉ số gần nhất</Text>
              </View>
              <View style={styles.summaryData}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Chiều cao</Text>
                  <Text style={styles.dataValue}>{latestRecord.height} <Text style={styles.dataUnit}>cm</Text></Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Cân nặng</Text>
                  <Text style={styles.dataValue}>{latestRecord.weight} <Text style={styles.dataUnit}>kg</Text></Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusText, { color: latestRecord.status === 'Bình thường' ? '#15803d' : '#b45309' }]}>
                  {latestRecord.status}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.summaryCard}>
              <Text style={{ textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu sức khỏe nào.</Text>
            </View>
          )}



          <Text style={styles.sectionTitle}>Lịch sử sức khỏe</Text>

          {records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordMonth}>{record.month}</Text>
                <Text style={styles.recordDate}>Đo ngày: {new Date(record.recordedDate).toLocaleDateString('vi-VN')}</Text>
              </View>
              
              <View style={styles.recordBody}>
                <View style={styles.indicatorRow}>
                  <Ionicons name="resize" size={16} color="#64748b" />
                  <Text style={styles.indicatorText}>Chiều cao: <Text style={styles.indicatorValue}>{record.height} cm</Text></Text>
                </View>
                <View style={styles.indicatorRow}>
                  <Ionicons name="scale" size={16} color="#64748b" />
                  <Text style={styles.indicatorText}>Cân nặng: <Text style={styles.indicatorValue}>{record.weight} kg</Text></Text>
                </View>
              </View>

              {record.note ? (
                <View style={styles.noteBox}>
                  <Text style={styles.noteLabel}>Nhận xét của giáo viên:</Text>
                  <Text style={styles.noteText}>{record.note}</Text>
                </View>
              ) : null}
            </View>
          ))}

          {records.length === 0 && !latestRecord && (
             <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>Không có lịch sử nào.</Text>
          )}

        </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  summaryData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dataUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#64748b',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  statusBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 8,
  },
  recordMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  recordDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  recordBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#475569',
  },
  indicatorValue: {
    fontWeight: '600',
    color: '#0f172a',
  },
  noteBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },

});
