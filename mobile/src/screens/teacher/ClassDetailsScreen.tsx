import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { teacherService } from '../../services/teacher.service';
import { EnrollmentResponse, ClassTeacherResponse, SchoolClassResponse } from '../../types/teacher';

export default function ClassDetailsScreen({ route, navigation }: any) {
  const { classInfo } = route.params as { classInfo: SchoolClassResponse };
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<EnrollmentResponse[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<EnrollmentResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classData, setClassData] = useState<ClassTeacherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassDetails();
  }, []);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teachersRes, studentsRes] = await Promise.all([
        teacherService.getTeachersInClass(classInfo.id),
        teacherService.getStudentsInClass(classInfo.id)
      ]);
      
      setClassData(teachersRes);
      
      // chỉ lấy học sinh đang học
      const studyingStudents = studentsRes.filter(s => s.status === 'STUDYING');
      setStudents(studyingStudents);
      setFilteredStudents(studyingStudents);
      
    } catch (err: any) {
      setError('Không thể tải chi tiết lớp học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const lowercasedText = text.toLowerCase();
      const filtered = students.filter(student => 
        student.childName.toLowerCase().includes(lowercasedText)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchClassDetails}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.classInfoCard}>
        <Text style={styles.className}>{classInfo.name}</Text>
        <View style={styles.classMeta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{classInfo.ageGroup}</Text>
          </View>
          <Text style={styles.academicYear}>{classInfo.academicYearName}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Giáo viên phụ trách</Text>
      <View style={styles.teachersContainer}>
        {classData?.teachers.map((teacher) => (
          <View key={teacher.teacherId} style={styles.teacherCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{teacher.fullName.charAt(0)}</Text>
            </View>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{teacher.fullName}</Text>
              <Text style={styles.teacherPhone}>{teacher.phone}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.studentsHeader}>
        <Text style={styles.sectionTitle}>Học sinh</Text>
        <Text style={styles.studentCount}>Tổng cộng {filteredStudents.length}</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tên học sinh..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#94a3b8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStudentCard = ({ item }: { item: EnrollmentResponse }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      onPress={() => navigation.navigate('TeacherChildProfile', { childId: item.childId })}
    >
      <View style={styles.studentAvatar}>
        <Text style={styles.studentAvatarText}>{item.childName.charAt(0)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.childName}</Text>
        <Text style={styles.enrollmentDate}>
          Nhập học: {new Date(item.enrollmentDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết lớp học</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStudentCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Không tìm thấy học sinh nào.</Text>
        )}
      />
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
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listHeaderContainer: {
    marginBottom: 8,
  },
  classInfoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  classMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  academicYear: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  teachersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#4f46e5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  teacherPhone: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#0f172a',
  },
  clearSearchButton: {
    padding: 4,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  enrollmentDate: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
    marginTop: 20,
  }
});
