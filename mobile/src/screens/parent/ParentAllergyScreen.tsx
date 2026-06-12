import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { healthService, AllergyRequest } from '../../services/health.service';
import { parentDashboardService, ChildSummaryDTO } from '../../services/parentDashboard.service';

export default function ParentAllergyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childId, setChildId] = useState<number | null>(route.params?.childId || null);
  const [currentChild, setCurrentChild] = useState<ChildSummaryDTO | null>(null);


  const [showAllergyModal, setShowAllergyModal] = useState(route.params?.showAllergyModal || false);
  const [allergyDeclared, setAllergyDeclared] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState<AllergyRequest[]>([]);
  const [savingAllergy, setSavingAllergy] = useState(false);

  const loadData = async () => {
    let currentChildId = childId;
    let foundChild = null;

    try {
      const dashboardData = await parentDashboardService.getDashboardData();
      if (dashboardData.children && dashboardData.children.length > 0) {
        if (!currentChildId) {
          currentChildId = dashboardData.children[0].id;
          setChildId(currentChildId);
        }
        foundChild = dashboardData.children.find(c => c.id === currentChildId) || dashboardData.children[0];
        setCurrentChild(foundChild);
        

        if (foundChild) {
          setAllergyDeclared(foundChild.allergyDeclared || false);
          if (foundChild.allergies) {
            setEditingAllergies(foundChild.allergies as AllergyRequest[]);
          } else {
            setEditingAllergies([]);
          }
        }
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin học sinh.');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('Lỗi tải thông tin học sinh:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin học sinh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const saveAllergies = async () => {
    if (!currentChild) return;
    try {
      setSavingAllergy(true);
      await healthService.updateChildAllergies(currentChild.id, editingAllergies);
      Alert.alert('Thành công', 'Đã lưu thông tin dị ứng.');
      setShowAllergyModal(false);
      loadData(); // load lại để có dữ liệu mới
    } catch (error) {
      console.log('Lỗi lưu dị ứng:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin dị ứng.');
    } finally {
      setSavingAllergy(false);
    }
  };

  const addAllergyField = () => {
    setEditingAllergies([...editingAllergies, { allergen: '', severity: 'MILD', description: '' }]);
  };

  const removeAllergyField = (index: number) => {
    const updated = [...editingAllergies];
    updated.splice(index, 1);
    setEditingAllergies(updated);
  };

  const updateAllergyField = (index: number, field: string, value: string) => {
    const updated = [...editingAllergies];
    updated[index] = { ...updated[index], [field]: value };
    setEditingAllergies(updated);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dị ứng của trẻ</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea580c']} />
          }
        >
          {/* Allergy Section */}
          {currentChild && (
            <View style={styles.summaryCard}>
              <View style={[styles.summaryHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="warning" size={24} color="#f97316" />
                  <Text style={styles.summaryTitle}>Thông tin dị ứng</Text>
                </View>
                <TouchableOpacity 
                  style={{ backgroundColor: '#ffedd5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
                  onPress={() => setShowAllergyModal(true)}
                >
                  <Text style={{ color: '#ea580c', fontWeight: '600', fontSize: 13 }}>
                    {allergyDeclared ? 'Sửa' : 'Khai báo'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!allergyDeclared ? (
                <Text style={{ color: '#ea580c', textAlign: 'center', marginTop: 8 }}>
                  Vui lòng khai báo thông tin dị ứng của trẻ để có thể đăng ký suất ăn bán trú.
                </Text>
              ) : (
                <View>
                  {currentChild.allergies && currentChild.allergies.length > 0 ? (
                    currentChild.allergies.map((a, idx) => (
                      <View key={idx} style={{ marginTop: 8, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#0f172a' }}>{a.allergen}</Text>
                          <Text style={{ 
                            fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden',
                            backgroundColor: a.severity === 'CRITICAL' ? '#fee2e2' : a.severity === 'SEVERE' ? '#ffedd5' : a.severity === 'MODERATE' ? '#fef3c7' : '#dcfce7',
                            color: a.severity === 'CRITICAL' ? '#b91c1c' : a.severity === 'SEVERE' ? '#c2410c' : a.severity === 'MODERATE' ? '#b45309' : '#15803d'
                          }}>
                            {a.severity === 'CRITICAL' ? 'Nguy kịch' : a.severity === 'SEVERE' ? 'Nặng' : a.severity === 'MODERATE' ? 'Vừa' : 'Nhẹ'}
                          </Text>
                        </View>
                        {a.description ? <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{a.description}</Text> : null}
                      </View>
                    ))
                  ) : (
                    <Text style={{ textAlign: 'center', color: '#15803d', marginTop: 8, fontWeight: '500' }}>
                      <Ionicons name="checkmark-circle" size={16} color="#15803d" /> Trẻ không có tiền sử dị ứng
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.infoBox}>
             <Ionicons name="information-circle" size={24} color="#0ea5e9" style={{ marginTop: 2 }} />
             <View style={{ marginLeft: 12, flex: 1 }}>
               <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }}>Tại sao cần khai báo dị ứng?</Text>
               <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
                 Thông tin dị ứng giúp nhà trường chuẩn bị suất ăn phù hợp, đảm bảo an toàn tuyệt đối cho trẻ trong quá trình học tập và sinh hoạt tại trường. Nếu trẻ có bất kỳ dị ứng nào, hãy ghi chú rõ các biểu hiện để giáo viên có thể sơ cứu kịp thời.
               </Text>
             </View>
          </View>
        </ScrollView>
      )}

      {/* Allergy Modal */}
      {showAllergyModal && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Khai báo dị ứng</Text>
                <TouchableOpacity onPress={() => setShowAllergyModal(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginBottom: 16 }}>
                <Text style={{ color: '#64748b', marginBottom: 16 }}>
                  Hãy thêm thông tin dị ứng của trẻ. Nếu trẻ KHÔNG có dị ứng, hãy để trống danh sách này và bấm Lưu.
                </Text>

                {editingAllergies.map((field, index) => (
                  <View key={index} style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', position: 'relative' }}>
                    <TouchableOpacity 
                      style={{ position: 'absolute', top: -10, right: -10, backgroundColor: '#fee2e2', borderRadius: 12, padding: 4 }}
                      onPress={() => removeAllergyField(index)}
                    >
                      <Ionicons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>

                    <Text style={styles.inputLabel}>Tác nhân (VD: Sữa bò, hải sản):</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.input}
                        value={field.allergen}
                        onChangeText={(t) => updateAllergyField(index, 'allergen', t)}
                        placeholder="Nhập tác nhân"
                      />
                    </View>

                    <Text style={styles.inputLabel}>Mức độ:</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      {['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'].map((sev) => {
                        const labels: Record<string, string> = { 'MILD': 'Nhẹ', 'MODERATE': 'Vừa', 'SEVERE': 'Nặng', 'CRITICAL': 'Nguy kịch' };
                        const isSelected = field.severity === sev;
                        return (
                          <TouchableOpacity 
                            key={sev} 
                            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: isSelected ? '#ea580c' : '#e2e8f0', backgroundColor: isSelected ? '#ffedd5' : 'white' }}
                            onPress={() => updateAllergyField(index, 'severity', sev)}
                          >
                            <Text style={{ fontSize: 13, color: isSelected ? '#ea580c' : '#64748b', fontWeight: isSelected ? '600' : 'normal' }}>{labels[sev]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={styles.inputLabel}>Ghi chú (Biểu hiện / Sơ cứu):</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.input}
                        value={field.description}
                        onChangeText={(t) => updateAllergyField(index, 'description', t)}
                        placeholder="Nhập ghi chú"
                      />
                    </View>
                  </View>
                ))}

                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ea580c', borderStyle: 'dashed' }}
                  onPress={addAllergyField}
                >
                  <Ionicons name="add" size={20} color="#ea580c" />
                  <Text style={{ color: '#ea580c', fontWeight: 'bold', marginLeft: 8 }}>Thêm dị ứng</Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity 
                style={{ backgroundColor: '#ea580c', padding: 16, borderRadius: 12, alignItems: 'center' }}
                onPress={saveAllergies}
                disabled={savingAllergy}
              >
                {savingAllergy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Lưu thông tin</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    height: 40,
    fontSize: 15,
    color: '#0f172a',
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  }
});
