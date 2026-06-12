import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/notification.service';
import { parentDashboardService } from '../../services/parentDashboard.service';
import { Notification, NotificationType } from '../../types/notification';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { decrementUnread, resetUnread } from '../../store/slices/notificationSlice';

export default function ParentNotificationScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SYSTEM' | 'CLASS'>('ALL');

  const fetchNotifications = async (pageNum = 0, isRefresh = false) => {
    try {
      if (pageNum === 0) setLoading(true);
      const data = await notificationService.getMyNotifications(pageNum, 20);
      
      if (isRefresh) {
        setNotifications(data.content);
      } else {
        setNotifications(prev => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications(0, true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(0, true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      dispatch(decrementUnread());
    } catch (error) {
      console.log('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      dispatch(resetUnread());
    } catch (error) {
      console.log('Error marking all as read:', error);
    }
  };

  const handleDelete = (id: number, isRead: boolean) => {
    Alert.alert(
      "Xóa thông báo",
      "Bạn có chắc chắn muốn xóa thông báo này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              await notificationService.deleteNotification(id);
              setNotifications(prev => prev.filter(n => n.id !== id));
              if (!isRead) {
                dispatch(decrementUnread());
              }
            } catch (error) {
              console.log('Error deleting notification:', error);
              Alert.alert("Lỗi", "Không thể xóa thông báo.");
            }
          }
        }
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Xóa tất cả",
      "Bạn có chắc chắn muốn xóa tất cả thông báo?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa tất cả", 
          style: "destructive",
          onPress: async () => {
            try {
              await notificationService.deleteAllNotifications();
              setNotifications([]);
              dispatch(resetUnread());
            } catch (error) {
              console.log('Error deleting all notifications:', error);
              Alert.alert("Lỗi", "Không thể xóa thông báo.");
            }
          }
        }
      ]
    );
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SYSTEM') return n.type === NotificationType.ALL;
    if (activeTab === 'CLASS') return n.type === NotificationType.CLASS;
    return true;
  });

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ALL: return 'megaphone';
      case NotificationType.CLASS: return 'school';
      case NotificationType.INDIVIDUAL: return 'person';
      default: return 'notifications';
    }
  };

  const renderRightActions = (item: Notification) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {!item.isRead && (
          <TouchableOpacity
            style={[styles.rightAction, { backgroundColor: '#0ea5e9', borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
            onPress={() => markAsRead(item.id)}
          >
            <Ionicons name="checkmark-done" size={24} color="#ffffff" />
            <Text style={styles.actionText}>Đã đọc</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.rightAction, { backgroundColor: '#ef4444', borderTopLeftRadius: item.isRead ? 12 : 0, borderBottomLeftRadius: item.isRead ? 12 : 0 }]}
          onPress={() => handleDelete(item.id, item.isRead)}
        >
          <Ionicons name="trash" size={24} color="#ffffff" />
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity 
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        onPress={async () => {
          if (!item.isRead) markAsRead(item.id);
          
          if (item.referenceType === 'INCIDENT' && item.referenceId) {
            try {
              // lấy childid vì màn hình chi tiết cần
              const dashboardData = await parentDashboardService.getDashboardData();
              if (dashboardData && dashboardData.children && dashboardData.children.length > 0) {
                const currentChildId = dashboardData.children[0].id;
                navigation.navigate('ParentIncidentDetail', { id: item.referenceId, childId: currentChildId });
                return;
              }
            } catch (error) {
              console.log('Error getting childId for deep link:', error);
            }
          }
          
          navigation.navigate('NotificationDetail', { notification: item });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={renderIcon(item.type)} size={24} color={item.isRead ? '#94a3b8' : '#0ea5e9'} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.senderText}>Từ: {item.senderName}</Text>
          </View>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={markAllAsRead} style={{ marginRight: 16 }}>
            <Ionicons name="checkmark-done-outline" size={24} color="#0ea5e9" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {(['ALL', 'SYSTEM', 'CLASS'] as const).map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'ALL' ? 'Tất cả' : tab === 'SYSTEM' ? 'Hệ thống' : 'Lớp học'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && page === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>Bạn đã xem hết thông báo mới!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0ea5e9']} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && page > 0 ? <ActivityIndicator color="#0ea5e9" style={{ margin: 20 }} /> : null}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: '#e0f2fe',
  },
  tabText: {
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0284c7',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  unreadText: {
    color: '#0369a1',
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  senderText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0ea5e9',
    position: 'absolute',
    top: 15,
    right: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#64748b',
  },
  rightAction: {
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  }
});
