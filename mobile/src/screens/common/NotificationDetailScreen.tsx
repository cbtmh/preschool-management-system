import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Notification, NotificationType } from '../../types/notification';

export default function NotificationDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const notification: Notification = route.params?.notification;

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[styles.content, styles.center]}>
          <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>Không thể tải thông báo này.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ALL: return 'megaphone';
      case NotificationType.CLASS: return 'school';
      case NotificationType.INDIVIDUAL: return 'person';
      default: return 'notifications';
    }
  };

  const getTypeName = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ALL: return 'Hệ thống';
      case NotificationType.CLASS: return 'Lớp học';
      case NotificationType.INDIVIDUAL: return 'Cá nhân';
      default: return 'Thông báo';
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ALL: return { bg: '#fee2e2', text: '#ef4444' };
      case NotificationType.CLASS: return { bg: '#d1fae5', text: '#10b981' };
      case NotificationType.INDIVIDUAL: return { bg: '#e0f2fe', text: '#0ea5e9' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const typeStyle = getTypeColor(notification.type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconHeaderContainer}>
          <View style={[styles.bigIconContainer, { backgroundColor: typeStyle.bg }]}>
            <Ionicons name={renderIcon(notification.type)} size={40} color={typeStyle.text} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: typeStyle.bg }]}>
            <Text style={[styles.categoryText, { color: typeStyle.text }]}>{getTypeName(notification.type)}</Text>
          </View>

          <Text style={styles.title}>{notification.title}</Text>
          
          <View style={styles.metaData}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={styles.metaText}>
                {new Date(notification.createdAt).toLocaleString('vi-VN')}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color="#64748b" />
              <Text style={styles.metaText}>
                Từ: {notification.senderName || 'Hệ thống'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.bodyText}>
            {notification.content}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  iconHeaderContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  bigIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 30,
    marginBottom: 16,
  },
  metaData: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
  }
});
