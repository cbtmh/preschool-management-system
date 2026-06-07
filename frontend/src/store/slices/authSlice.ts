import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../../types/auth';

interface AuthState {
    userId: number | null;
    username: string | null;
    role: Role | null;
    token: string | null;
    isAuthenticated: boolean;
    requiresPasswordChange: boolean;
}

const initialState: AuthState = {
    userId: null,
    username: null,
    role: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    requiresPasswordChange: false,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ userId: number; username: string; role: Role; token: string; requiresPasswordChange?: boolean }>
        ) => {
            state.userId = action.payload.userId;
            state.username = action.payload.username;
            state.role = action.payload.role;
            state.token = action.payload.token;
            state.requiresPasswordChange = action.payload.requiresPasswordChange || false;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
        },
        logout: (state) => {
            state.userId = null;
            state.username = null;
            state.role = null;
            state.token = null;
            state.isAuthenticated = false;
            state.requiresPasswordChange = false;
            localStorage.removeItem('token');
        },
        setRequiresPasswordChange: (state, action: PayloadAction<boolean>) => {
            state.requiresPasswordChange = action.payload;
        }
    },
});

export const { setCredentials, logout, setRequiresPasswordChange } = authSlice.actions;
export default authSlice.reducer;
