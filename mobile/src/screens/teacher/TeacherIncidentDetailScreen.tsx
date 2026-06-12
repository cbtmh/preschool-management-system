import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { incidentService, IncidentReportResponse, IncidentStatus, SeverityLevel } from '../../services/incident.service';

export default function TeacherIncidentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};

  const [incident, setIncident] = useState<IncidentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  const loadDetail = async () => {
    try {
      const data = await incidentService.getTeacherIncidentDetail(id);
      setIncident(data);
    } catch (error) {
      console.log('Error fetching incident detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW': return '#eab308';
      case 'IN_PROGRESS': return '#f97316';
      case 'RESOLVED': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW': return 'Chờ duyệt';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Đã giải quyết';
      default: return status;
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'MILD': return '#3b82f6';
      case 'MODERATE': return '#f59e0b';
      case 'SEVERE': return '#ef4444';
      case 'CRITICAL': return '#b91c1c';
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#64748b' }}>Không tìm thấy thông tin sự việc</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Sự việc</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={styles.title} selectable>{incident.title}</Text>
          </View>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(incident.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(incident.status) }]}>
                Trạng thái: {getStatusText(incident.status)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getSeverityColor(incident.severityLevel) + '20' }]}>
              <Text style={[styles.badgeText, { color: getSeverityColor(incident.severityLevel) }]}>
                Mức độ: {getSeverityText(incident.severityLevel)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoValue}>
              {new Date(incident.incidentTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Lớp:</Text>
            <Text style={styles.infoValue}>{incident.className}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Người báo cáo:</Text>
            <Text style={styles.infoValue}>{incident.reportedByTeacherName}</Text>
          </View>
        </View>
        {incident.involvedChildren && incident.involvedChildren.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Học sinh liên quan</Text>
            <View style={styles.childrenList}>
              {incident.involvedChildren.map(c => (
                <View key={c.childId} style={styles.childItem}>
                  <Ionicons name="person-circle-outline" size={24} color="#64748b" />
                  <Text style={styles.childName}>{c.childFullName}</Text>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>
                      {c.role === 'VICTIM' ? 'Nạn nhân' : c.role === 'CAUSER' ? 'Gây ra' : 'Liên quan'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung tường trình</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText} selectable>{incident.description}</Text>
          </View>
        </View>
        {incident.initialHandling ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cách xử lý ban đầu</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText} selectable>{incident.initialHandling}</Text>
            </View>
          </View>
        ) : null}
        {incident.imageUrls && incident.imageUrls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hình ảnh đính kèm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
              {incident.imageUrls.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.attachedImage} />
              ))}
            </ScrollView>
          </View>
        )}
        {incident.principalNotes ? (
          <View style={[styles.section, styles.principalSection]}>
            <Text style={[styles.sectionTitle, { color: '#0ea5e9' }]}>Hướng xử lý từ Ban Giám Hiệu</Text>
            <View style={styles.principalBox}>
              <Text style={styles.principalText} selectable>{incident.principalNotes}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.pendingBox}>
              <Ionicons name="information-circle-outline" size={20} color="#eab308" />
              <Text style={styles.pendingText}>Ban Giám Hiệu đang xem xét bản tường trình này.</Text>
            </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    flex: 1,
  },
  childrenList: {
    gap: 8,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
  },
  childName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
    flex: 1,
    marginLeft: 10,
  },
  roleTag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  principalSection: {
    borderColor: '#bae6fd',
    borderWidth: 1,
    backgroundColor: '#f0f9ff',
  },
  principalBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
  },
  principalText: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 24,
    fontWeight: '500',
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fefce8',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  pendingText: {
    fontSize: 14,
    color: '#a16207',
    marginLeft: 8,
    flex: 1,
  },
  imageGallery: {
    flexDirection: 'row',
  },
  attachedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
  }
});
