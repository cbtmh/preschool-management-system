import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  const handleCall = () => Linking.openURL('tel:0943350520');
  const handleEmail = () => Linking.openURL('mailto:anhvu2310lva@gmail.com?subject=Hỗ trợ App Giáo Viên');
  const handleZalo = () => Linking.openURL('https://zalo.me/0943350520');
  const handleTutorial = () => Linking.openURL('https://youtube.com/');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tự phục vụ */}
        <Text style={styles.sectionTitle}>TỰ TÌM HIỂU</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="help-circle-outline" 
            title="Câu hỏi thường gặp (FAQ)" 
            onPress={() => {}} 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="book-outline" 
            title="Hướng dẫn sử dụng" 
            onPress={handleTutorial} 
            noBorder 
          />
        </View>

        {/* Liên hệ trực tiếp */}
        <Text style={styles.sectionTitle}>LIÊN HỆ VỚI CHÚNG TÔI</Text>
        <View style={styles.card}>
          <SettingItem 
            icon="call-outline" 
            title="Gọi Hotline hỗ trợ" 
            subtitle="0943350520"
            onPress={handleCall} 
            iconColor="#10b981"
            iconBg="#d1fae5"
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="chatbubble-ellipses-outline" 
            title="Chat qua Zalo" 
            onPress={handleZalo} 
            iconColor="#3b82f6"
            iconBg="#dbeafe"
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="mail-outline" 
            title="Gửi Email phản hồi" 
            onPress={handleEmail} 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="bug-outline" 
            title="Báo cáo lỗi ứng dụng" 
            onPress={() => {}} 
            noBorder 
            iconColor="#ef4444"
            iconBg="#fee2e2"
          />
        </View>

        {/* Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Ứng dụng Quản lý Mầm non</Text>
          <Text style={styles.footerText}>Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingItem = ({ icon, title, subtitle, onPress, noBorder, iconColor = "#475569", iconBg = "#f1f5f9" }: any) => (
  <TouchableOpacity style={[styles.itemContainer, noBorder && { borderBottomWidth: 0 }]} onPress={onPress}>
    <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

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
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 52,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 4,
  }
});
