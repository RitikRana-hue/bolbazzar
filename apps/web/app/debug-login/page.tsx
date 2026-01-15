'use client';

import { useState } from 'react';
import { getApiUrl } from '@/lib/config';

export default function DebugLoginPage() {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        setResult(null);

        try {
            console.log('🔍 Testing login with:', { email, password });
            console.log('🌐 API URL:', getApiUrl('/auth/login'));

            const response = await fetch(getApiUrl('/auth/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('📦 Response data:', data);

            setResult({
                status: response.status,
                ok: response.ok,
                data: data,
                headers: Object.fromEntries(response.headers.entries())
            });

        } catch (error) {
            console.error('❌ Login error:', error);
            setResult({
                error: error.message,
                type: 'network_error'
            });
        } finally {
            setLoading(false);
        }
    };

    const testProtectedRoute = async () => {
        if (!result?.data?.token) {
            alert('Please login first to get a token');
            return;
        }

        try {
            console.log('🔒 Testing protected route with token:', result.data.token.substring(0, 20) + '...');

            const response = await fetch(getApiUrl('/wallet'), {
                headers: {
                    'Authorization': `Bearer ${result.data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('🔒 Protected route status:', response.status);
            const data = await response.json();
            console.log('🔒 Protected route data:', data);

            alert(`Protected route test: ${response.status} - ${JSON.stringify(data)}`);

        } catch (error) {
            console.error('❌ Protected route error:', error);
            alert(`Protected route error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug Login</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Login Test</h2>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div className="space-x-4 mb-6">
                        <button 
                            onClick={testLogin}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test Login'}
                        </button>
                        
                        <button 
                            onClick={testProtectedRoute}
                            disabled={!result?.data?.token}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Test Protected Route
                        </button>
                    </div>

                    {result && (
                        <div className="bg-gray-100 rounded p-4">
                            <h3 className="font-semibold mb-2">Result:</h3>
                            <pre className="text-sm overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Configuration</h2>
                    <div className="space-y-2 text-sm">
                        <div><strong>API Base URL:</strong> {getApiUrl('')}</div>
                        <div><strong>Login Endpoint:</strong> {getApiUrl('/auth/login')}</div>
                        <div><strong>Wallet Endpoint:</strong> {getApiUrl('/wallet')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}