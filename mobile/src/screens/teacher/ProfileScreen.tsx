import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { teacherService } from '../../services/teacher.service';
import { MeResponse } from '../../types/teacher';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [userProfile, setUserProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getMe();
      setUserProfile(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser() as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin.</Text>
      </View>
    );
  }

  const { profile, username, role } = userProfile;
  const initial = profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'T';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Background */}
        <View style={styles.headerBackground}>
          <View style={styles.headerDecoration1} />
          <View style={styles.headerDecoration2} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            </View>
          </View>
          
          <Text style={styles.userName}>{profile?.fullName || 'Tên giáo viên'}</Text>
          <Text style={styles.userRole}>{role === 'TEACHER' ? 'Giáo viên' : role}</Text>
          <View style={styles.usernameContainer}>
            <Ionicons name="call-outline" size={14} color="#64748b" />
            <Text style={styles.usernameText}>{username}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditTeacherProfile', { profile: userProfile })}>
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <InfoRow icon="person-outline" label="Họ và tên" value={profile?.fullName} />
            <View style={styles.divider} />
            <InfoRow icon="call-outline" label="Số điện thoại" value={username} />
            <View style={styles.divider} />
            <InfoRow icon="location-outline" label="Địa chỉ" value={profile?.address} noBorder />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.infoCard}>
            <ActionRow icon="lock-closed-outline" label="Đổi mật khẩu" onPress={() => navigation.navigate('ChangePassword')} />
            <View style={styles.divider} />
            <ActionRow icon="notifications-outline" label="Cài đặt thông báo" onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')} />
            <View style={styles.divider} />
            <ActionRow icon="help-circle-outline" label="Trợ giúp & Hỗ trợ" onPress={() => navigation.navigate('HelpSupport')} noBorder />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value, noBorder }: { icon: any, label: string, value?: string, noBorder?: boolean }) => (
  <View style={[styles.infoRow, noBorder && { borderBottomWidth: 0 }]}>
    <View style={styles.infoIconContainer}>
      <Ionicons name={icon} size={20} color="#3b82f6" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value || '---'}</Text>
    </View>
  </View>
);

const ActionRow = ({ icon, label, onPress, noBorder }: { icon: any, label: string, onPress: () => void, noBorder?: boolean }) => (
  <TouchableOpacity style={[styles.actionRow, noBorder && { borderBottomWidth: 0 }]} onPress={onPress}>
    <View style={styles.infoIconContainer}>
      <Ionicons name={icon} size={20} color="#475569" />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  headerBackground: {
    height: 180,
    backgroundColor: '#3b82f6',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  headerDecoration1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerDecoration2: {
    position: 'absolute',
    top: 50,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 100,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  userRole: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 10,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  usernameText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  editButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 52,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
  }
});
