import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { medicationService } from '../../services/medication.service';

export default function CreateMedicationAdviceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const childId = route.params?.childId;
  const onGoBack = route.params?.onGoBack; 

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!medicationName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thuốc.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập liều lượng (VD: 1 viên, 5ml...).');
      return;
    }
    if (notes.length > 500) {
      Alert.alert('Lỗi', 'Lời dặn dò không được vượt quá 500 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      await medicationService.createRequest({
        childId,
        medicationName,
        dosage,
        startDate,
        endDate,
        notes
      });
      Alert.alert('Thành công', 'Đã tạo đơn dặn thuốc thành công.', [
        { 
          text: 'OK', 
          onPress: () => {
            if (onGoBack) onGoBack();
            navigation.goBack();
          }
        }
      ]);
    } catch (error: any) {
      console.log('Lỗi tạo đơn dặn thuốc:', error.response?.data || error.message);
      Alert.alert('Thông báo', error.response?.data?.message || 'Không thể tạo đơn dặn thuốc lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo đơn dặn thuốc</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#ef4444" />
            <Text style={styles.infoText}>Nhà trường chỉ nhận cho bé uống thuốc theo toa bác sĩ hoặc thuốc cảm thông thường. Vui lòng ghi rõ liều lượng.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên thuốc *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="medkit-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={medicationName} 
                onChangeText={setMedicationName} 
                placeholder="Nhập tên thuốc"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Liều lượng *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="water-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={dosage} 
                onChangeText={setDosage} 
                placeholder="VD: 1 viên / 5ml sau ăn"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={[styles.inputGroup, { width: '48%' }]}>
              <Text style={styles.label}>Từ ngày *</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  value={startDate} 
                  onChangeText={setStartDate} 
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { width: '48%' }]}>
              <Text style={styles.label}>Đến ngày *</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  value={endDate} 
                  onChangeText={setEndDate} 
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lời dặn dò (tối đa 500 ký tự)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="VD: Uống sau khi ăn sáng, uống bằng nước ấm..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{notes.length}/500</Text>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>{isSubmitting ? 'Đang gửi...' : 'Gửi đơn dặn thuốc'}</Text>
          </TouchableOpacity>
      </KeyboardAwareScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  formContainer: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
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
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 120,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
