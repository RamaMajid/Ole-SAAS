'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { useState } from 'react';
import axios from '@/lib/axios';
import { AxiosError } from 'axios'; // Import ini ditambahkan

export default function DashboardPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const { organizations, activeOrganization, setActiveOrganization, createOrganization, isLoading: tenantLoading } = useTenant();
    
    const [newOrgName, setNewOrgName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    if (authLoading || tenantLoading) return <div className="flex h-screen items-center justify-center">Loading context...</div>;
    if (!user) return <div className="p-8 text-red-600 font-bold">Unauthorized. Please login.</div>;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;
        
        setIsCreating(true);
        try {
            await createOrganization(newOrgName);
            setNewOrgName('');
        } catch {
            alert('Failed to create organization. Check console for details.');
        } finally {
            setIsCreating(false);
        }
    };

    const testTenantAccess = async () => {
        try {
            const res = await axios.get('/api/v1/tenant/status');
            setTestResult(JSON.stringify(res.data, null, 2));
        } catch (error: unknown) {
            // Gunakan instanceof AxiosError dari package asli
            if (error instanceof AxiosError) {
                setTestResult(JSON.stringify(error.response?.data || 'Connection Error', null, 2));
            } else {
                setTestResult('Unknown Error Occurred');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Topbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SaaS Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Authenticated as <span className="font-medium text-gray-700">{user.email}</span></p>
                    </div>
                    <button onClick={logout} className="mt-4 sm:mt-0 rounded bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                        Sign Out
                    </button>
                </div>

                {/* Tenant Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Select Context */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Active Workspace</h2>
                            {organizations.length > 0 ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Switch Organization</label>
                                    <select 
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                        value={activeOrganization?.id || ''}
                                        onChange={(e) => setActiveOrganization(Number(e.target.value))}
                                    >
                                        {organizations.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">You don&apos;t belong to any workspace yet.</p>
                            )}
                        </div>
                        {activeOrganization && (
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-900">
                                    Current context is bound to: <br/>
                                    <strong className="text-base">{activeOrganization.name}</strong> 
                                    <span className="text-blue-500 ml-2">#{activeOrganization.slug}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Create New Context */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Create Workspace</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. PT Maju Jaya"
                                    className="block w-full rounded-lg border-gray-300 p-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isCreating}
                                className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                {isCreating ? 'Creating...' : 'Create New Organization'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Integration Test Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-indigo-500 border-y border-r border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Test Middleware Isolation</h2>
                    <p className="text-sm text-gray-600 mb-4">Clicking the button below will request data from the backend. Axios will automatically inject the <code>X-Organization-ID</code> of your currently active workspace.</p>
                    <button 
                        onClick={testTenantAccess}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                        Fire Request to /api/v1/tenant/status
                    </button>
                    
                    {testResult && (
                        <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-green-400 font-mono">
                                {testResult}
                            </pre>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}