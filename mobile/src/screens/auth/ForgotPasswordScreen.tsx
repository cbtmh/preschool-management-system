import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword({ username });
      
      Alert.alert(
        'Thành công',
        response.message || 'Vui lòng kiểm tra email của bạn để lấy mật khẩu mới.',
        [{ text: 'Về trang đăng nhập', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể gửi lại mật khẩu. Vui lòng kiểm tra lại số điện thoại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView 
        style={styles.keyboardView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={60} color="#ff6b6b" />
          </View>
          
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập số điện thoại đã đăng ký. Chúng tôi sẽ gửi mật khẩu mới qua email của bạn.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                value={username}
                onChangeText={setUsername}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Gửi mật khẩu mới</Text>
            )}
          </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    height: '100%',
  },
  button: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ffb3b3',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
