'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    DollarSign,
    User,
    Package
} from 'lucide-react';

interface Dispute {
    id: string;
    orderId: string;
    buyerName: string;
    sellerName: string;
    productTitle: string;
    amount: number;
    reason: string;
    status: 'pending' | 'investigating' | 'resolved' | 'rejected';
    createdAt: string;
    description: string;
    evidence: string[];
}

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

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
                    buyerName: 'John Doe',
                    sellerName: 'TechStore Inc',
                    productTitle: 'iPhone 15 Pro Max 256GB',
                    amount: 1199.99,
                    reason: 'Item not as described',
                    status: 'pending',
                    createdAt: '2024-01-15T10:30:00Z',
                    description: 'The phone I received has scratches on the screen that were not mentioned in the listing.',
                    evidence: ['photo1.jpg', 'photo2.jpg']
                },
                {
                    id: '2',
                    orderId: 'ORD-12346',
                    buyerName: 'Jane Smith',
                    sellerName: 'ElectroWorld',
                    productTitle: 'MacBook Pro M3 14-inch',
                    amount: 2399.99,
                    reason: 'Item not received',
                    status: 'investigating',
                    createdAt: '2024-01-14T15:45:00Z',
                    description: 'I never received the laptop despite tracking showing it was delivered.',
                    evidence: ['tracking.pdf']
                },
                {
                    id: '3',
                    orderId: 'ORD-12347',
                    buyerName: 'Mike Wilson',
                    sellerName: 'GadgetHub',
                    productTitle: 'Samsung Galaxy S24 Ultra',
                    amount: 899.99,
                    reason: 'Defective item',
                    status: 'resolved',
                    createdAt: '2024-01-13T09:15:00Z',
                    description: 'The phone battery drains very quickly and overheats.',
                    evidence: ['battery_test.jpg', 'temperature_reading.jpg']
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
                return <Eye className="h-4 w-4" />;
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

    const resolveDispute = async (disputeId: string, resolution: 'refund' | 'reject') => {
        try {
            // API call to resolve dispute
            console.log(`Resolving dispute ${disputeId} with ${resolution}`);

            // Update local state
            setDisputes(prev => prev.map(dispute =>
                dispute.id === disputeId
                    ? { ...dispute, status: resolution === 'refund' ? 'resolved' : 'rejected' }
                    : dispute
            ));

            setSelectedDispute(null);
        } catch (error) {
            console.error('Failed to resolve dispute:', error);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
                    <p className="text-gray-600">Manage customer disputes and refund requests</p>
                </div>

                {/* Filter */}
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

            {/* Disputes List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dispute
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Parties
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDisputes.map((dispute) => (
                                <tr key={dispute.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {dispute.orderId}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {dispute.reason}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <div className="flex items-center mb-1">
                                                <User className="h-4 w-4 mr-1 text-blue-500" />
                                                {dispute.buyerName}
                                            </div>
                                            <div className="flex items-center">
                                                <Package className="h-4 w-4 mr-1 text-green-500" />
                                                {dispute.sellerName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            {dispute.amount.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                                            {getStatusIcon(dispute.status)}
                                            <span className="ml-1 capitalize">{dispute.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(dispute.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedDispute(dispute)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dispute Detail Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Dispute Details</h2>
                                <button
                                    onClick={() => setSelectedDispute(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedDispute.orderId}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <p className="mt-1 text-sm text-gray-900">${selectedDispute.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Buyer</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedDispute.buyerName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Seller</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedDispute.sellerName}</p>
                                </div>
                            </div>

                            {/* Product */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedDispute.productTitle}</p>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reason</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedDispute.reason}</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedDispute.description}</p>
                            </div>

                            {/* Evidence */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Evidence</label>
                                <div className="mt-1 space-y-2">
                                    {selectedDispute.evidence.map((file, index) => (
                                        <div key={index} className="flex items-center text-sm text-blue-600">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            {file}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedDispute.status === 'pending' && (
                                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => resolveDispute(selectedDispute.id, 'refund')}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Approve Refund
                                    </button>
                                    <button
                                        onClick={() => resolveDispute(selectedDispute.id, 'reject')}
                                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Reject Dispute
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}