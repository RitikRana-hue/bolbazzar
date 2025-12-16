'use client';

import { useState, useEffect } from 'react';
import {
    CreditCard,
    Plus,
    Edit,
    Trash2,
    Check,
    Star,
    Shield,
    Smartphone
} from 'lucide-react';

interface PaymentMethod {
    id: string;
    type: 'card' | 'upi' | 'bank_account';
    isDefault: boolean;
    nickname?: string;
    // Card specific
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    // UPI specific
    upiId?: string;
    // Bank account specific
    bankName?: string;
    accountLast4?: string;
    accountType?: string;
    createdAt: string;
    isVerified: boolean;
}

export default function PaymentMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            // Mock data - replace with actual API call
            const mockPaymentMethods: PaymentMethod[] = [
                {
                    id: '1',
                    type: 'card',
                    isDefault: true,
                    nickname: 'Personal Visa',
                    last4: '4242',
                    brand: 'visa',
                    expiryMonth: 12,
                    expiryYear: 2027,
                    createdAt: '2024-01-10T00:00:00Z',
                    isVerified: true
                },
                {
                    id: '2',
                    type: 'upi',
                    isDefault: false,
                    nickname: 'Primary UPI',
                    upiId: 'user@paytm',
                    createdAt: '2024-01-08T00:00:00Z',
                    isVerified: true
                },
                {
                    id: '3',
                    type: 'card',
                    isDefault: false,
                    nickname: 'Business Card',
                    last4: '8888',
                    brand: 'mastercard',
                    expiryMonth: 8,
                    expiryYear: 2026,
                    createdAt: '2024-01-05T00:00:00Z',
                    isVerified: true
                },
                {
                    id: '4',
                    type: 'bank_account',
                    isDefault: false,
                    nickname: 'Savings Account',
                    bankName: 'HDFC Bank',
                    accountLast4: '1234',
                    accountType: 'savings',
                    createdAt: '2024-01-03T00:00:00Z',
                    isVerified: false
                }
            ];

            setPaymentMethods(mockPaymentMethods);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
            setLoading(false);
        }
    };

    const setDefaultPaymentMethod = async (methodId: string) => {
        setPaymentMethods(prev => prev.map(method => ({
            ...method,
            isDefault: method.id === methodId
        })));

        // TODO: API call to set default
    };

    const deletePaymentMethod = async (methodId: string) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
            // TODO: API call to delete
        }
    };

    const getCardIcon = (brand: string) => {
        switch (brand?.toLowerCase()) {
            case 'visa':
                return '💳';
            case 'mastercard':
                return '💳';
            case 'amex':
                return '💳';
            default:
                return '💳';
        }
    };

    const getMethodIcon = (type: string) => {
        switch (type) {
            case 'card':
                return <CreditCard className="h-6 w-6 text-blue-500" />;
            case 'upi':
                return <Smartphone className="h-6 w-6 text-green-500" />;
            case 'bank_account':
                return <Shield className="h-6 w-6 text-purple-500" />;
            default:
                return <CreditCard className="h-6 w-6 text-gray-500" />;
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
                    <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
                    <p className="text-gray-600">Manage your payment methods for faster checkout</p>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                </button>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Your payment information is secure</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            We use industry-standard encryption to protect your payment details.
                            Your full card numbers are never stored on our servers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                        <p className="text-gray-500 mb-4">
                            Add a payment method to make checkout faster and easier.
                        </p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Payment Method
                        </button>
                    </div>
                ) : (
                    paymentMethods.map((method) => (
                        <div key={method.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {/* Method Icon */}
                                    <div className="flex-shrink-0">
                                        {getMethodIcon(method.type)}
                                    </div>

                                    {/* Method Details */}
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {method.nickname ||
                                                    (method.type === 'card' ? `${method.brand?.toUpperCase()} ****${method.last4}` :
                                                        method.type === 'upi' ? method.upiId :
                                                            `${method.bankName} ****${method.accountLast4}`)}
                                            </h3>

                                            {method.isDefault && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                                    Default
                                                </span>
                                            )}

                                            {method.isVerified ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending Verification
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-1 text-sm text-gray-500">
                                            {method.type === 'card' && (
                                                <span>
                                                    {getCardIcon(method.brand!)} Expires {method.expiryMonth}/{method.expiryYear}
                                                </span>
                                            )}
                                            {method.type === 'upi' && (
                                                <span>UPI ID: {method.upiId}</span>
                                            )}
                                            {method.type === 'bank_account' && (
                                                <span>
                                                    {method.bankName} • {method.accountType?.toUpperCase()} • ****{method.accountLast4}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-400 mt-1">
                                            Added {new Date(method.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                    {!method.isDefault && (
                                        <button
                                            onClick={() => setDefaultPaymentMethod(method.id)}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Set as Default
                                        </button>
                                    )}

                                    <button className="p-2 text-gray-400 hover:text-gray-600">
                                        <Edit className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => deletePaymentMethod(method.id)}
                                        className="p-2 text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Payment Method Form */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Add Payment Method</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Payment Method Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method Type
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button className="p-3 border border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50">
                                        <CreditCard className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                                        <span className="text-xs font-medium">Card</span>
                                    </button>
                                    <button className="p-3 border border-gray-300 rounded-lg text-center hover:border-green-500 hover:bg-green-50">
                                        <Smartphone className="h-6 w-6 mx-auto mb-1 text-green-500" />
                                        <span className="text-xs font-medium">UPI</span>
                                    </button>
                                    <button className="p-3 border border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50">
                                        <Shield className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                                        <span className="text-xs font-medium">Bank</span>
                                    </button>
                                </div>
                            </div>

                            {/* Form fields would go here based on selected type */}
                            <div className="text-center py-8 text-gray-500">
                                <p>Select a payment method type to continue</p>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                                    Add Method
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}