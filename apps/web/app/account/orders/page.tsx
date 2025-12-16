'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle,
    Eye,
    MessageSquare,
    RefreshCw,
    Search,
    Calendar,
    Star,
    ArrowRight
} from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    date: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    total: number;
    items: {
        id: string;
        name: string;
        image: string;
        price: number;
        quantity: number;
        seller: string;
    }[];
    trackingNumber?: string;
    estimatedDelivery?: string;
}

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');

    // Mock orders data
    const orders: Order[] = [
        {
            id: '1',
            orderNumber: 'ORD-2024-001',
            date: '2024-01-15',
            status: 'delivered',
            total: 299.99,
            items: [
                {
                    id: '1',
                    name: 'iPhone 15 Pro Max 256GB',
                    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=100',
                    price: 299.99,
                    quantity: 1,
                    seller: 'TechStore'
                }
            ],
            trackingNumber: 'TRK123456789',
            estimatedDelivery: '2024-01-18'
        },
        {
            id: '2',
            orderNumber: 'ORD-2024-002',
            date: '2024-01-12',
            status: 'shipped',
            total: 89.99,
            items: [
                {
                    id: '2',
                    name: 'Wireless Bluetooth Headphones',
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
                    price: 89.99,
                    quantity: 1,
                    seller: 'AudioWorld'
                }
            ],
            trackingNumber: 'TRK987654321',
            estimatedDelivery: '2024-01-16'
        },
        {
            id: '3',
            orderNumber: 'ORD-2024-003',
            date: '2024-01-10',
            status: 'pending',
            total: 45.50,
            items: [
                {
                    id: '3',
                    name: 'USB-C Cable 6ft',
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
                    price: 15.50,
                    quantity: 2,
                    seller: 'CableShop'
                },
                {
                    id: '4',
                    name: 'Phone Case Clear',
                    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=100',
                    price: 14.50,
                    quantity: 1,
                    seller: 'AccessoryHub'
                }
            ]
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'confirmed':
                return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case 'shipped':
                return <Truck className="h-4 w-4 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'refunded':
                return <RefreshCw className="h-4 w-4 text-gray-500" />;
            default:
                return <Package className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const tabs = [
        { id: 'all', name: 'All Orders', count: orders.length },
        { id: 'pending', name: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { id: 'shipped', name: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { id: 'delivered', name: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
    ];

    const filteredOrders = orders.filter(order => {
        if (activeTab !== 'all' && order.status !== activeTab) return false;
        if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">Track and manage your purchases</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="status">Sort by Status</option>
                        <option value="total">Sort by Total</option>
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.name}
                            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Order {order.orderNumber}</h3>
                                            <div className="flex items-center mt-1 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(order.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {getStatusIcon(order.status)}
                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                                            <p className="text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={`/account/orders/${order.id}`}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Link>
                                            {order.status === 'delivered' && (
                                                <Link
                                                    href={`/messages?order=${order.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                    Contact
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-sm text-gray-600">Sold by {item.seller}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                                                {order.status === 'delivered' && (
                                                    <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-1">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Rate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tracking Info */}
                                {order.trackingNumber && (
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                                                <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                                            </div>
                                            {order.estimatedDelivery && (
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                                                    <p className="text-sm text-gray-600">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            <Link
                                                href={`/delivery/${order.id}`}
                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Track Package
                                                <ArrowRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {activeTab === 'all'
                                ? 'Start shopping to see your orders here.'
                                : `You don't have any ${activeTab} orders at the moment.`
                            }
                        </p>
                        {activeTab === 'all' && (
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Start Shopping
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Order Summary Stats */}
            {orders.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                            <div className="text-sm text-gray-600">Total Orders</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">Total Spent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {orders.filter(o => o.status === 'delivered').length}
                            </div>
                            <div className="text-sm text-gray-600">Delivered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {orders.reduce((sum, order) => sum + order.items.length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Items Purchased</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
