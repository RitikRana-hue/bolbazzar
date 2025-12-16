'use client';

import { useState } from 'react';
import {
    Shield,
    Bell,
    Eye,
    Lock,
    Mail,
    Smartphone,
    Trash2,
    Download,
    AlertTriangle,
    Check
} from 'lucide-react';

export default function AccountSettingsPage() {
    const [activeTab, setActiveTab] = useState('security');
    const [notifications, setNotifications] = useState({
        email: {
            orders: true,
            auctions: true,
            messages: false,
            promotions: true,
            security: true
        },
        push: {
            orders: true,
            auctions: true,
            messages: true,
            promotions: false,
            security: true
        },
        sms: {
            orders: false,
            auctions: true,
            messages: false,
            promotions: false,
            security: true
        }
    });

    const tabs = [
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'privacy', name: 'Privacy', icon: Eye },
        { id: 'account', name: 'Account', icon: Lock }
    ];

    const handleNotificationChange = (type: string, category: string) => {
        setNotifications(prev => ({
            ...prev,
            [type]: {
                ...prev[type as keyof typeof prev],
                [category]: !prev[type as keyof typeof prev][category as keyof typeof prev.email]
            }
        }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-gray-200">
                        <nav className="p-4 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4 mr-3" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                                </div>

                                {/* Password */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Lock className="h-5 w-5 text-gray-400 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Password</h3>
                                                <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Change Password
                                        </button>
                                    </div>
                                </div>

                                {/* Two-Factor Authentication */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                                                <p className="text-sm text-gray-600">Add an extra layer of security</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>

                                {/* Login Sessions */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Active Sessions</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Current Session</p>
                                                <p className="text-sm text-gray-600">Chrome on macOS • New York, NY</p>
                                            </div>
                                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Mobile App</p>
                                                <p className="text-sm text-gray-600">iPhone • Last seen 2 hours ago</p>
                                            </div>
                                            <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                                    <p className="text-gray-600">Choose how you want to be notified about activity on your account.</p>
                                </div>

                                {/* Notification Types */}
                                <div className="space-y-6">
                                    {['email', 'push', 'sms'].map((type) => (
                                        <div key={type} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center mb-4">
                                                {type === 'email' && <Mail className="h-5 w-5 text-gray-400 mr-2" />}
                                                {type === 'push' && <Bell className="h-5 w-5 text-gray-400 mr-2" />}
                                                {type === 'sms' && <Smartphone className="h-5 w-5 text-gray-400 mr-2" />}
                                                <h3 className="font-medium text-gray-900 capitalize">{type} Notifications</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {Object.entries(notifications[type as keyof typeof notifications]).map(([category, enabled]) => (
                                                    <div key={category} className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={enabled}
                                                                onChange={() => handleNotificationChange(type, category)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                                    <p className="text-gray-600">Control who can see your information and activity.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                                            <p className="text-sm text-gray-600">Who can see your profile information</p>
                                        </div>
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option>Everyone</option>
                                            <option>Registered Users</option>
                                            <option>Nobody</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Activity Status</h3>
                                            <p className="text-sm text-gray-600">Show when you're online</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Search Engine Indexing</h3>
                                            <p className="text-sm text-gray-600">Allow search engines to index your profile</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Data Analytics</h3>
                                            <p className="text-sm text-gray-600">Help improve our service with usage data</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h2>
                                    <p className="text-gray-600">Manage your account data and preferences.</p>
                                </div>

                                {/* Data Export */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Download className="h-5 w-5 text-blue-600 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Export Your Data</h3>
                                                <p className="text-sm text-gray-600">Download a copy of your account data</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Request Export
                                        </button>
                                    </div>
                                </div>

                                {/* Account Deactivation */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Deactivate Account</h3>
                                                <p className="text-sm text-gray-600">Temporarily disable your account</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                                            Deactivate
                                        </button>
                                    </div>
                                </div>

                                {/* Account Deletion */}
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Trash2 className="h-5 w-5 text-red-600 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">Delete Account</h3>
                                                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>

                                {/* Account Status */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <Check className="h-5 w-5 text-green-600 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Account Status: Active</h3>
                                            <p className="text-sm text-gray-600">Your account is in good standing</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}