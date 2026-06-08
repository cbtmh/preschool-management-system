import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  role: null,
  isLoading: false,
};

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await authService.logoutApi();
    } catch (error) {
      console.log('Error calling logout API', error);
    } finally {
      dispatch(logout());
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string; role: string }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.role = action.payload.role;
      // Persist to SecureStore asynchronously
      if (Platform.OS === 'web') {
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('role', action.payload.role);
      } else {
        SecureStore.setItemAsync('token', action.payload.token).catch(console.log);
        if (action.payload.refreshToken) SecureStore.setItemAsync('refreshToken', action.payload.refreshToken).catch(console.log);
        SecureStore.setItemAsync('role', action.payload.role).catch(console.log);
      }
    },
    updateTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      if (Platform.OS === 'web') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      } else {
        SecureStore.setItemAsync('token', action.payload.token).catch(console.log);
        SecureStore.setItemAsync('refreshToken', action.payload.refreshToken).catch(console.log);
      }
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      // Clear SecureStore
      if (Platform.OS === 'web') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
      } else {
        SecureStore.deleteItemAsync('token').catch(console.log);
        SecureStore.deleteItemAsync('refreshToken').catch(console.log);
        SecureStore.deleteItemAsync('role').catch(console.log);
      }
    },
  },
});

export const { setLoading, setCredentials, updateTokens, logout } = authSlice.actions;
export default authSlice.reducer;
