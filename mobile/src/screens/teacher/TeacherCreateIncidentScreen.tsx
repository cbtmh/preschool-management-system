import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Modal, ScrollView, Image
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { incidentService, IncidentReportRequest, SeverityLevel, InvolvedRole, InvolvedChildReq } from '../../services/incident.service';
import { uploadService } from '../../services/upload.service';
import { teacherService } from '../../services/teacher.service';
import { EnrollmentResponse } from '../../types/teacher';

export default function TeacherCreateIncidentScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [initialHandling, setInitialHandling] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>('MILD');
  const [incidentTime, setIncidentTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [classId, setClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<EnrollmentResponse[]>([]);
  
  const [involvedChildren, setInvolvedChildren] = useState<InvolvedChildReq[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<InvolvedRole>('INVOLVED');

  const DRAFT_KEY = `INCIDENT_DRAFT_${classId || 'default'}`;

  useEffect(() => {
    loadClassAndStudents();
  }, []);

  useEffect(() => {
    if (classId) {
      loadDraft();
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, description, initialHandling, severityLevel, involvedChildren, images]);

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setInitialHandling(parsed.initialHandling || '');
        setSeverityLevel(parsed.severityLevel || 'MILD');
        if (parsed.incidentTime) setIncidentTime(new Date(parsed.incidentTime));
        setInvolvedChildren(parsed.involvedChildren || []);
        setImages(parsed.images || []);
      }
    } catch (e) {
      console.log('Error loading draft', e);
    }
  };

  const saveDraft = async () => {
    try {
      const draft = JSON.stringify({
        title, description, initialHandling, severityLevel, 
        incidentTime: incidentTime.toISOString(),
        involvedChildren, images
      });
      await AsyncStorage.setItem(DRAFT_KEY, draft);
    } catch (e) {
      console.log('Error saving draft', e);
    }
  };

  const loadClassAndStudents = async () => {
    try {
      setLoading(true);
      const me = await teacherService.getMe();
      const classes = await teacherService.getClassesByTeacherId(me.profile.teacherId);
      if (classes.length > 0) {
        setClassId(classes[0].id);
        const studs = await teacherService.getStudentsInClass(classes[0].id);
        setStudents(studs);
      }
    } catch (error) {
      console.log('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeverityChange = (level: SeverityLevel) => {
    setSeverityLevel(level);
    if (level === 'SEVERE' || level === 'CRITICAL') {
      Alert.alert(
        'CẢNH BÁO KHẨN CẤP',
        'Với sự việc ở mức độ Nghiêm trọng/Khẩn cấp, VUI LÒNG GỌI NGAY cho Ban giám hiệu và Phụ huynh trước khi điền tường trình!',
        [{ text: 'Đã hiểu' }]
      );
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(incidentTime);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setIncidentTime(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(incidentTime);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setIncidentTime(newDate);
    }
  };

  const toggleStudent = (childId: number) => {
    const existing = involvedChildren.find(c => c.childId === childId);
    if (existing) {
      setInvolvedChildren(involvedChildren.filter(c => c.childId !== childId));
    } else {
      setInvolvedChildren([...involvedChildren, { childId, role: selectedRole }]);
    }
  };

  const getChildName = (id: number) => {
    return students.find(s => s.childId === id)?.childName || 'Unknown';
  };

  const pickImage = async (useCamera: boolean = false) => {
    const uris = await uploadService.pickImage(useCamera, true);
    if (uris.length > 0) {
      setImages(prev => [...prev, ...uris]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tiêu đề và mô tả sự việc.');
      return;
    }
    if (!classId) {
      Alert.alert('Lỗi', 'Không xác định được lớp học.');
      return;
    }
    if (involvedChildren.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 học sinh liên quan.');
      return;
    }

    Alert.alert(
      'Xác nhận nộp',
      'Bạn có chắc chắn muốn nộp Bản tường trình này cho Ban Giám Hiệu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nộp',
          style: 'default',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              // Upload images
              const uploadedUrls: string[] = [];
              for (const uri of images) {
                try {
                  const url = await uploadService.uploadImageToBackend(uri);
                  uploadedUrls.push(url);
                } catch (e) {
                  console.log('Error uploading image', e);
                }
              }

              const data: IncidentReportRequest = {
                title,
                description,
                initialHandling,
                incidentTime: incidentTime.toISOString(),
                severityLevel,
                classId,
                involvedChildren,
                imageUrls: uploadedUrls
              };
              
              await incidentService.createIncident(data);
              await AsyncStorage.removeItem(DRAFT_KEY); // Clear draft on success
              
              Alert.alert('Thành công', 'Bản tường trình đã được gửi đến BGH chờ xử lý.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.log('Error creating incident:', error);
              Alert.alert('Lỗi', 'Không thể tạo bản tường trình. Vui lòng thử lại sau.');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết Tường trình</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <KeyboardAwareScrollView 
          style={styles.content} 
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tiêu đề sự việc <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Vd: Bé A bị ngã ở sân chơi..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Thời điểm xảy ra <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text style={styles.dateText}>{incidentTime.toLocaleDateString('vi-VN')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <Text style={styles.dateText}>
                  {incidentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={incidentTime}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={incidentTime}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mức độ nghiêm trọng <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <View style={styles.severityContainer}>
              {[
                { val: 'MILD', label: 'Nhẹ', color: '#3b82f6' },
                { val: 'MODERATE', label: 'Vừa', color: '#f59e0b' },
                { val: 'SEVERE', label: 'Nghiêm trọng', color: '#ef4444' }
              ].map(item => (
                <TouchableOpacity
                  key={item.val}
                  style={[
                    styles.severityBtn,
                    severityLevel === item.val && { backgroundColor: item.color, borderColor: item.color }
                  ]}
                  onPress={() => handleSeverityChange(item.val as SeverityLevel)}
                >
                  <Text style={[
                    styles.severityText,
                    severityLevel === item.val && { color: '#fff' }
                  ]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Học sinh liên quan <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <View style={styles.selectedChildren}>
              {involvedChildren.length === 0 && (
                <Text style={{ color: '#94a3b8', fontStyle: 'italic', paddingVertical: 8 }}>Chưa chọn học sinh nào</Text>
              )}
              {involvedChildren.map(c => (
                <View key={c.childId} style={styles.childTag}>
                  <Text style={styles.childTagName}>{getChildName(c.childId)}</Text>
                  <Text style={styles.childTagRole}>
                    {c.role === 'VICTIM' ? 'Nạn nhân' : c.role === 'CAUSER' ? 'Gây ra' : 'Liên quan'}
                  </Text>
                  <TouchableOpacity onPress={() => toggleStudent(c.childId)}>
                    <Ionicons name="close-circle" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.addStudentBtn} onPress={() => setShowStudentModal(true)}>
              <Ionicons name="add" size={20} color="#0ea5e9" />
              <Text style={styles.addStudentText}>Thêm học sinh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hình ảnh đính kèm</Text>
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => pickImage(true)}>
                <Ionicons name="camera" size={24} color="#0ea5e9" />
                <Text style={styles.imageActionText}>Chụp ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => pickImage(false)}>
                <Ionicons name="image" size={24} color="#64748b" />
                <Text style={styles.imageActionText}>Thư viện</Text>
              </TouchableOpacity>
            </View>
            {images.length > 0 && (
              <ScrollView horizontal style={styles.imagePreviewContainer}>
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mô tả chi tiết sự việc <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết việc gì đã xảy ra, nguyên nhân..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cách xử lý ban đầu</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cô đã sơ cứu/xử lý như thế nào..."
              value={initialHandling}
              onChangeText={setInitialHandling}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Nộp Tường Trình</Text>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      )}

      {/* Student Selection Modal */}
      <Modal visible={showStudentModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn học sinh</Text>
              <TouchableOpacity onPress={() => setShowStudentModal(false)}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.roleSelector}>
              <Text style={styles.roleLabel}>Vai trò trong sự việc:</Text>
              <View style={styles.roleBtns}>
                {[
                  { val: 'VICTIM', label: 'Nạn nhân' },
                  { val: 'CAUSER', label: 'Gây ra' },
                  { val: 'INVOLVED', label: 'Liên quan' }
                ].map(item => (
                  <TouchableOpacity
                    key={item.val}
                    style={[
                      styles.roleBtn,
                      selectedRole === item.val && styles.roleBtnActive
                    ]}
                    onPress={() => setSelectedRole(item.val as InvolvedRole)}
                  >
                    <Text style={[
                      styles.roleBtnText,
                      selectedRole === item.val && styles.roleBtnTextActive
                    ]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView style={styles.studentList}>
              {students.map(student => {
                const isSelected = involvedChildren.some(c => c.childId === student.childId);
                return (
                  <TouchableOpacity 
                    key={student.childId}
                    style={[styles.studentItem, isSelected && styles.studentItemActive]}
                    onPress={() => toggleStudent(student.childId)}
                  >
                    <View style={styles.studentAvatar}>
                      <Ionicons name="person" size={20} color={isSelected ? '#0ea5e9' : '#64748b'} />
                    </View>
                    <Text style={[styles.studentName, isSelected && styles.studentNameActive]}>
                      {student.childName}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#0ea5e9" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowStudentModal(false)}>
              <Text style={styles.doneBtnText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: {
    height: 120,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#0f172a',
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  selectedChildren: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  childTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  childTagName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  childTagRole: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  addStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addStudentText: {
    color: '#0ea5e9',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imageActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  imageActionText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  submitBtn: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  roleSelector: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  roleBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleBtnActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  roleBtnText: {
    fontSize: 13,
    color: '#64748b',
  },
  roleBtnTextActive: {
    color: '#0ea5e9',
    fontWeight: '500',
  },
  studentList: {
    flex: 1,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  studentItemActive: {
    backgroundColor: '#f8fafc',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentName: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  studentNameActive: {
    fontWeight: '500',
    color: '#0ea5e9',
  },
  doneBtn: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
