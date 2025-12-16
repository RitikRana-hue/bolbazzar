'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    Package,
    Eye,
    MessageSquare,
    Star,
    ArrowUp,
    ArrowDown,
    Plus,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';

export default function SellerDashboardPage() {
    const [timeRange, setTimeRange] = useState('7d');

    // Mock data
    const stats = {
        totalRevenue: 12450.75,
        revenueChange: 12.5,
        totalOrders: 89,
        ordersChange: 8.2,
        totalViews: 15420,
        viewsChange: -3.1,
        avgRating: 4.8,
        ratingChange: 0.2
    };

    const recentOrders = [
        {
            id: '1',
            orderNumber: 'ORD-2024-001',
            customer: 'John Smith',
            product: 'iPhone 15 Pro Max',
            amount: 899.99,
            status: 'shipped',
            date: '2024-01-15'
        },
        {
            id: '2',
            orderNumber: 'ORD-2024-002',
            customer: 'Sarah Johnson',
            product: 'MacBook Air M2',
            amount: 1299.99,
            status: 'delivered',
            date: '2024-01-14'
        },
        {
            id: '3',
            orderNumber: 'ORD-2024-003',
            customer: 'Mike Wilson',
            product: 'AirPods Pro',
            amount: 249.99,
            status: 'pending',
            date: '2024-01-13'
        }
    ];

    const topProducts = [
        {
            id: '1',
            name: 'iPhone 15 Pro Max',
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=100',
            sales: 25,
            revenue: 22475.00,
            views: 1250
        },
        {
            id: '2',
            name: 'MacBook Air M2',
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100',
            sales: 12,
            revenue: 15599.88,
            views: 890
        },
        {
            id: '3',
            name: 'AirPods Pro',
            image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=100',
            sales: 45,
            revenue: 11249.55,
            views: 2100
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
                    <p className="text-gray-600 mt-1">Track your sales performance and manage your business</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                    <Link
                        href="/sell/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Listing
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        {stats.revenueChange > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(stats.revenueChange)}%
                        </span>
                        <span className="text-sm text-gray-600 ml-1">vs last period</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        {stats.ordersChange > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${stats.ordersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(stats.ordersChange)}%
                        </span>
                        <span className="text-sm text-gray-600 ml-1">vs last period</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Views</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Eye className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        {stats.viewsChange > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${stats.viewsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(stats.viewsChange)}%
                        </span>
                        <span className="text-sm text-gray-600 ml-1">vs last period</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        {stats.ratingChange > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${stats.ratingChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(stats.ratingChange)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">vs last period</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Revenue chart would go here</p>
                        </div>
                    </div>
                </div>

                {/* Sales by Category */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Sales by Category</h2>
                        <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Category breakdown chart would go here</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link href="/account/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{order.customer} • {order.product}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-sm font-medium text-green-600">${order.amount}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                        <Link href="/account/listings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                                        {index + 1}
                                    </span>
                                </div>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className="text-sm text-gray-600">{product.sales} sales</span>
                                        <span className="text-sm text-green-600 font-medium">${product.revenue.toLocaleString()}</span>
                                        <span className="text-sm text-gray-500">{product.views} views</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/sell/create"
                        className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                    >
                        <Plus className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                            <p className="font-medium text-gray-900 group-hover:text-blue-600">Create Listing</p>
                            <p className="text-sm text-gray-600">Add new product</p>
                        </div>
                    </Link>

                    <Link
                        href="/account/orders"
                        className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                    >
                        <Package className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                            <p className="font-medium text-gray-900 group-hover:text-green-600">Manage Orders</p>
                            <p className="text-sm text-gray-600">Process shipments</p>
                        </div>
                    </Link>

                    <Link
                        href="/messages"
                        className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                    >
                        <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                            <p className="font-medium text-gray-900 group-hover:text-purple-600">Messages</p>
                            <p className="text-sm text-gray-600">Chat with buyers</p>
                        </div>
                    </Link>

                    <Link
                        href="/account/wallet"
                        className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
                    >
                        <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                            <p className="font-medium text-gray-900 group-hover:text-yellow-600">Payouts</p>
                            <p className="text-sm text-gray-600">Withdraw earnings</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}