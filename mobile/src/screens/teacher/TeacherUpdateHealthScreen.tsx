import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { healthService } from '../../services/health.service';

export default function TeacherUpdateHealthScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const student = route.params?.student || { name: 'Học sinh', id: 0 };

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateBMI = () => {
    if (height && weight) {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (h > 0 && w > 0) {
        return (w / (h * h)).toFixed(1);
      }
    }
    return '--';
  };

  const evaluateStatus = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return 'Chưa xác định';
    if (bmi < 14) return 'Thiếu cân';
    if (bmi >= 14 && bmi <= 18) return 'Bình thường';
    return 'Thừa cân';
  };

  const handleSave = async () => {
    if (!height || !weight) {
      Alert.alert('Lỗi', 'Vui lòng nhập chiều cao và cân nặng');
      return;
    }
    
    if (!student.id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin học sinh');
      return;
    }

    setLoading(true);
    try {
      await healthService.createHealthRecord({
        childId: student.id,
        height: parseFloat(height),
        weight: parseFloat(weight),
        status: evaluateStatus(),
        note: note
      });
      
      Alert.alert('Thành công', 'Đã lưu chỉ số sức khỏe', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('Lỗi lưu chỉ số sức khỏe:', error);
      Alert.alert('Lỗi', 'Không thể lưu chỉ số sức khỏe, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const currentMonthStr = `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật chỉ số</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAwareScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
          <View style={styles.studentInfoCard}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#64748b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.monthText}>Kỳ đánh giá: {currentMonthStr}</Text>
              {student.allergyDeclared && student.allergies && student.allergies.length > 0 ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ea580c', marginBottom: 4 }}>
                    <Ionicons name="warning" size={14} color="#ea580c" /> Tiền sử dị ứng:
                  </Text>
                  {student.allergies.map((a: any, idx: number) => (
                    <Text key={idx} style={{ fontSize: 13, color: '#334155' }}>
                      • {a.allergen} ({a.severity === 'CRITICAL' ? 'Nguy kịch' : a.severity === 'SEVERE' ? 'Nặng' : a.severity === 'MODERATE' ? 'Vừa' : 'Nhẹ'})
                    </Text>
                  ))}
                </View>
              ) : student.allergyDeclared ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 13, color: '#10b981', fontWeight: '500' }}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" /> Không có dị ứng
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="resize" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập chiều cao..."
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="scale" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập cân nặng..."
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.bmiCard}>
            <View style={styles.bmiRow}>
              <Text style={styles.bmiLabel}>Chỉ số BMI (Tham khảo):</Text>
              <Text style={styles.bmiValue}>{calculateBMI()}</Text>
            </View>
            <View style={styles.bmiRow}>
              <Text style={styles.bmiLabel}>Tình trạng:</Text>
              <Text style={[styles.bmiStatus, { color: evaluateStatus() === 'Bình thường' ? '#10b981' : '#f59e0b' }]}>
                {evaluateStatus()}
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nhận xét của giáo viên (Tùy chọn)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Nhập nhận xét về tình hình ăn uống, sức khỏe của trẻ..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
              editable={!loading}
            />
          </View>
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu chỉ số</Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  studentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  monthText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    minHeight: 120,
  },
  bmiCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  bmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bmiLabel: {
    fontSize: 14,
    color: '#475569',
  },
  bmiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bmiStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saveButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
