import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { teacherService } from '../../services/teacher.service';
import { MeResponse, SchoolClassResponse } from '../../types/teacher';

const { width } = Dimensions.get('window');

export default function TeacherHomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<MeResponse | null>(null);
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // lấy thông tin giáo viên
      const meData = await teacherService.getMe();

      if (!meData?.profile?.teacherId) {
        throw new Error("Teacher profile ID is missing");
      }
      setTeacherInfo(meData);

      // lấy danh sách lớp được phân công
      const classList = await teacherService.getClassesByTeacherId(meData.profile.teacherId);
      setClasses(classList);
      
      const years = Array.from(new Set(classList.map(c => c.academicYearName))).sort((a, b) => b.localeCompare(a));
      setAcademicYears(years);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch (err: any) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const filteredClasses = selectedYear ? classes.filter(c => c.academicYearName === selectedYear) : classes;
  const isHistorical = academicYears.length > 0 && selectedYear !== academicYears[0];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{teacherInfo?.profile.fullName || 'Giáo viên'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {teacherInfo?.profile.fullName ? teacherInfo.profile.fullName.charAt(0).toUpperCase() : 'T'}
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Tiện ích nhanh</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#f0fdf4' }]}
            onPress={() => navigation.navigate('Attendance')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#bbf7d0' }]}>
              <Text style={styles.iconText}>✅</Text>
            </View>
            <Text style={styles.actionTitle}>Điểm danh</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#eef2ff' }]}
            onPress={() => navigation.navigate('Daily Log')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#c7d2fe' }]}>
              <Text style={styles.iconText}>📝</Text>
            </View>
            <Text style={styles.actionTitle}>Hoạt động</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fff7ed', marginTop: 16 }]}
            onPress={() => navigation.navigate('TeacherMenu')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#ffedd5' }]}>
              <Text style={styles.iconText}>🍲</Text>
            </View>
            <Text style={styles.actionTitle}>Thực đơn</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fdf2f8', marginTop: 16 }]}
            onPress={() => navigation.navigate('TeacherMedication')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#fce7f3' }]}>
              <Text style={styles.iconText}>💊</Text>
            </View>
            <Text style={styles.actionTitle}>Dặn thuốc</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#fdfce8', marginTop: 16 }]}
            onPress={() => navigation.navigate('TeacherLeaveRequest')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#fef08a' }]}>
              <Text style={styles.iconText}>📩</Text>
            </View>
            <Text style={styles.actionTitle}>Đơn xin nghỉ</Text>
          </TouchableOpacity>
        </View>
        {academicYears.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearSelector} contentContainerStyle={styles.yearSelectorContent}>
            {academicYears.map(year => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearTab,
                  selectedYear === year && styles.yearTabActive
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[
                  styles.yearTabText,
                  selectedYear === year && styles.yearTabTextActive
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.classesHeader}>
          <Text style={styles.sectionTitle}>Lớp học của tôi</Text>
          <Text style={styles.classCount}>{filteredClasses.length} Lớp</Text>
        </View>

        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Bạn chưa được phân công lớp nào trong năm học này.</Text>
          </View>
        ) : (
          <View style={styles.classesContainer}>
            {filteredClasses.map((c) => (
              <View key={c.id} style={[styles.classCard, isHistorical && styles.classCardHistorical]}>
                <View style={styles.classCardTop}>
                  <Text style={[styles.className, isHistorical && styles.textHistorical]}>{c.name}</Text>
                  <View style={[styles.badge, isHistorical && styles.badgeHistorical]}>
                    <Text style={[styles.badgeText, isHistorical && styles.badgeTextHistorical]}>
                      {isHistorical ? 'Đã kết thúc' : c.ageGroup}
                    </Text>
                  </View>
                </View>
                <View style={styles.classCardBottom}>
                  <Text style={styles.academicYear}>{c.academicYearName}</Text>
                  <TouchableOpacity 
                    style={[styles.viewButton, isHistorical && styles.viewButtonHistorical]}
                    onPress={() => navigation.navigate('ClassDetails', { classInfo: c })}
                  >
                    <Text style={[styles.viewButtonText, isHistorical && styles.viewButtonTextHistorical]}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 30,
  },
  actionCard: {
    width: (width - 60) / 3, // điều chỉnh độ rộng
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  classesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  classCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  classesContainer: {
    gap: 16,
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  classCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  classCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  academicYear: {
    fontSize: 14,
    color: '#64748b',
  },
  viewButton: {
    backgroundColor: '#fff1f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#e11d48',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 15,
  },
  yearSelector: {
    marginBottom: 20,
    maxHeight: 40,
  },
  yearSelectorContent: {
    paddingRight: 20, // thêm khoảng trống để item cuối không bị sát lề
  },
  yearTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  yearTabActive: {
    backgroundColor: '#0f172a',
  },
  yearTabText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  yearTabTextActive: {
    color: '#ffffff',
  },
  classCardHistorical: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  textHistorical: {
    color: '#64748b',
  },
  badgeHistorical: {
    backgroundColor: '#e2e8f0',
  },
  badgeTextHistorical: {
    color: '#64748b',
  },
  viewButtonHistorical: {
    backgroundColor: '#f1f5f9',
  },
  viewButtonTextHistorical: {
    color: '#475569',
  },
});
