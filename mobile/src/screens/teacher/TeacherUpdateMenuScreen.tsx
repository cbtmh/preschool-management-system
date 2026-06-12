import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, Platform, Alert, ActivityIndicator, Image
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { mealMenuService } from '../../services/mealMenu.service';
import { uploadService } from '../../services/upload.service';
import { API_URL } from '../../config/api';

export default function TeacherUpdateMenuScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const editingMenu = route.params?.menu;
  const initialDate = route.params?.date || new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(editingMenu?.date || initialDate);
  const [mealType, setMealType] = useState(editingMenu?.mealType || 'BREAKFAST');
  const [description, setDescription] = useState(editingMenu?.description || '');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const mealOptions = [
    { value: 'BREAKFAST', label: 'Ăn sáng', color: '#f59e0b' },
    { value: 'LUNCH', label: 'Ăn trưa', color: '#22c55e' },
    { value: 'SNACK', label: 'Ăn xế', color: '#6366f1' },
  ];

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getDisplayImage = () => {
    if (imageUri) return imageUri;
    if (editingMenu?.imageUrl && !removeExistingImage) return getImageUrl(editingMenu.imageUrl);
    return null;
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setRemoveExistingImage(true);
  };

  const pickImage = async (useCamera: boolean = false) => {
    const uris = await uploadService.pickImage(useCamera, false);
    if (uris.length > 0) {
      setImageUri(uris[0]);
      setRemoveExistingImage(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món ăn/thực đơn');
      return;
    }

    try {
      setLoading(true);
      
      let finalImageUrl = editingMenu?.imageUrl || null;
      if (removeExistingImage) {
        finalImageUrl = null;
      }
      
      if (imageUri) {
        try {
          finalImageUrl = await uploadService.uploadImageToBackend(imageUri);
        } catch (error) {
          Alert.alert('Lỗi', 'Tải ảnh thất bại. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      const data = {
        date,
        mealType,
        description: description.trim(),
        imageUrl: finalImageUrl
      };

      if (editingMenu) {
        await mealMenuService.updateMealMenu(editingMenu.id, data);
        Alert.alert('Thành công', 'Đã cập nhật thực đơn', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await mealMenuService.createMealMenu(data);
        Alert.alert('Thành công', 'Đã thêm thực đơn mới', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.log('Error saving menu:', error.response?.data || error);
      const errorMsg = error.response?.data?.message || 'Không thể lưu thực đơn. Vui lòng thử lại sau.';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>
          {editingMenu ? 'Sửa Thực Đơn' : 'Thêm Thực Đơn'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAwareScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#0ea5e9" />
            <Text style={styles.infoText}>
              Thực đơn bạn tạo sẽ được hiển thị ngay lập tức trên ứng dụng của Phụ huynh toàn trường.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ngày áp dụng</Text>
            <TouchableOpacity 
              style={[styles.inputContainer, { height: 48 }]} 
              onPress={() => !loading && setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#0ea5e9" style={styles.inputIcon} />
              <Text style={{ fontSize: 15, color: '#0f172a' }}>
                {date.split('-').reverse().join('/')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(date)}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bữa ăn</Text>
            <View style={styles.mealOptionsContainer}>
              {mealOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.mealOptionBtn,
                    mealType === option.value && { borderColor: option.color, backgroundColor: option.color + '1A' }
                  ]}
                  onPress={() => setMealType(option.value)}
                  disabled={loading}
                >
                  <View style={[
                    styles.radioCircle,
                    mealType === option.value && { borderColor: option.color }
                  ]}>
                    {mealType === option.value && <View style={[styles.radioDot, { backgroundColor: option.color }]} />}
                  </View>
                  <Text style={[
                    styles.mealOptionText,
                    mealType === option.value && { color: option.color, fontWeight: 'bold' }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hình ảnh mâm cơm (Tùy chọn)</Text>
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => !loading && pickImage(true)}>
                <Ionicons name="camera" size={24} color="#0ea5e9" />
                <Text style={styles.imageActionText}>Chụp ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => !loading && pickImage(false)}>
                <Ionicons name="image" size={24} color="#64748b" />
                <Text style={styles.imageActionText}>Thư viện</Text>
              </TouchableOpacity>
            </View>
            {getDisplayImage() && (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: getDisplayImage() as string }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageBtn} 
                  onPress={handleRemoveImage} 
                  disabled={loading}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Danh sách món ăn</Text>
            <TextInput
              style={styles.textArea}
              placeholder="VD: Cơm trắng, Thịt lợn xào giá chua ngọt, Canh rau ngót nấu thịt băm, Trái cây tráng miệng..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
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
            <Text style={styles.saveButtonText}>Lưu thực đơn</Text>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 20,
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
    fontSize: 15,
    color: '#0f172a',
  },
  mealOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  mealOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mealOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
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
  imagePreviewWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  }
});
