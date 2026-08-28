'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from '@/lib/axios';
import { useAuth } from './useAuth';

export interface Organization {
    id: number;
    name: string;
    slug: string;
}

interface TenantContextType {
    organizations: Organization[];
    activeOrganization: Organization | null;
    isLoading: boolean;
    fetchOrganizations: () => Promise<void>;
    createOrganization: (name: string) => Promise<void>;
    setActiveOrganization: (id: number) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [activeOrganization, setActiveOrganizationState] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrganizations = useCallback(async () => {
        if (!user) return; // Hanya fetch jika user sudah login
        
        setIsLoading(true);
        try {
            const response = await axios.get('/api/v1/organizations');
            const orgs = response.data.organizations;
            setOrganizations(orgs);

            // Kembalikan state organisasi yang aktif dari localStorage
            const savedId = localStorage.getItem('active_organization_id');
            if (savedId && orgs.length > 0) {
                const org = orgs.find((o: Organization) => o.id.toString() === savedId);
                if (org) {
                    setActiveOrganizationState(org);
                } else {
                    setActiveOrganization(orgs[0].id); // Default ke org pertama jika ID tidak valid
                }
            } else if (orgs.length > 0) {
                setActiveOrganization(orgs[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch organizations', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const setActiveOrganization = (id: number) => {
        const org = organizations.find((o) => o.id === id);
        if (org) {
            setActiveOrganizationState(org);
            localStorage.setItem('active_organization_id', id.toString());
        }
    };

    const createOrganization = async (name: string) => {
        try {
            await axios.get('/sanctum/csrf-cookie'); // Proteksi CSRF untuk request POST
            await axios.post('/api/v1/organizations', { name });
            await fetchOrganizations(); // Refresh daftar setelah membuat baru
        } catch (error) {
            console.error('Failed to create organization', error);
            throw error;
        }
    };

    return (
        <TenantContext.Provider value={{
            organizations,
            activeOrganization,
            isLoading,
            fetchOrganizations,
            createOrganization,
            setActiveOrganization
        }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};