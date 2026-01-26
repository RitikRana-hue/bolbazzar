'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    DollarSign,
    Gavel,
    ShoppingCart,
    BarChart3,
    PieChart
} from 'lucide-react';

interface AnalyticsData {
    overview: {
        totalRevenue: number;
        revenueGrowth: number;
        totalUsers: number;
        userGrowth: number;
        totalOrders: number;
        orderGrowth: number;
        activeAuctions: number;
        auctionGrowth: number;
    };
    revenueChart: {
        labels: string[];
        data: number[];
    };
    userChart: {
        labels: string[];
        data: number[];
    };
    categoryBreakdown: {
        category: string;
        revenue: number;
        percentage: number;
    }[];
    topSellers: {
        name: string;
        revenue: number;
        orders: number;
    }[];
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            // Mock data - replace with actual API call
            const mockAnalytics: AnalyticsData = {
                overview: {
                    totalRevenue: 125430.50,
                    revenueGrowth: 15.2,
                    totalUsers: 1247,
                    userGrowth: 8.5,
                    totalOrders: 3456,
                    orderGrowth: 12.3,
                    activeAuctions: 89,
                    auctionGrowth: -2.1
                },
                revenueChart: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [15000, 18000, 22000, 19000, 25000, 28000]
                },
                userChart: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [150, 180, 220, 190, 250, 280]
                },
                categoryBreakdown: [
                    { category: 'Electronics', revenue: 45230.50, percentage: 36 },
                    { category: 'Fashion', revenue: 32150.25, percentage: 26 },
                    { category: 'Home & Garden', revenue: 25100.75, percentage: 20 },
                    { category: 'Sports', revenue: 15200.00, percentage: 12 },
                    { category: 'Others', revenue: 7749.00, percentage: 6 }
                ],
                topSellers: [
                    { name: 'TechStore Inc', revenue: 15430.50, orders: 89 },
                    { name: 'Fashion Hub', revenue: 12250.25, orders: 67 },
                    { name: 'ElectroWorld', revenue: 9875.75, orders: 45 },
                    { name: 'GadgetPro', revenue: 8650.00, orders: 38 },
                    { name: 'StyleMart', revenue: 7320.25, orders: 32 }
                ]
            };

            setAnalytics(mockAnalytics);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        const isPositive = value >= 0;
        return (
            <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(value)}%
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Failed to load analytics data</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Platform performance and insights</p>
                </div>

                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                </select>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(analytics.overview.totalRevenue)}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {formatPercentage(analytics.overview.revenueGrowth)}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analytics.overview.totalUsers.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {formatPercentage(analytics.overview.userGrowth)}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analytics.overview.totalOrders.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <ShoppingCart className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {formatPercentage(analytics.overview.orderGrowth)}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {analytics.overview.activeAuctions}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100">
                            <Gavel className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {formatPercentage(analytics.overview.auctionGrowth)}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {analytics.revenueChart.data.map((value, index) => {
                            const maxValue = Math.max(...analytics.revenueChart.data);
                            const height = (value / maxValue) * 100;
                            return (
                                <div key={index} className="flex flex-col items-center flex-1">
                                    <div
                                        className="bg-blue-500 rounded-t w-full"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <span className="text-xs text-gray-600 mt-2">
                                        {analytics.revenueChart.labels[index]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {analytics.userChart.data.map((value, index) => {
                            const maxValue = Math.max(...analytics.userChart.data);
                            const height = (value / maxValue) * 100;
                            return (
                                <div key={index} className="flex flex-col items-center flex-1">
                                    <div
                                        className="bg-green-500 rounded-t w-full"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <span className="text-xs text-gray-600 mt-2">
                                        {analytics.userChart.labels[index]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Category Breakdown & Top Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Revenue by Category</h2>
                        <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {analytics.categoryBreakdown.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{
                                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                                        }}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {category.category}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatCurrency(category.revenue)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {category.percentage}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Sellers */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Top Sellers</h2>
                        <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {analytics.topSellers.map((seller, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {seller.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {seller.orders} orders
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatCurrency(seller.revenue)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}