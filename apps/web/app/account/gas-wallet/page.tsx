'use client';

import { useState, useEffect } from 'react';
import {
    Fuel,
    Plus,
    TrendingUp,
    Clock,
    CreditCard,
    Smartphone,
    Building,
    ArrowLeft,
    Info
} from 'lucide-react';
import Link from 'next/link';

interface GasWalletData {
    balance: number;
    totalToppedUp: number;
    totalUsed: number;
    monthlyUsage: number;
    averagePerAuction: number;
    transactions: Transaction[];
}

interface Transaction {
    id: string;
    type: 'topup' | 'usage' | 'refund';
    amount: number;
    description: string;
    date: string;
    status: string;
}

export default function GasWalletPage() {
    const [gasWallet, setGasWallet] = useState<GasWalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string>('card');
    const [amount, setAmount] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    // Payment form states
    const [cardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [upiId, setUpiId] = useState('');
    const [selectedBank] = useState('');

    const topUpMethods = [
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: <CreditCard className="h-5 w-5" />,
            fees: 'No fees'
        },
        {
            id: 'upi',
            name: 'UPI',
            icon: <Smartphone className="h-5 w-5" />,
            fees: 'No fees'
        },
        {
            id: 'netbanking',
            name: 'Net Banking',
            icon: <Building className="h-5 w-5" />,
            fees: 'Bank charges may apply'
        }
    ];



    const quickAmounts = [5, 10, 25, 50, 100, 200];

    useEffect(() => {
        fetchGasWalletData();
    }, []);

    const fetchGasWalletData = async () => {
        try {
            // Mock data - replace with actual API call
            const mockData: GasWalletData = {
                balance: 45.50,
                totalToppedUp: 200.00,
                totalUsed: 154.50,
                monthlyUsage: 32.75,
                averagePerAuction: 2.15,
                transactions: [
                    {
                        id: '1',
                        type: 'usage',
                        amount: -2.50,
                        description: 'Auction fee - iPhone 15 Pro',
                        date: '2024-01-15T10:30:00Z',
                        status: 'completed'
                    },
                    {
                        id: '2',
                        type: 'topup',
                        amount: 50.00,
                        description: 'Gas wallet top-up via UPI',
                        date: '2024-01-14T15:20:00Z',
                        status: 'completed'
                    },
                    {
                        id: '3',
                        type: 'usage',
                        amount: -1.75,
                        description: 'Auction fee - MacBook Air',
                        date: '2024-01-13T09:15:00Z',
                        status: 'completed'
                    }
                ]
            };

            setGasWallet(mockData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch gas wallet data:', error);
            setLoading(false);
        }
    };

    const handleTopUp = async () => {
        if (!amount || parseFloat(amount) < 5) {
            alert('Minimum top-up amount is $5');
            return;
        }

        setProcessing(true);

        try {
            let paymentDetails: any = {};

            switch (selectedMethod) {
                case 'card':
                    paymentDetails = cardDetails;
                    break;
                case 'upi':
                    paymentDetails = { upiId };
                    break;
                case 'netbanking':
                    paymentDetails = { bankCode: selectedBank };
                    break;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/gas-wallet/topup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    paymentMethod: selectedMethod,
                    paymentDetails
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Refresh wallet data
                await fetchGasWalletData();
                setShowTopUp(false);
                setAmount('');
                alert('Gas wallet topped up successfully!');
            } else {
                throw new Error(result.error || 'Top-up failed');
            }
        } catch (error) {
            console.error('Top-up failed:', error);
            alert('Top-up failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!gasWallet) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Failed to load gas wallet data</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link href="/account/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Fuel className="h-6 w-6 mr-2 text-orange-500" />
                            Gas Wallet
                        </h1>
                        <p className="text-gray-600">Manage your auction fees and seller charges</p>
                    </div>
                    <button
                        onClick={() => setShowTopUp(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Top Up
                    </button>
                </div>
            </div>

            {/* Gas Wallet Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">About Gas Wallet</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Your gas wallet is used to pay auction fees and seller charges.
                            Each auction listing costs between $1-5 depending on category and duration.
                            Alternatively, you can subscribe to unlimited auctions with our seller plans.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Overview */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Balance */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100">Available Balance</p>
                                <p className="text-3xl font-bold">${gasWallet.balance.toFixed(2)}</p>
                            </div>
                            <Fuel className="h-12 w-12 text-orange-200" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-orange-200">Estimated Auctions</p>
                                <p className="font-semibold">
                                    ~{Math.floor(gasWallet.balance / gasWallet.averagePerAuction)} auctions
                                </p>
                            </div>
                            <div>
                                <p className="text-orange-200">Avg. per Auction</p>
                                <p className="font-semibold">${gasWallet.averagePerAuction.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-green-500" />
                                <div className="ml-3">
                                    <p className="text-sm text-gray-600">Total Topped Up</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        ${gasWallet.totalToppedUp.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Fuel className="h-8 w-8 text-orange-500" />
                                <div className="ml-3">
                                    <p className="text-sm text-gray-600">Total Used</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        ${gasWallet.totalUsed.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-blue-500" />
                                <div className="ml-3">
                                    <p className="text-sm text-gray-600">This Month</p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        ${gasWallet.monthlyUsage.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {gasWallet.transactions.map((transaction) => (
                                <div key={transaction.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${transaction.type === 'topup'
                                            ? 'bg-green-100'
                                            : transaction.type === 'usage'
                                                ? 'bg-orange-100'
                                                : 'bg-blue-100'
                                            }`}>
                                            {transaction.type === 'topup' ? (
                                                <Plus className="h-4 w-4 text-green-600" />
                                            ) : transaction.type === 'usage' ? (
                                                <Fuel className="h-4 w-4 text-orange-600" />
                                            ) : (
                                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{transaction.description}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Auction Fee Guide */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Fees</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Electronics</span>
                                <span className="font-medium">$2.50</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fashion</span>
                                <span className="font-medium">$1.50</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Home & Garden</span>
                                <span className="font-medium">$2.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Collectibles</span>
                                <span className="font-medium">$3.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vehicles</span>
                                <span className="font-medium">$5.00</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <Link
                                href="/account/subscription"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View Subscription Plans →
                            </Link>
                        </div>
                    </div>

                    {/* Low Balance Warning */}
                    {gasWallet.balance < 10 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="bg-yellow-100 rounded-full p-1">
                                    <Fuel className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-900">Low Balance</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Your gas wallet is running low. Top up now to continue listing auctions.
                                    </p>
                                    <button
                                        onClick={() => setShowTopUp(true)}
                                        className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                                    >
                                        Top up now →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top-up Modal */}
            {showTopUp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Top Up Gas Wallet</h2>
                                <button
                                    onClick={() => setShowTopUp(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Amount Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Amount
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {quickAmounts.map((quickAmount) => (
                                        <button
                                            key={quickAmount}
                                            onClick={() => setAmount(quickAmount.toString())}
                                            className={`p-2 border rounded text-sm transition-colors ${amount === quickAmount.toString()
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            ${quickAmount}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        min="5"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimum: $5</p>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    {topUpMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedMethod === method.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSelectedMethod(method.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {method.icon}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{method.name}</p>
                                                    <p className="text-xs text-gray-500">{method.fees}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Details */}
                            {selectedMethod === 'upi' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="yourname@paytm"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowTopUp(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleTopUp}
                                    disabled={processing || !amount || parseFloat(amount) < 5}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Processing...' : `Add $${amount || '0.00'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}