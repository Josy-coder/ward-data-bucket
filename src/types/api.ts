export type ApiError = {
    error: string;
    details?: any;
}

export type ApiSuccess<T> = {
    message: string;
    data?: T;
}

// Auth Types
export type RegisterResponse = ApiSuccess<{
    email: string;
}>

export type LoginResponse = ApiSuccess<{
    user: {
        id: string;
        email: string;
        name?: string;
        role: string;
    };
}>

export type ForgotPasswordResponse = ApiSuccess<never>

export type ResetPasswordResponse = ApiSuccess<never>

// User Management Types
export type CreateUserResponse = ApiSuccess<{
    user: {
        id: string;
        email: string;
        name?: string;
        role: string;
    };
}>

export type UpdateUserResponse = ApiSuccess<{
    user: {
        id: string;
        email: string;
        name?: string;
        role: string;
        isActive: boolean;
    };
}>

export type ToggleUserStatusResponse = ApiSuccess<{
    isActive: boolean;
}>

// Extend NextAuth types
import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
            email: string;
            name?: string;
            role: string;
            tenantId?: string;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        email: string;
        name?: string;
        role: string;
        tenantId?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role: string;
        tenantId?: string;
    }
}