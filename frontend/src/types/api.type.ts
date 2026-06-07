export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        username: string;
        role?: string;
    };
}
