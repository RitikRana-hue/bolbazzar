'use client';

import { useState, useEffect } from 'react';
import {
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Eye,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface Refund {
    id: string;
    orderId: string;
    amount: number;
    reason: string;
    status: 'initiated' | 'processing' | 'approved' | 'completed' | 'rejected';
    requestedAt: string;
    processedAt?: string;
    completedAt?: string;
    adminNotes?: string;
    refundMethod: 'original' | 'wallet' | 'bank';
    estimatedDays: number;
    orderDetails: {
        productTitle: string;
        productImage: string;
        orderDate: string;
        totalAmount: number;
    };
    timeline: RefundTimelineItem[];
}

interface RefundTimelineItem {
    status: string;
    description: string;
    timestamp: string;
    isCompleted: boolean;
}

export default function RefundsPage() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            // Mock data - replace with actual API call
            const mockRefunds: Refund[] = [
                {
                    id: 'REF-12345',
                    orderId: 'ORD-67890',
                    amount: 299.99,
                    reason: 'Product not as described',
                    status: 'processing',
                    requestedAt: '2024-01-15T10:30:00Z',
                    processedAt: '2024-01-16T09:15:00Z',
                    refundMethod: 'original',
                    estimatedDays: 5,
                    orderDetails: {
                        productTitle: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                        productImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=100',
                        orderDate: '2024-01-10T14:20:00Z',
                        totalAmount: 299.99
                    },
                    timeline: [
                        {
                            status: 'Refund Requested',
                            description: 'You requested a refund for this order',
                            timestamp: '2024-01-15T10:30:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Under Review',
                            description: 'Our team is reviewing your refund request',
                            timestamp: '2024-01-15T11:00:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Approved',
                            description: 'Your refund has been approved by our team',
                            timestamp: '2024-01-16T09:15:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Processing Payment',
                            description: 'Refund is being processed to your original payment method',
                            timestamp: '2024-01-16T10:00:00Z',
                            isCompleted: false
                        },
                        {
                            status: 'Completed',
                            description: 'Refund has been completed and funds transferred',
                            timestamp: '',
                            isCompleted: false
                        }
                    ]
                },
                {
                    id: 'REF-54321',
                    orderId: 'ORD-98765',
                    amount: 89.99,
                    reason: 'Damaged during shipping',
                    status: 'completed',
                    requestedAt: '2024-01-10T15:45:00Z',
                    processedAt: '2024-01-11T10:30:00Z',
                    completedAt: '2024-01-13T16:20:00Z',
                    refundMethod: 'wallet',
                    estimatedDays: 3,
                    orderDetails: {
                        productTitle: 'Wireless Bluetooth Headphones',
                        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
                        orderDate: '2024-01-08T12:15:00Z',
                        totalAmount: 89.99
                    },
                    timeline: [
                        {
                            status: 'Refund Requested',
                            description: 'You requested a refund for this order',
                            timestamp: '2024-01-10T15:45:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Under Review',
                            description: 'Our team reviewed your refund request',
                            timestamp: '2024-01-10T16:00:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Approved',
                            description: 'Your refund was approved',
                            timestamp: '2024-01-11T10:30:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Processing Payment',
                            description: 'Refund was processed to your wallet',
                            timestamp: '2024-01-11T11:00:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Completed',
                            description: 'Refund completed - funds added to your wallet',
                            timestamp: '2024-01-13T16:20:00Z',
                            isCompleted: true
                        }
                    ]
                },
                {
                    id: 'REF-11111',
                    orderId: 'ORD-22222',
                    amount: 149.99,
                    reason: 'Changed mind',
                    status: 'rejected',
                    requestedAt: '2024-01-08T09:20:00Z',
                    processedAt: '2024-01-09T14:45:00Z',
                    adminNotes: 'Refund request was made after the 7-day return window. Product shows signs of use.',
                    refundMethod: 'original',
                    estimatedDays: 0,
                    orderDetails: {
                        productTitle: 'Smart Watch Series 9',
                        productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
                        orderDate: '2023-12-25T10:30:00Z',
                        totalAmount: 149.99
                    },
                    timeline: [
                        {
                            status: 'Refund Requested',
                            description: 'You requested a refund for this order',
                            timestamp: '2024-01-08T09:20:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Under Review',
                            description: 'Our team reviewed your refund request',
                            timestamp: '2024-01-08T10:00:00Z',
                            isCompleted: true
                        },
                        {
                            status: 'Rejected',
                            description: 'Refund request was rejected',
                            timestamp: '2024-01-09T14:45:00Z',
                            isCompleted: true
                        }
                    ]
                }
            ];

            setRefunds(mockRefunds);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch refunds:', error);
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'initiated':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'processing':
                return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            initiated: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Initiated' },
            processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.initiated;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const viewRefundDetails = (refund: Refund) => {
        setSelectedRefund(refund);
        setShowDetails(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link href="/account/orders" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Orders
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Refund Status</h1>
                <p className="text-gray-600">Track the status of your refund requests</p>
            </div>

            {/* Refunds List */}
            <div className="space-y-4">
                {refunds.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Refunds Found</h3>
                        <p className="text-gray-500">You haven't requested any refunds yet.</p>
                        <Link
                            href="/account/orders"
                            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
                        >
                            View Your Orders →
                        </Link>
                    </div>
                ) : (
                    refunds.map((refund) => (
                        <div key={refund.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={refund.orderDetails.productImage}
                                        alt={refund.orderDetails.productTitle}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {refund.orderDetails.productTitle}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                            <span>Refund ID: {refund.id}</span>
                                            <span>Order: {refund.orderId}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Reason: {refund.reason}
                                        </p>
                                        <div className="flex items-center space-x-4">
                                            {getStatusBadge(refund.status)}
                                            <span className="text-sm text-gray-500">
                                                Requested on {new Date(refund.requestedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-semibold text-gray-900 mb-2">
                                        ${refund.amount.toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => viewRefundDetails(refund)}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </button>
                                </div>
                            </div>

                            {/* Quick Status */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(refund.status)}
                                        <span className="text-sm font-medium text-gray-900">
                                            {refund.status === 'processing' && 'Processing your refund...'}
                                            {refund.status === 'completed' && 'Refund completed'}
                                            {refund.status === 'rejected' && 'Refund was rejected'}
                                            {refund.status === 'approved' && 'Refund approved, processing payment'}
                                            {refund.status === 'initiated' && 'Refund request submitted'}
                                        </span>
                                    </div>
                                    {refund.status === 'processing' && (
                                        <span className="text-sm text-gray-500">
                                            Est. {refund.estimatedDays} business days
                                        </span>
                                    )}
                                    {refund.status === 'completed' && refund.completedAt && (
                                        <span className="text-sm text-green-600">
                                            Completed on {new Date(refund.completedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Refund Details Modal */}
            {showDetails && selectedRefund && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Refund Details - {selectedRefund.id}
                                </h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Product Info */}
                            <div className="flex items-start space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <img
                                    src={selectedRefund.orderDetails.productImage}
                                    alt={selectedRefund.orderDetails.productTitle}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {selectedRefund.orderDetails.productTitle}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Order Date:</span>
                                            <br />
                                            {new Date(selectedRefund.orderDetails.orderDate).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">Order Total:</span>
                                            <br />
                                            ${selectedRefund.orderDetails.totalAmount.toFixed(2)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Refund Amount:</span>
                                            <br />
                                            <span className="text-lg font-semibold text-green-600">
                                                ${selectedRefund.amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Refund Method:</span>
                                            <br />
                                            <span className="capitalize">{selectedRefund.refundMethod}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Reason */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Refund Reason</h4>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {selectedRefund.reason}
                                </p>
                            </div>

                            {/* Admin Notes (if rejected) */}
                            {selectedRefund.status === 'rejected' && selectedRefund.adminNotes && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                        <p className="text-red-700">{selectedRefund.adminNotes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-4">Refund Timeline</h4>
                                <div className="space-y-4">
                                    {selectedRefund.timeline.map((item, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${item.isCompleted
                                                    ? 'bg-green-100 border-2 border-green-500'
                                                    : 'bg-gray-100 border-2 border-gray-300'
                                                }`}>
                                                {item.isCompleted && (
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${item.isCompleted ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                    {item.status}
                                                </p>
                                                <p className={`text-sm ${item.isCompleted ? 'text-gray-600' : 'text-gray-400'
                                                    }`}>
                                                    {item.description}
                                                </p>
                                                {item.timestamp && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-3">
                                <Link
                                    href={`/account/orders/${selectedRefund.orderId}`}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center"
                                >
                                    View Order
                                </Link>
                                {selectedRefund.status !== 'completed' && selectedRefund.status !== 'rejected' && (
                                    <Link
                                        href={`/messages?order=${selectedRefund.orderId}`}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center flex items-center justify-center"
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Contact Support
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}