'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Camera,
    MessageSquare,
    Package,
    DollarSign,
    Plus
} from 'lucide-react';

interface Dispute {
    id: string;
    orderId: string;
    productTitle: string;
    productImage: string;
    sellerName: string;
    amount: number;
    reason: string;
    status: 'pending' | 'investigating' | 'resolved' | 'rejected';
    createdAt: string;
    updatedAt: string;
    description: string;
    evidence: string[];
    adminResponse?: string;
    refundAmount?: number;
}

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            // Mock data - replace with actual API call
            const mockDisputes: Dispute[] = [
                {
                    id: '1',
                    orderId: 'ORD-12345',
                    productTitle: 'iPhone 15 Pro Max 256GB - Space Black',
                    productImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=200',
                    sellerName: 'TechStore Inc',
                    amount: 1199.99,
                    reason: 'Item not as described',
                    status: 'investigating',
                    createdAt: '2024-01-14T10:30:00Z',
                    updatedAt: '2024-01-15T14:20:00Z',
                    description: 'The phone I received has scratches on the screen that were not mentioned in the listing. The condition was listed as "Like New" but it clearly shows signs of use.',
                    evidence: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
                },
                {
                    id: '2',
                    orderId: 'ORD-12346',
                    productTitle: 'MacBook Pro M3 14-inch 512GB',
                    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
                    sellerName: 'ElectroWorld',
                    amount: 2399.99,
                    reason: 'Item not received',
                    status: 'resolved',
                    createdAt: '2024-01-10T15:45:00Z',
                    updatedAt: '2024-01-13T09:30:00Z',
                    description: 'I never received the laptop despite tracking showing it was delivered. I was home all day and no delivery was made.',
                    evidence: ['tracking_screenshot.jpg'],
                    adminResponse: 'After investigation, we found that the package was delivered to the wrong address. Full refund has been processed.',
                    refundAmount: 2399.99
                },
                {
                    id: '3',
                    orderId: 'ORD-12347',
                    productTitle: 'Samsung Galaxy S24 Ultra 1TB',
                    productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200',
                    sellerName: 'GadgetHub',
                    amount: 1299.99,
                    reason: 'Defective item',
                    status: 'pending',
                    createdAt: '2024-01-15T08:15:00Z',
                    updatedAt: '2024-01-15T08:15:00Z',
                    description: 'The phone battery drains extremely quickly (less than 2 hours) and the device gets very hot during normal use.',
                    evidence: ['battery_test.jpg', 'temperature_reading.jpg']
                },
                {
                    id: '4',
                    orderId: 'ORD-12348',
                    productTitle: 'iPad Pro 12.9-inch M2 256GB',
                    productImage: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200',
                    sellerName: 'TechStore Inc',
                    amount: 899.99,
                    reason: 'Wrong item received',
                    status: 'rejected',
                    createdAt: '2024-01-08T12:00:00Z',
                    updatedAt: '2024-01-12T16:45:00Z',
                    description: 'I ordered the 256GB model but received the 128GB model.',
                    evidence: ['receipt.jpg', 'device_storage.jpg'],
                    adminResponse: 'Upon review, the evidence shows the correct 256GB model was delivered. The storage shown in the screenshot includes system files.'
                }
            ];

            setDisputes(mockDisputes);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'investigating':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'investigating':
                return <AlertTriangle className="h-4 w-4" />;
            case 'resolved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const filteredDisputes = disputes.filter(dispute =>
        filter === 'all' || dispute.status === filter
    );

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Disputes</h1>
                    <p className="text-gray-600">Track and manage your order disputes</p>
                </div>

                <Link
                    href="/help/dispute"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    File New Dispute
                </Link>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2"
                    >
                        <option value="all">All Disputes</option>
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                            <p className="text-2xl font-bold text-gray-900">{disputes.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Clock className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {disputes.filter(d => d.status === 'pending' || d.status === 'investigating').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {disputes.filter(d => d.status === 'resolved').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Refunded</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${disputes.filter(d => d.refundAmount).reduce((sum, d) => sum + (d.refundAmount || 0), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disputes List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredDisputes.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
                        <p className="text-gray-500 mb-4">
                            {filter === 'all'
                                ? "You haven't filed any disputes yet."
                                : `No ${filter} disputes found.`
                            }
                        </p>
                        <Link
                            href="/help/dispute"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Learn About Disputes
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredDisputes.map((dispute) => (
                            <div key={dispute.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={dispute.productImage}
                                        alt={dispute.productTitle}
                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {dispute.productTitle}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Order #{dispute.orderId} • {dispute.sellerName}
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">
                                                    ${dispute.amount.toFixed(2)}
                                                </p>
                                            </div>

                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                                                {getStatusIcon(dispute.status)}
                                                <span className="ml-1 capitalize">{dispute.status}</span>
                                            </span>
                                        </div>

                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-700">
                                                Reason: {dispute.reason}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {dispute.description}
                                            </p>
                                        </div>

                                        {/* Evidence */}
                                        {dispute.evidence.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center space-x-2">
                                                    <Camera className="h-4 w-4 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {dispute.evidence.length} evidence file(s) attached
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Admin Response */}
                                        {dispute.adminResponse && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                                <div className="flex items-start space-x-2">
                                                    <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-700">Admin Response:</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {dispute.adminResponse}
                                                        </p>
                                                        {dispute.refundAmount && (
                                                            <p className="text-sm font-medium text-green-600 mt-1">
                                                                Refund: ${dispute.refundAmount.toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                            <div>
                                                Filed {new Date(dispute.createdAt).toLocaleDateString()}
                                                {dispute.updatedAt !== dispute.createdAt && (
                                                    <span> • Updated {new Date(dispute.updatedAt).toLocaleDateString()}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    href={`/account/orders/${dispute.orderId}`}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                                                >
                                                    <Package className="h-3 w-3 mr-1" />
                                                    View Order
                                                </Link>

                                                <Link
                                                    href={`/disputes/${dispute.id}`}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                                                >
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Need Help with a Dispute?</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Our dispute resolution process is designed to be fair and transparent.
                            We typically resolve disputes within 3-5 business days.
                        </p>
                        <div className="mt-3">
                            <Link
                                href="/help/dispute-process"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                Learn about our dispute process →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}