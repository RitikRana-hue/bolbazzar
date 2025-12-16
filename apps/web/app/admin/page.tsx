'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Package,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Gavel,
    ShoppingCart,
    Eye
} from 'lucide-react';

interface DashboardStats {
    totalUsers: number;
    totalListings: number;
    totalRevenue: number;
    activeAuctions: number;
    pendingDisputes: number;
    todayOrders: number;
}

interface RecentActivity {
    id: string;
    type: 'user_signup' | 'listing_created' | 'auction_won' | 'dispute_filed';
    description: string;
    timestamp: string;
    user: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalListings: 0,
        totalRevenue: 0,
        activeAuctions: 0,
        pendingDisputes: 0,
        todayOrders: 0,
    });

    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Mock data for now - replace with actual API calls
            setStats({
                totalUsers: 1247,
                totalListings: 3456,
                totalRevenue: 125430.50,
                activeAuctions: 89,
                pendingDisputes: 12,
                todayOrders: 156,
            });

            setRecentActivity([
                {
                    id: '1',
                    type: 'user_signup',
                    description: 'New user registered',
                    timestamp: '2 minutes ago',
                    user: 'john.doe@email.com'
                },
                {
                    id: '2',
                    type: 'auction_won',
                    description: 'Auction won for iPhone 15 Pro',
                    timestamp: '5 minutes ago',
                    user: 'jane.smith@email.com'
                },
                {
                    id: '3',
                    type: 'dispute_filed',
                    description: 'Dispute filed for order #12345',
                    timestamp: '10 minutes ago',
                    user: 'mike.wilson@email.com'
                },
                {
                    id: '4',
                    type: 'listing_created',
                    description: 'New listing: MacBook Pro M3',
                    timestamp: '15 minutes ago',
                    user: 'seller@example.com'
                },
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            color: 'bg-blue-500',
            change: '+12%'
        },
        {
            title: 'Active Listings',
            value: stats.totalListings.toLocaleString(),
            icon: Package,
            color: 'bg-green-500',
            change: '+8%'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-yellow-500',
            change: '+15%'
        },
        {
            title: 'Live Auctions',
            value: stats.activeAuctions.toString(),
            icon: Gavel,
            color: 'bg-purple-500',
            change: '+5%'
        },
        {
            title: 'Pending Disputes',
            value: stats.pendingDisputes.toString(),
            icon: AlertTriangle,
            color: 'bg-red-500',
            change: '-3%'
        },
        {
            title: "Today's Orders",
            value: stats.todayOrders.toString(),
            icon: ShoppingCart,
            color: 'bg-indigo-500',
            change: '+22%'
        },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_signup':
                return <Users className="h-4 w-4 text-blue-500" />;
            case 'listing_created':
                return <Package className="h-4 w-4 text-green-500" />;
            case 'auction_won':
                return <Gavel className="h-4 w-4 text-purple-500" />;
            case 'dispute_filed':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Eye className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to your admin dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.color}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                                <span className="text-sm text-gray-500 ml-1">from last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.description}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {activity.user} • {activity.timestamp}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <div>
                                        <p className="font-medium">Review Disputes</p>
                                        <p className="text-sm text-gray-500">{stats.pendingDisputes} pending</p>
                                    </div>
                                </div>
                            </button>

                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Package className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">Approve Listings</p>
                                        <p className="text-sm text-gray-500">23 awaiting approval</p>
                                    </div>
                                </div>
                            </button>

                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="font-medium">Process Payouts</p>
                                        <p className="text-sm text-gray-500">$12,450 ready</p>
                                    </div>
                                </div>
                            </button>

                            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="font-medium">User Verification</p>
                                        <p className="text-sm text-gray-500">15 pending verification</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}