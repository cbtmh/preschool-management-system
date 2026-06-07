import axiosInstance from '../config/axios.instance';

export const authService = {
    login: async (credentials: any) => {
        return axiosInstance.post('/api/auth/login', credentials);
    },
    getMe: async () => {
        return axiosInstance.get('/api/auth/me');
    },
    resendPassword: async (userId: number) => {
        return axiosInstance.post(`/api/auth/resend-password/${userId}`);
    },
    changePassword: async (userId: number,data: any) => {
        return axiosInstance.post(`/api/auth/change-password/${userId}`,data);
    },
    logout: async () => {
        return axiosInstance.post('/api/auth/logout');
    }
};
