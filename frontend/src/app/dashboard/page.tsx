'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8 text-red-600">Unauthorized</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome back, {user.name}!</p>
            <button 
                onClick={logout}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
}