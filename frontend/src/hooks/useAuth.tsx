'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/lib/axios';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
}

// Tambahkan interface ini untuk menggantikan 'any'
interface LoginCredentials {
    email?: string;
    password?: string;
    [key: string]: string | undefined;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    errors: Record<string, string[]> | null;
    setErrors: (errors: Record<string, string[]> | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
    const router = useRouter();

    const csrf = () => axios.get('/sanctum/csrf-cookie');

    useEffect(() => {
        // Pindahkan fetchUser ke dalam useEffect untuk menghindari peringatan cascading renders
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/v1/auth/me');
                setUser(response.data.user);
            } catch (error: unknown) { // Gunakan unknown, bukan any
                if (error instanceof AxiosError && error.response?.status === 401) {
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUser();
    }, []);

    const login = async (data: LoginCredentials) => {
        setErrors(null);
        try {
            await csrf();
            const response = await axios.post('/api/v1/auth/login', data);
            setUser(response.data.user);
            router.push('/dashboard');
        } catch (error: unknown) {
            if (error instanceof AxiosError && error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/v1/auth/logout');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, errors, setErrors }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};