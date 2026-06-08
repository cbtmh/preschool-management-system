import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

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
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`
    } as any);

    try {
      const response = await axiosInstance.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.data && response.data.data.url) {
        return response.data.data.url;
      }
      throw new Error('Upload failed: No URL returned');
    } catch (error) {
      console.error('Backend upload error:', error);
      throw error;
    }
  }
};
