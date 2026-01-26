'use client';

import { useState, useEffect } from 'react';
import {
    Bell,
    Package,
    Gavel,
    DollarSign,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    X,
    Settings,
    Filter
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'auction' | 'order' | 'payment' | 'message' | 'system' | 'dispute';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionUrl?: string;
    metadata?: {
        orderId?: string;
        auctionId?: string;
        amount?: number;
        productTitle?: string;
    };
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            // Mock data - replace with actual API call
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    type: 'auction',
                    title: 'Auction Won!',
                    message: 'Congratulations! You won the auction for iPhone 15 Pro Max.',
                    timestamp: '2024-01-15T10:30:00Z',
                    isRead: false,
                    actionUrl: '/orders/12345',
                    metadata: {
                        auctionId: 'AUC-001',
                        amount: 1199.99,
                        productTitle: 'iPhone 15 Pro Max 256GB'
                    }
                },
                {
                    id: '2',
                    type: 'order',
                    title: 'Order Shipped',
                    message: 'Your order has been shipped and is on its way.',
                    timestamp: '2024-01-15T09:15:00Z',
                    isRead: false,
                    actionUrl: '/account/orders',
                    metadata: {
                        orderId: 'ORD-12346',
                        productTitle: 'MacBook Pro M3 14-inch'
                    }
                },
                {
                    id: '3',
                    type: 'payment',
                    title: 'Payment Received',
                    message: 'Payment of $899.99 has been received for your sale.',
                    timestamp: '2024-01-15T08:45:00Z',
                    isRead: true,
                    actionUrl: '/account/payouts',
                    metadata: {
                        amount: 899.99,
                        orderId: 'ORD-12347'
                    }
                },
                {
                    id: '4',
                    type: 'message',
                    title: 'New Message',
                    message: 'You have a new message from TechStore Inc.',
                    timestamp: '2024-01-15T08:00:00Z',
                    isRead: true,
                    actionUrl: '/messages',
                    metadata: {}
                },
                {
                    id: '5',
                    type: 'auction',
                    title: 'Outbid Alert',
                    message: 'You have been outbid on Samsung Galaxy S24 Ultra.',
                    timestamp: '2024-01-14T22:30:00Z',
                    isRead: true,
                    actionUrl: '/auctions/AUC-002',
                    metadata: {
                        auctionId: 'AUC-002',
                        productTitle: 'Samsung Galaxy S24 Ultra'
                    }
                },
                {
                    id: '6',
                    type: 'dispute',
                    title: 'Dispute Update',
                    message: 'Your dispute for order #12348 has been resolved.',
                    timestamp: '2024-01-14T15:20:00Z',
                    isRead: true,
                    actionUrl: '/account/orders',
                    metadata: {
                        orderId: 'ORD-12348'
                    }
                },
                {
                    id: '7',
                    type: 'system',
                    title: 'Account Verification',
                    message: 'Your seller account has been verified successfully.',
                    timestamp: '2024-01-14T12:00:00Z',
                    isRead: true,
                    actionUrl: '/account',
                    metadata: {}
                }
            ];

            setNotifications(mockNotifications);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'auction':
                return <Gavel className="h-5 w-5 text-purple-500" />;
            case 'order':
                return <Package className="h-5 w-5 text-blue-500" />;
            case 'payment':
                return <DollarSign className="h-5 w-5 text-green-500" />;
            case 'message':
                return <MessageSquare className="h-5 w-5 text-indigo-500" />;
            case 'dispute':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'system':
                return <CheckCircle className="h-5 w-5 text-gray-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const markAsRead = async (notificationId: string) => {
        setNotifications(prev => prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));

        // TODO: API call to mark as read
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));

        // TODO: API call to mark all as read
    };

    const deleteNotification = async (notificationId: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

        // TODO: API call to delete notification
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes} min ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const filteredNotifications = notifications.filter(notif =>
        filter === 'all' ||
        (filter === 'unread' && !notif.isRead) ||
        (filter !== 'all' && filter !== 'unread' && notif.type === filter)
    );

    const unreadCount = notifications.filter(notif => !notif.isRead).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Mark all as read
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
                <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: 'Unread' },
                    { key: 'auction', label: 'Auctions' },
                    { key: 'order', label: 'Orders' },
                    { key: 'payment', label: 'Payments' },
                    { key: 'message', label: 'Messages' },
                    { key: 'dispute', label: 'Disputes' },
                    { key: 'system', label: 'System' }
                ].map(filterOption => (
                    <button
                        key={filterOption.key}
                        onClick={() => setFilter(filterOption.key)}
                        className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${filter === filterOption.key
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {filterOption.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-500">
                            {filter === 'all'
                                ? "You're all caught up! No new notifications."
                                : `No ${filter} notifications found.`
                            }
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${!notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>

                                            {/* Metadata */}
                                            {notification.metadata && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {notification.metadata.orderId && (
                                                        <span>Order: {notification.metadata.orderId}</span>
                                                    )}
                                                    {notification.metadata.auctionId && (
                                                        <span>Auction: {notification.metadata.auctionId}</span>
                                                    )}
                                                    {notification.metadata.amount && (
                                                        <span> • ${notification.metadata.amount.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {formatTimestamp(notification.timestamp)}
                                            </span>

                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                >
                                                    Mark read
                                                </button>
                                            )}

                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {notification.actionUrl && (
                                        <div className="mt-3">
                                            <a
                                                href={notification.actionUrl}
                                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                                            >
                                                View Details
                                                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}