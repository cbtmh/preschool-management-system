export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthUser {
    id: string;
    username: string;
    role?: string;
}
