'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Package,
    Gavel,
    AlertTriangle,
    DollarSign,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react';

const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/listings', label: 'Listings', icon: Package },
    { href: '/admin/auctions', label: 'Auctions', icon: Gavel },
    { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
    { href: '/admin/payouts', label: 'Payouts', icon: DollarSign },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0`}>
                <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
                    <h1 className="text-xl font-bold">InstaSell Admin</h1>
                </div>

                <nav className="mt-8">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                        <LogOut className="mr-3 h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className={`lg:ml-64 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                {/* Top bar */}
                <div className="bg-white shadow-sm border-b">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Welcome back, Admin
                            </div>
                            <img
                                src="https://via.placeholder.com/32"
                                alt="Admin Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}