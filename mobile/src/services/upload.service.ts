import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

import axiosInstance from '../config/api.client';

export const uploadService = {
  pickImage: async (useCamera: boolean = false, allowsMultipleSelection: boolean = false): Promise<string[]> => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập camera.');
        return [];
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh.');
        return [];
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsMultipleSelection,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets.map(a => a.uri);
    }
    return [];
  },

  uploadImageToBackend: async (uri: string): Promise<string> => {
    const formData = new FormData();
    
    // Fix cho Android: đảm bảo uri bắt đầu bằng file:///
    const fileUri = Platform.OS === 'android' && !uri.startsWith('file:///') 
      ? uri.replace('file://', 'file:///') 
      : uri;

    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`
    } as any);

    try {
      // Axios trong React Native thường gặp lỗi Network Error với multipart/form-data
      // Cách tốt nhất là sử dụng Fetch API gốc của React Native
      const { store } = require('../store');
      const token = store.getState().auth.token;
      
      const { API_URL } = require('../config/api');

      const response = await fetch(`${API_URL}/v1/upload/image`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
          // KHÔNG set Content-Type, fetch sẽ tự set kèm boundary chính xác
        },
        body: formData
      });

      const responseData = await response.json();

      if (response.ok && responseData && responseData.data && responseData.data.url) {
        return responseData.data.url;
      }
      throw new Error('Upload failed: ' + (responseData.message || 'Unknown error'));
    } catch (error) {
      console.error('Backend upload error:', error);
      throw error;
    }
  }
};
