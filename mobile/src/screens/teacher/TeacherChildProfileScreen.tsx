import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { teacherService } from '../../services/teacher.service';
import { ChildDetailResponse } from '../../types/teacher';

export default function TeacherChildProfileScreen({ route, navigation }: any) {
  const { childId } = route.params as { childId: number };
  
  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState<ChildDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChildDetails();
  }, [childId]);

  const fetchChildDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.getChildDetails(childId);
      setChildData(data);
    } catch (err: any) {
      setError('Không thể tải hồ sơ học sinh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCallParent = () => {
    if (childData?.parentPhone) {
      Linking.openURL(`tel:${childData.parentPhone}`).catch(() => {
        Alert.alert('Lỗi', 'Không thể mở ứng dụng gọi điện.');
      });
    } else {
      Alert.alert('Lỗi', 'Không có số điện thoại phụ huynh.');
    }
  };

  const calculateAge = (dob: string) => {
    const diff = Date.now() - new Date(dob).getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (error || !childData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy dữ liệu'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChildDetails}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ học sinh</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{childData.fullName.charAt(0)}</Text>
          </View>
          <Text style={styles.studentName}>{childData.fullName}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {childData.status === 'STUDYING' ? 'ĐANG HỌC' : childData.status}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>
                {new Date(childData.dob).toLocaleDateString('vi-VN')} ({calculateAge(childData.dob)} tuổi)
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>
                {childData.gender === 'MALE' ? 'Nam' : childData.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sức khỏe & Dị ứng</Text>
          {childData.healthNotes ? (
             <View style={styles.infoRow}>
                <Ionicons name="medical-outline" size={20} color="#64748b" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Ghi chú sức khỏe</Text>
                  <Text style={styles.infoValue}>{childData.healthNotes}</Text>
                </View>
             </View>
          ) : null}
          
          <View style={styles.infoRow}>
             <Ionicons name="warning-outline" size={20} color={childData.allergyDeclared ? "#ef4444" : "#64748b"} />
             <View style={styles.infoTextContainer}>
               <Text style={styles.infoLabel}>Tình trạng dị ứng</Text>
               <Text style={[styles.infoValue, childData.allergyDeclared && {color: '#ef4444'}]}>
                 {childData.allergyDeclared ? 'Có khai báo dị ứng' : 'Không có dị ứng'}
               </Text>
             </View>
          </View>

          {childData.allergies && childData.allergies.length > 0 && (
            <View style={styles.allergiesContainer}>
              {childData.allergies.map((allergy) => (
                <View key={allergy.id} style={styles.allergyItem}>
                  <Text style={styles.allergenText}>• {allergy.allergen}</Text>
                  <Text style={styles.allergyDesc}>Mức độ: {allergy.severity} - {allergy.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin phụ huynh</Text>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>{childData.parentName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{childData.parentPhone || 'Chưa cập nhật'}</Text>
            </View>
            {childData.parentPhone && (
               <TouchableOpacity style={styles.callButton} onPress={handleCallParent}>
                  <Ionicons name="call" size={20} color="#fff" />
               </TouchableOpacity>
            )}
          </View>
        </View>

      </ScrollView>
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
  profileCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergiesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  allergyItem: {
    marginBottom: 8,
  },
  allergenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  allergyDesc: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
    marginTop: 2,
  }
});
