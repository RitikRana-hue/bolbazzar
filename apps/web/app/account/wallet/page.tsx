'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Smartphone,
    Building,
    DollarSign,
    Eye,
    EyeOff,
    Download
} from 'lucide-react';

interface WalletTransaction {
    id: string;
    type: 'topup' | 'payment' | 'refund' | 'withdrawal';
    amount: number;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
    paymentMethod?: string;
    referenceId: string;
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'upi' | 'netbanking' | 'wallet';
    name: string;
    details: string;
    isDefault: boolean;
}

export default function WalletPage() {
    const [balance, setBalance] = useState(156.78);
    const [showBalance, setShowBalance] = useState(true);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [topupAmount, setTopupAmount] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [showTopupModal, setShowTopupModal] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            // Mock data - replace with actual API calls
            const mockTransactions: WalletTransaction[] = [
                {
                    id: '1',
                    type: 'topup',
                    amount: 100.00,
                    description: 'Wallet top-up via UPI',
                    status: 'completed',
                    timestamp: '2024-01-15T10:30:00Z',
                    paymentMethod: 'upi',
                    referenceId: 'TOP-12345'
                },
                {
                    id: '2',
                    type: 'payment',
                    amount: -45.99,
                    description: 'Payment for iPhone Case',
                    status: 'completed',
                    timestamp: '2024-01-14T15:20:00Z',
                    referenceId: 'PAY-67890'
                },
                {
                    id: '3',
                    type: 'refund',
                    amount: 25.50,
                    description: 'Refund for cancelled order',
                    status: 'completed',
                    timestamp: '2024-01-13T09:15:00Z',
                    referenceId: 'REF-54321'
                },
                {
                    id: '4',
                    type: 'topup',
                    amount: 50.00,
                    description: 'Wallet top-up via Card',
                    status: 'pending',
                    timestamp: '2024-01-12T14:45:00Z',
                    paymentMethod: 'card',
                    referenceId: 'TOP-98765'
                }
            ];

            const mockPaymentMethods: PaymentMethod[] = [
                {
                    id: '1',
                    type: 'card',
                    name: 'Visa ending in 4242',
                    details: '**** **** **** 4242',
                    isDefault: true
                },
                {
                    id: '2',
                    type: 'upi',
                    name: 'UPI ID',
                    details: 'user@paytm',
                    isDefault: false
                },
                {
                    id: '3',
                    type: 'netbanking',
                    name: 'HDFC Bank',
                    details: 'Net Banking',
                    isDefault: false
                }
            ];

            setTransactions(mockTransactions);
            setPaymentMethods(mockPaymentMethods);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
            setLoading(false);
        }
    };

    const handleTopup = async () => {
        if (!topupAmount || !selectedPaymentMethod) return;

        try {
            // Mock topup - replace with actual API call
            const newTransaction: WalletTransaction = {
                id: Date.now().toString(),
                type: 'topup',
                amount: parseFloat(topupAmount),
                description: `Wallet top-up via ${paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name}`,
                status: 'pending',
                timestamp: new Date().toISOString(),
                paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.type,
                referenceId: `TOP-${Date.now()}`
            };

            setTransactions(prev => [newTransaction, ...prev]);
            setBalance(prev => prev + parseFloat(topupAmount));
            setShowTopupModal(false);
            setTopupAmount('');
            setSelectedPaymentMethod('');
        } catch (error) {
            console.error('Failed to top up wallet:', error);
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'topup':
                return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
            case 'payment':
                return <ArrowUpRight className="h-5 w-5 text-red-500" />;
            case 'refund':
                return <ArrowDownLeft className="h-5 w-5 text-blue-500" />;
            case 'withdrawal':
                return <ArrowUpRight className="h-5 w-5 text-orange-500" />;
            default:
                return <DollarSign className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPaymentMethodIcon = (type: string) => {
        switch (type) {
            case 'card':
                return <CreditCard className="h-4 w-4" />;
            case 'upi':
                return <Smartphone className="h-4 w-4" />;
            case 'netbanking':
                return <Building className="h-4 w-4" />;
            case 'wallet':
                return <Wallet className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
                    <p className="text-gray-600">Manage your wallet balance and transactions</p>
                </div>
                <button
                    onClick={() => setShowTopupModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Money
                </button>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 rounded-full">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm">Available Balance</p>
                                <div className="flex items-center space-x-2">
                                    <p className="text-3xl font-bold">
                                        {showBalance ? `$${balance.toFixed(2)}` : '****'}
                                    </p>
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="text-blue-200 hover:text-white"
                                    >
                                        {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-100 text-sm">Wallet ID</p>
                            <p className="text-lg font-mono">WLT-123456</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-blue-100 text-sm">This Month</p>
                            <p className="text-xl font-semibold">$234.50</p>
                        </div>
                        <div className="text-center">
                            <p className="text-blue-100 text-sm">Total Spent</p>
                            <p className="text-xl font-semibold">$1,456.78</p>
                        </div>
                        <div className="text-center">
                            <p className="text-blue-100 text-sm">Cashback</p>
                            <p className="text-xl font-semibold">$23.45</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    onClick={() => setShowTopupModal(true)}
                    className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                    <Plus className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium">Add Money</span>
                </button>

                <Link
                    href="/account/wallet/withdraw"
                    className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                    <ArrowUpRight className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-medium">Withdraw</span>
                </Link>

                <Link
                    href="/account/payment-methods"
                    className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Payment Methods</span>
                </Link>

                <Link
                    href="/account/transactions"
                    className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                    <Download className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium">Download Statement</span>
                </Link>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                        <Link
                            href="/account/transactions"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            View All
                        </Link>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-gray-100 rounded-full">
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {transaction.description}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <p className="text-sm text-gray-500">
                                                {transaction.referenceId}
                                            </p>
                                            {transaction.paymentMethod && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <div className="flex items-center space-x-1 text-gray-500">
                                                        {getPaymentMethodIcon(transaction.paymentMethod)}
                                                        <span className="text-sm capitalize">
                                                            {transaction.paymentMethod}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {getStatusBadge(transaction.status)}
                                        <span className="text-sm text-gray-500">
                                            {new Date(transaction.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top-up Modal */}
            {showTopupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Money to Wallet</h3>

                        <div className="space-y-4">
                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={topupAmount}
                                        onChange={(e) => setTopupAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    {[25, 50, 100, 200].map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => setTopupAmount(amount.toString())}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            ${amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    {paymentMethods.map((method) => (
                                        <label key={method.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={selectedPaymentMethod === method.id}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="mr-3"
                                            />
                                            <div className="flex items-center space-x-3">
                                                {getPaymentMethodIcon(method.type)}
                                                <div>
                                                    <p className="font-medium text-gray-900">{method.name}</p>
                                                    <p className="text-sm text-gray-500">{method.details}</p>
                                                </div>
                                            </div>
                                            {method.isDefault && (
                                                <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowTopupModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTopup}
                                disabled={!topupAmount || !selectedPaymentMethod}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add ${topupAmount || '0.00'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
