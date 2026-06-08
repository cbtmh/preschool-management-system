import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, ActivityIndicator, Image, RefreshControl,
  Linking, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { parentDashboardService, ParentDashboardResponse, ChildSummaryDTO } from '../../services/parentDashboard.service';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { API_URL } from '../../config/api';

export default function ParentHomeScreen() {
  const [data, setData] = useState<ParentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const navigation = useNavigation<any>();

  const greetingName = 'Phụ huynh';

  const loadData = async () => {
    try {
      const dashboardData = await parentDashboardService.getDashboardData();
      setData(dashboardData);
      if (dashboardData.children && dashboardData.children.length > 0 && selectedChildId === null) {
        setSelectedChildId(dashboardData.children[0].id);
      }
    } catch (error: any) {
      console.log('Error loading dashboard:', error);
      const msg = error.response?.data?.message || error.message;
      alert('Lỗi tải dữ liệu: ' + msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  const selectedChild = data?.children.find(c => c.id === selectedChildId);

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleCallTeacher = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi'));
  };

  const handleZaloTeacher = (phone: string) => {
    if (!phone) return;
    // Format Zalo URL
    Linking.openURL(`https://zalo.me/${phone}`).catch(() => Alert.alert('Lỗi', 'Không thể mở Zalo'));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (Fixed) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#0ea5e9" />
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Chào buổi sáng,</Text>
            <Text style={styles.parentName}>{greetingName} 👋</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Thông báo')}>
          <Ionicons name="notifications-outline" size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />}
      >
        {/* Child Selector */}
        {data && data.children && data.children.length > 0 && (
          <View style={styles.childSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.children.map((child: ChildSummaryDTO) => (
                <TouchableOpacity 
                  key={child.id} 
                  style={[
                    styles.childTab, 
                    selectedChildId === child.id && styles.childTabActive
                  ]}
                  onPress={() => setSelectedChildId(child.id)}
                >
                  <View style={styles.childAvatarPlaceholder}>
                    <Ionicons name="happy" size={20} color={selectedChildId === child.id ? '#fff' : '#64748b'} />
                  </View>
                  <Text style={[
                    styles.childTabName,
                    selectedChildId === child.id && styles.childTabNameActive
                  ]}>{child.fullName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Class & Teacher Card */}
        {selectedChild && selectedChild.teacher && (
          <View style={styles.teacherCard}>
            <View style={styles.teacherAvatarPlaceholder}>
               <Ionicons name="person-circle-outline" size={40} color="#0ea5e9" />
            </View>
            <View style={styles.teacherInfo}>
               <Text style={styles.classNameText}>Lớp: {selectedChild.className}</Text>
               <Text style={styles.teacherNameText}>GV: {selectedChild.teacher.fullName}</Text>
            </View>
            <View style={styles.teacherActions}>
               <TouchableOpacity 
                 style={[styles.actionCircleButton, { backgroundColor: '#dcfce7' }]} 
                 onPress={() => handleCallTeacher(selectedChild.teacher!.phoneNumber)}
               >
                 <Ionicons name="call" size={20} color="#22c55e" />
               </TouchableOpacity>
               <TouchableOpacity 
                 style={[styles.actionCircleButton, { backgroundColor: '#e0f2fe' }]}
                 onPress={() => handleZaloTeacher(selectedChild.teacher!.phoneNumber)}
               >
                 <Ionicons name="chatbubbles" size={20} color="#0ea5e9" />
               </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tiện ích nhanh</Text>
        </View>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('LeaveRequestList', { childId: selectedChildId })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="calendar-outline" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Xin nghỉ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('MedicationAdviceList', { childId: selectedChildId })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="medkit-outline" size={28} color="#ef4444" />
            </View>
            <Text style={styles.actionText}>Dặn thuốc</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ParentHealth')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="fitness-outline" size={28} color="#0ea5e9" />
            </View>
            <Text style={styles.actionText}>Sức khỏe</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ParentMealRegistration', { childId: selectedChildId })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#ecfeff' }]}>
              <Ionicons name="fast-food-outline" size={28} color="#06b6d4" />
            </View>
            <Text style={styles.actionText}>Đăng ký ăn</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('ParentMealMenu', { childId: selectedChildId })}
          >
            <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="restaurant-outline" size={28} color="#22c55e" />
            </View>
            <Text style={styles.actionText}>Thực đơn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bản tin nhà trường</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NewsList')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.newsContainer}>
          {data?.recentNews && data.recentNews.length > 0 ? (
            data.recentNews.map((item, index) => (
              <TouchableOpacity 
                key={item.id || index} 
                style={styles.newsCard}
                onPress={() => navigation.navigate('NewsDetail', { id: item.id })}
              >
                <View style={styles.newsImagePlaceholder}>
                  {item.imageUrl ? (
                    <Image source={{ uri: getImageUrl(item.imageUrl) as string }} style={styles.newsImage} />
                  ) : (
                    <Ionicons name="newspaper-outline" size={32} color="#94a3b8" />
                  )}
                </View>
                <View style={styles.newsContent}>
                  <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.newsDate}>
                    {new Date(item.publishedDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có bản tin nào.</Text>
          )}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  parentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  childSelectorContainer: {
    marginBottom: 24,
  },
  childTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  childTabActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  childAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  childTabName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  childTabNameActive: {
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  newsContainer: {
    gap: 12,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newsImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newsContent: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 10,
    fontStyle: 'italic',
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  teacherAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teacherInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  classNameText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  teacherNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  teacherActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
