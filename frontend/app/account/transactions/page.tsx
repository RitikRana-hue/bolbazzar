'use client';

import { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    Search,
    Calendar,
    CreditCard,
    Smartphone,
    Building,
    Wallet,
    RefreshCw,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

interface Transaction {
    id: string;
    type: 'payment' | 'refund' | 'wallet_topup' | 'gas_wallet_topup' | 'withdrawal' | 'auction_fee' | 'sale_payout';
    amount: number;
    status: 'completed' | 'pending' | 'failed' | 'processing';
    description: string;
    referenceId: string;
    paymentMethod?: string;
    createdAt: string;
    metadata?: any;
}

interface TransactionStats {
    totalIn: number;
    totalOut: number;
    thisMonth: number;
    pendingAmount: number;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<TransactionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        type: 'all',
        status: 'all',
        dateRange: '30',
        search: ''
    });

    const transactionTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'payment', label: 'Payments' },
        { value: 'refund', label: 'Refunds' },
        { value: 'wallet_topup', label: 'Wallet Top-ups' },
        { value: 'gas_wallet_topup', label: 'Gas Wallet Top-ups' },
        { value: 'withdrawal', label: 'Withdrawals' },
        { value: 'auction_fee', label: 'Auction Fees' },
        { value: 'sale_payout', label: 'Sale Payouts' }
    ];

    const statusTypes = [
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'failed', label: 'Failed' }
    ];

    const dateRanges = [
        { value: '7', label: 'Last 7 days' },
        { value: '30', label: 'Last 30 days' },
        { value: '90', label: 'Last 3 months' },
        { value: '365', label: 'Last year' },
        { value: 'all', label: 'All time' }
    ];

    useEffect(() => {
        fetchTransactions();
        fetchStats();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            // Mock data - replace with actual API call
            const mockTransactions: Transaction[] = [
                {
                    id: '1',
                    type: 'payment',
                    amount: -299.99,
                    status: 'completed',
                    description: 'Payment for iPhone 15 Pro',
                    referenceId: 'ORD-12345',
                    paymentMethod: 'card',
                    createdAt: '2024-01-15T10:30:00Z',
                    metadata: { orderId: 'ORD-12345' }
                },
                {
                    id: '2',
                    type: 'wallet_topup',
                    amount: 100.00,
                    status: 'completed',
                    description: 'Wallet top-up via UPI',
                    referenceId: 'TOP-67890',
                    paymentMethod: 'upi',
                    createdAt: '2024-01-14T15:20:00Z'
                },
                {
                    id: '3',
                    type: 'sale_payout',
                    amount: 450.00,
                    status: 'completed',
                    description: 'Sale payout for MacBook Air',
                    referenceId: 'PAY-54321',
                    createdAt: '2024-01-13T09:15:00Z'
                },
                {
                    id: '4',
                    type: 'auction_fee',
                    amount: -2.50,
                    status: 'completed',
                    description: 'Auction listing fee',
                    referenceId: 'AUC-98765',
                    createdAt: '2024-01-12T14:45:00Z'
                },
                {
                    id: '5',
                    type: 'refund',
                    amount: 89.99,
                    status: 'processing',
                    description: 'Refund for cancelled order',
                    referenceId: 'REF-11111',
                    createdAt: '2024-01-11T11:00:00Z'
                }
            ];

            // Apply filters
            let filteredTransactions = mockTransactions;

            if (filter.type !== 'all') {
                filteredTransactions = filteredTransactions.filter(t => t.type === filter.type);
            }

            if (filter.status !== 'all') {
                filteredTransactions = filteredTransactions.filter(t => t.status === filter.status);
            }

            if (filter.search) {
                filteredTransactions = filteredTransactions.filter(t =>
                    t.description.toLowerCase().includes(filter.search.toLowerCase()) ||
                    t.referenceId.toLowerCase().includes(filter.search.toLowerCase())
                );
            }

            setTransactions(filteredTransactions);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Mock stats - replace with actual API call
            const mockStats: TransactionStats = {
                totalIn: 1250.00,
                totalOut: 892.48,
                thisMonth: 357.52,
                pendingAmount: 89.99
            };

            setStats(mockStats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const getTransactionIcon = (type: string, amount: number) => {
        const isIncoming = amount > 0;

        switch (type) {
            case 'payment':
                return <CreditCard className="h-5 w-5 text-red-500" />;
            case 'wallet_topup':
            case 'gas_wallet_topup':
                return <Wallet className="h-5 w-5 text-blue-500" />;
            case 'refund':
            case 'sale_payout':
                return <TrendingUp className="h-5 w-5 text-green-500" />;
            case 'withdrawal':
                return <TrendingDown className="h-5 w-5 text-orange-500" />;
            case 'auction_fee':
                return <ArrowDownLeft className="h-5 w-5 text-red-500" />;
            default:
                return isIncoming ?
                    <ArrowDownLeft className="h-5 w-5 text-green-500" /> :
                    <ArrowUpRight className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getPaymentMethodIcon = (method?: string) => {
        switch (method) {
            case 'card':
                return <CreditCard className="h-4 w-4" />;
            case 'upi':
                return <Smartphone className="h-4 w-4" />;
            case 'netbanking':
                return <Building className="h-4 w-4" />;
            case 'wallet':
                return <Wallet className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const exportTransactions = () => {
        // Mock export functionality
        const csvContent = transactions.map(t =>
            `${t.createdAt},${t.type},${t.amount},${t.status},${t.description},${t.referenceId}`
        ).join('\n');

        const blob = new Blob([`Date,Type,Amount,Status,Description,Reference\n${csvContent}`],
            { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-600">View and manage all your payment transactions</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Total In</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    ${stats.totalIn.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <TrendingDown className="h-8 w-8 text-red-500" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Total Out</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    ${stats.totalOut.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-blue-500" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">This Month</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    ${stats.thisMonth.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <RefreshCw className="h-8 w-8 text-orange-500" />
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    ${stats.pendingAmount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <button
                        onClick={exportTransactions}
                        className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={filter.search}
                                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {transactionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {statusTypes.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Range
                        </label>
                        <select
                            value={filter.dateRange}
                            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {dateRanges.map((range) => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Transactions ({transactions.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No transactions found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            {getTransactionIcon(transaction.type, transaction.amount)}
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
                                                {new Date(transaction.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}