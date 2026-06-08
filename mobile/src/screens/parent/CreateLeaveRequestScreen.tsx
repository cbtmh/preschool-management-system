import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { leaveRequestService } from '../../services/leaveRequest.service';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Nếu dự án chưa có thư viện này, ta có thể dùng UI input ngày đơn giản dạng String hoặc giả lập. Tôi sẽ dùng TextInput cho đơn giản trước, hoặc nếu có DateTimePicker thì dùng.
// Vì expo thường dùng @react-native-community/datetimepicker, tôi sẽ dùng cách đơn giản trước.

export default function CreateLeaveRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const childId = route.params?.childId;
  const onGoBack = route.params?.onGoBack; // Callback để load lại list

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do xin nghỉ.');
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveRequestService.createRequest({
        childId,
        startDate,
        endDate,
        reason
      });
      Alert.alert('Thành công', 'Đã tạo đơn xin nghỉ thành công.', [
        { 
          text: 'OK', 
          onPress: () => {
            if (onGoBack) onGoBack();
            navigation.goBack();
          }
        }
      ]);
    } catch (error: any) {
      console.log('Lỗi tạo đơn xin nghỉ:', error.response?.data || error.message);
      Alert.alert('Thông báo', error.response?.data?.message || 'Không thể tạo đơn xin nghỉ lúc này.');
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
        <Text style={styles.headerTitle}>Tạo đơn xin nghỉ</Text>
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
            <Ionicons name="information-circle" size={24} color="#0ea5e9" />
            <Text style={styles.infoText}>Lưu ý: Không thể xin nghỉ cho ngày trong quá khứ. Đơn xin nghỉ trong ngày cần nộp trước 09:00 sáng.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Từ ngày (YYYY-MM-DD)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={startDate} 
                onChangeText={setStartDate} 
                placeholder="2026-05-25"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Đến ngày (YYYY-MM-DD)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={endDate} 
                onChangeText={setEndDate} 
                placeholder="2026-05-25"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lý do xin nghỉ</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={reason} 
              onChangeText={setReason} 
              placeholder="Nhập lý do xin nghỉ (VD: Cháu bị ốm...)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>{isSubmitting ? 'Đang gửi...' : 'Gửi đơn xin nghỉ'}</Text>
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
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#0369a1',
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
  submitButton: {
    backgroundColor: '#0ea5e9',
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
