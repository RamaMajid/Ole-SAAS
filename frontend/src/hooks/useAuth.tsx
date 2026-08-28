'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
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

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/v1/auth/me');
            setUser(response.data.user);
        } catch (error: any) {
            if (error.response?.status === 401) {
                setUser(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (data: any) => {
        setErrors(null);
        try {
            await csrf(); // Wajib ambil CSRF sebelum POST
            const response = await axios.post('/api/v1/auth/login', data);
            setUser(response.data.user);
            router.push('/dashboard');
        } catch (error: any) {
            if (error.response?.status === 422) {
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