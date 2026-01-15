'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function TestAuthPage() {
    const { user, token, login, logout } = useAuth();

    const handleTestLogin = () => {
        const testUser = {
            id: 'test-user-123',
            email: 'test@example.com',
            role: 'buyer' as const,
            firstName: 'Test',
            lastName: 'User',
            isEmailVerified: true
        };
        login(testUser, 'test-token-123');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">🔐 Authentication Test</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</div>
                        <div><strong>Token:</strong> {token ? token.substring(0, 20) + '...' : 'null'}</div>
                        <div><strong>Is Authenticated:</strong> {user ? '✅ Yes' : '❌ No'}</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <div className="space-y-4">
                        {!user ? (
                            <button 
                                onClick={handleTestLogin}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Test Login
                            </button>
                        ) : (
                            <button 
                                onClick={logout}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Test Protected Routes</h2>
                    <div className="space-y-2">
                        <div>
                            <Link href="/account" className="text-blue-600 hover:underline">
                                /account (Protected)
                            </Link>
                            <span className="text-gray-500 ml-2">
                                {user ? '✅ Should work' : '❌ Should redirect to login'}
                            </span>
                        </div>
                        <div>
                            <Link href="/signup" className="text-blue-600 hover:underline">
                                /signup (Public)
                            </Link>
                            <span className="text-gray-500 ml-2">✅ Should always work</span>
                        </div>
                        <div>
                            <Link href="/login" className="text-blue-600 hover:underline">
                                /login (Public)
                            </Link>
                            <span className="text-gray-500 ml-2">✅ Should always work</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}