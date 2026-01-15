'use client';

import { API_CONFIG, getApiUrl } from '@/lib/config';

export default function DebugPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Debug Information</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div><strong>BASE_URL:</strong> {API_CONFIG.BASE_URL}</div>
                        <div><strong>WS_URL:</strong> {API_CONFIG.WS_URL}</div>
                        <div><strong>TIMEOUT:</strong> {API_CONFIG.TIMEOUT}ms</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'undefined'}</div>
                        <div><strong>NEXT_PUBLIC_WS_URL:</strong> {process.env.NEXT_PUBLIC_WS_URL || 'undefined'}</div>
                        <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">API URL Examples</h2>
                    <div className="space-y-2 font-mono text-sm">
                        <div><strong>getApiUrl('/auth/login'):</strong> {getApiUrl('/auth/login')}</div>
                        <div><strong>getApiUrl('/categories'):</strong> {getApiUrl('/categories')}</div>
                        <div><strong>getApiUrl('/wallet'):</strong> {getApiUrl('/wallet')}</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">API Test</h2>
                    <button 
                        onClick={async () => {
                            try {
                                const response = await fetch(getApiUrl('/categories'));
                                const data = await response.json();
                                console.log('Categories API Response:', data);
                                alert(`API Test Success! Found ${Array.isArray(data) ? data.length : 0} categories. Check console for details.`);
                            } catch (error) {
                                console.error('API Test Error:', error);
                                alert(`API Test Failed: ${error.message}`);
                            }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Test Categories API
                    </button>
                </div>
            </div>
        </div>
    );
}