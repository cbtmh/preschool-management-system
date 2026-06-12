import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { teacherService } from '../../services/teacher.service';
import { healthService, AllergyRequest, ChildHealthSummaryDto } from '../../services/health.service';
import { SchoolClassResponse } from '../../types/teacher';

export default function TeacherAllergyScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [selectedClass, setSelectedClass] = useState<SchoolClassResponse | null>(null);
  const [students, setStudents] = useState<ChildHealthSummaryDto[]>([]);
  

  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ChildHealthSummaryDto | null>(null);
  const [editingAllergies, setEditingAllergies] = useState<AllergyRequest[]>([]);
  const [savingAllergy, setSavingAllergy] = useState(false);

  const loadClassesAndStudents = async () => {
    try {
      setLoading(true);
      const meData = await teacherService.getMe();
      if (!meData?.profile?.teacherId) throw new Error("Teacher ID missing");
      
      const classList = await teacherService.getClassesByTeacherId(meData.profile.teacherId);
      
      // lấy danh sách lớp của năm hiện tại

      setClasses(classList);
      
      if (classList.length > 0) {
        const currentCls = selectedClass || classList[0];
        setSelectedClass(currentCls);
        await fetchStudents(currentCls.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu lớp học.');
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: number) => {
    try {
      setLoading(true);
      const data = await healthService.getClassHealthSummary(classId);
      setStudents(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách học sinh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClassesAndStudents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedClass) {
      fetchStudents(selectedClass.id);
    } else {
      loadClassesAndStudents();
    }
  };

  const handleEditAllergy = (student: ChildHealthSummaryDto) => {
    setSelectedStudent(student);
    if (student.allergies) {
      setEditingAllergies(student.allergies as AllergyRequest[]);
    } else {
      setEditingAllergies([]);
    }
    setShowAllergyModal(true);
  };

  const saveAllergies = async () => {
    if (!selectedStudent) return;
    try {
      setSavingAllergy(true);
      await healthService.teacherUpdateChildAllergies(selectedStudent.id, editingAllergies);
      Alert.alert('Thành công', 'Đã lưu thông tin dị ứng và thông báo cho phụ huynh.');
      setShowAllergyModal(false);
      if (selectedClass) {
        fetchStudents(selectedClass.id);
      }
    } catch (error) {
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

  const studentsWithAllergies = students.filter(s => s.allergyDeclared && s.allergies && s.allergies.length > 0);
  const studentsWithoutAllergies = students.filter(s => !s.allergyDeclared || !s.allergies || s.allergies.length === 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý dị ứng</Text>
        <View style={styles.placeholder} />
      </View>
      {classes.length > 1 && (
        <View style={styles.classSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.classTab,
                  selectedClass?.id === cls.id && styles.classTabActive
                ]}
                onPress={() => {
                  setSelectedClass(cls);
                  fetchStudents(cls.id);
                }}
              >
                <Text style={[
                  styles.classTabText,
                  selectedClass?.id === cls.id && styles.classTabTextActive
                ]}>
                  {cls.name} ({cls.academicYearName})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#e11d48" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e11d48']} />}
        >
          {selectedClass && (
             <View style={styles.summaryCard}>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                 <Ionicons name="restaurant" size={24} color="#e11d48" />
                 <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#0f172a' }}>Tổng hợp lớp {selectedClass.name}</Text>
               </View>
               <Text style={{ color: '#475569', fontSize: 14 }}>
                 Có <Text style={{ fontWeight: 'bold', color: '#e11d48' }}>{studentsWithAllergies.length}</Text> trẻ có dị ứng cần lưu ý.
               </Text>
               <Text style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>
                 Còn <Text style={{ fontWeight: 'bold', color: '#f59e0b' }}>{students.filter(s => !s.allergyDeclared).length}</Text> trẻ chưa được phụ huynh khai báo.
               </Text>
             </View>
          )}
          <Text style={styles.sectionTitle}>Trẻ có dị ứng ({studentsWithAllergies.length})</Text>
          {studentsWithAllergies.length === 0 ? (
            <Text style={styles.emptyText}>Không có trẻ nào có dị ứng.</Text>
          ) : (
            studentsWithAllergies.map(student => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <View style={{ marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {student.allergies?.map((a, idx) => (
                        <View key={idx} style={{ 
                          paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, 
                          backgroundColor: a.severity === 'CRITICAL' ? '#fee2e2' : a.severity === 'SEVERE' ? '#ffedd5' : '#fef3c7'
                        }}>
                          <Text style={{ 
                            fontSize: 11, fontWeight: '600',
                            color: a.severity === 'CRITICAL' ? '#b91c1c' : a.severity === 'SEVERE' ? '#c2410c' : '#b45309'
                          }}>
                            {a.allergen}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEditAllergy(student)}>
                    <Ionicons name="create-outline" size={20} color="#0284c7" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Không dị ứng / Chưa khai báo ({studentsWithoutAllergies.length})</Text>
          {studentsWithoutAllergies.length === 0 ? (
            <Text style={styles.emptyText}>Tất cả trẻ đều có dị ứng.</Text>
          ) : (
            studentsWithoutAllergies.map(student => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <View style={[styles.avatar, { backgroundColor: '#cbd5e1' }]}>
                    <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={{ color: student.allergyDeclared ? '#10b981' : '#f59e0b', fontSize: 13, marginTop: 4 }}>
                      {student.allergyDeclared ? 'Không có dị ứng' : 'Chưa khai báo'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEditAllergy(student)}>
                    <Ionicons name="add-circle-outline" size={24} color="#0284c7" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      {showAllergyModal && selectedStudent && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Sửa dị ứng: {selectedStudent.name}</Text>
                <TouchableOpacity onPress={() => setShowAllergyModal(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginBottom: 16 }}>
                <Text style={{ color: '#64748b', marginBottom: 16, fontSize: 13 }}>
                  Thêm hoặc cập nhật dị ứng. Phụ huynh sẽ nhận được thông báo để xác nhận thông tin này.
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
                            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: isSelected ? '#e11d48' : '#e2e8f0', backgroundColor: isSelected ? '#ffe4e6' : 'white' }}
                            onPress={() => updateAllergyField(index, 'severity', sev)}
                          >
                            <Text style={{ fontSize: 13, color: isSelected ? '#e11d48' : '#64748b', fontWeight: isSelected ? '600' : 'normal' }}>{labels[sev]}</Text>
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
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e11d48', borderStyle: 'dashed' }}
                  onPress={addAllergyField}
                >
                  <Ionicons name="add" size={20} color="#e11d48" />
                  <Text style={{ color: '#e11d48', fontWeight: 'bold', marginLeft: 8 }}>Thêm dị ứng</Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity 
                style={{ backgroundColor: '#e11d48', padding: 16, borderRadius: 12, alignItems: 'center' }}
                onPress={saveAllergies}
                disabled={savingAllergy}
              >
                {savingAllergy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Lưu và Thông báo</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  placeholder: { width: 40 },
  classSelector: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  classTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginLeft: 16,
  },
  classTabActive: {
    backgroundColor: '#e11d48',
  },
  classTabText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  classTabTextActive: {
    color: '#ffffff',
  },
  content: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  summaryCard: {
    backgroundColor: '#fff1f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  emptyText: { color: '#64748b', fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fda4af',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  editBtn: { padding: 8, backgroundColor: '#f0f9ff', borderRadius: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputBox: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1',
    borderRadius: 8, paddingHorizontal: 12, marginBottom: 12,
  },
  input: { height: 40, fontSize: 15, color: '#0f172a' },
});
