import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { incidentService, IncidentReportResponse, SeverityLevel } from '../../services/incident.service';

export default function ParentIncidentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id, childId } = route.params || {};

  const [incident, setIncident] = useState<IncidentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && childId) {
      loadDetail();
    }
  }, [id, childId]);

  const loadDetail = async () => {
    try {
      const data = await incidentService.getParentIncidentDetail(id, childId);
      setIncident(data);
    } catch (error) {
      console.log('Error fetching parent incident detail:', error);
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Sự việc</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.alertBanner, incident.status === 'IN_PROGRESS' && { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
          <Ionicons name={incident.status === 'IN_PROGRESS' ? "sync-circle" : "shield-checkmark"} size={24} color={incident.status === 'IN_PROGRESS' ? "#f59e0b" : "#10b981"} />
          <Text style={[styles.alertBannerText, incident.status === 'IN_PROGRESS' && { color: '#b45309' }]}>
            {incident.status === 'IN_PROGRESS' 
              ? 'Sự việc đang được nhà trường tích cực xử lý. Dưới đây là thông tin chi tiết ban đầu.' 
              : 'Sự việc đã được nhà trường kiểm tra và giải quyết. Dưới đây là thông tin chi tiết.'}
          </Text>
        </View>

        {/* Title and Info */}
        <View style={styles.section}>
          <Text style={styles.title} selectable>{incident.title}</Text>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoValue}>
              {new Date(incident.incidentTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={20} color={getSeverityColor(incident.severityLevel)} />
            <Text style={styles.infoLabel}>Mức độ:</Text>
            <Text style={[styles.infoValue, { color: getSeverityColor(incident.severityLevel), fontWeight: '600' }]}>
              {getSeverityText(incident.severityLevel)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#64748b" />
            <Text style={styles.infoLabel}>Lớp:</Text>
            <Text style={styles.infoValue}>{incident.className}</Text>
          </View>
        </View>

        {/* Involved Children (Masked) */}
        {incident.involvedChildren && incident.involvedChildren.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Các bé liên quan</Text>
            <View style={styles.childrenList}>
              {incident.involvedChildren.map((c, index) => (
                <View key={index} style={styles.childItem}>
                  <Ionicons 
                    name={c.childFullName === 'Một bé khác' ? "person-outline" : "person-circle"} 
                    size={24} 
                    color={c.childFullName === 'Một bé khác' ? "#94a3b8" : "#0ea5e9"} 
                  />
                  <Text style={[
                    styles.childName, 
                    c.childFullName === 'Một bé khác' && { color: '#64748b', fontStyle: 'italic' }
                  ]}>
                    {c.childFullName}
                  </Text>
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

        {/* Description from Teacher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tường trình từ Giáo viên</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText} selectable>{incident.description}</Text>
          </View>
        </View>

        {/* Initial Handling */}
        {incident.initialHandling ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cách xử lý ban đầu</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText} selectable>{incident.initialHandling}</Text>
            </View>
          </View>
        ) : null}

        {/* Attached Images */}
        {incident.imageUrls && incident.imageUrls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hình ảnh đính kèm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
              {incident.imageUrls.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.attachedImage} />
              ))}
            </ScrollView>
            <Text style={styles.teacherNote}>Người báo cáo: {incident.reportedByTeacherName}</Text>
          </View>
        )}
        
        {(!incident.imageUrls || incident.imageUrls.length === 0) && (
          <View style={{alignItems: 'flex-end', paddingHorizontal: 16}}>
            <Text style={styles.teacherNote}>Người báo cáo: {incident.reportedByTeacherName}</Text>
          </View>
        )}

        {/* Principal Notes */}
        {incident.principalNotes && (
          <View style={[styles.section, styles.principalSection]}>
            <Text style={[styles.sectionTitle, { color: '#0ea5e9' }]}>Kết luận & Hướng xử lý từ Nhà trường</Text>
            <View style={styles.principalBox}>
              <Text style={styles.principalText} selectable>{incident.principalNotes}</Text>
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  alertBannerText: {
    flex: 1,
    marginLeft: 12,
    color: '#065f46',
    fontSize: 14,
    lineHeight: 20,
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
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
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
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  descriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  teacherNote: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  principalSection: {
    borderColor: '#bae6fd',
    borderWidth: 1,
    backgroundColor: '#f0f9ff',
  },
  principalBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
  },
  principalText: {
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 24,
    fontWeight: '500',
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
