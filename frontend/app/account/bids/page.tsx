'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Gavel,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Eye,
    Filter,
    Calendar
} from 'lucide-react';

interface Bid {
    id: string;
    auctionId: string;
    productTitle: string;
    productImage: string;
    bidAmount: number;
    maxBid: number;
    currentHighestBid: number;
    isWinning: boolean;
    auctionStatus: 'active' | 'ended' | 'won' | 'lost';
    auctionEndTime: string;
    bidTime: string;
    sellerId: string;
    sellerName: string;
}

export default function BidsPage() {
    const [bids, setBids] = useState<Bid[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBids();
    }, []);

    const fetchBids = async () => {
        try {
            // Mock data - replace with actual API call
            const mockBids: Bid[] = [
                {
                    id: '1',
                    auctionId: 'AUC-001',
                    productTitle: 'iPhone 15 Pro Max 256GB - Space Black',
                    productImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=200',
                    bidAmount: 1150.00,
                    maxBid: 1200.00,
                    currentHighestBid: 1175.00,
                    isWinning: false,
                    auctionStatus: 'active',
                    auctionEndTime: '2024-01-16T18:00:00Z',
                    bidTime: '2024-01-15T14:30:00Z',
                    sellerId: 'seller1',
                    sellerName: 'TechStore Inc'
                },
                {
                    id: '2',
                    auctionId: 'AUC-002',
                    productTitle: 'MacBook Pro M3 14-inch 512GB',
                    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
                    bidAmount: 2100.00,
                    maxBid: 2200.00,
                    currentHighestBid: 2100.00,
                    isWinning: true,
                    auctionStatus: 'active',
                    auctionEndTime: '2024-01-17T20:00:00Z',
                    bidTime: '2024-01-15T16:45:00Z',
                    sellerId: 'seller2',
                    sellerName: 'ElectroWorld'
                },
                {
                    id: '3',
                    auctionId: 'AUC-003',
                    productTitle: 'Samsung Galaxy S24 Ultra 1TB',
                    productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200',
                    bidAmount: 950.00,
                    maxBid: 1000.00,
                    currentHighestBid: 950.00,
                    isWinning: false,
                    auctionStatus: 'won',
                    auctionEndTime: '2024-01-14T22:00:00Z',
                    bidTime: '2024-01-14T21:55:00Z',
                    sellerId: 'seller3',
                    sellerName: 'GadgetHub'
                },
                {
                    id: '4',
                    auctionId: 'AUC-004',
                    productTitle: 'iPad Pro 12.9-inch M2 256GB',
                    productImage: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200',
                    bidAmount: 800.00,
                    maxBid: 850.00,
                    currentHighestBid: 825.00,
                    isWinning: false,
                    auctionStatus: 'lost',
                    auctionEndTime: '2024-01-13T19:00:00Z',
                    bidTime: '2024-01-13T18:30:00Z',
                    sellerId: 'seller1',
                    sellerName: 'TechStore Inc'
                }
            ];

            setBids(mockBids);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch bids:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status: string, isWinning: boolean) => {
        switch (status) {
            case 'active':
                return isWinning ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
            case 'won':
                return 'bg-green-100 text-green-800';
            case 'lost':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string, isWinning: boolean) => {
        switch (status) {
            case 'active':
                return isWinning ? <TrendingUp className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
            case 'won':
                return <CheckCircle className="h-4 w-4" />;
            case 'lost':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusText = (status: string, isWinning: boolean) => {
        switch (status) {
            case 'active':
                return isWinning ? 'Winning' : 'Outbid';
            case 'won':
                return 'Won';
            case 'lost':
                return 'Lost';
            default:
                return 'Active';
        }
    };

    const formatTimeRemaining = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Ended';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }

        return `${hours}h ${minutes}m`;
    };

    const filteredBids = bids.filter(bid => {
        switch (filter) {
            case 'active':
                return bid.auctionStatus === 'active';
            case 'winning':
                return bid.auctionStatus === 'active' && bid.isWinning;
            case 'won':
                return bid.auctionStatus === 'won';
            case 'lost':
                return bid.auctionStatus === 'lost';
            default:
                return true;
        }
    });

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
                    <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
                    <p className="text-gray-600">Track your auction bids and winnings</p>
                </div>

                {/* Filter */}
                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2"
                    >
                        <option value="all">All Bids</option>
                        <option value="active">Active</option>
                        <option value="winning">Winning</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Gavel className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Bids</p>
                            <p className="text-2xl font-bold text-gray-900">{bids.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {bids.filter(b => b.auctionStatus === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Won</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {bids.filter(b => b.auctionStatus === 'won').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Winning</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {bids.filter(b => b.auctionStatus === 'active' && b.isWinning).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bids List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredBids.length === 0 ? (
                    <div className="text-center py-12">
                        <Gavel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
                        <p className="text-gray-500 mb-4">
                            {filter === 'all'
                                ? "You haven't placed any bids yet."
                                : `No ${filter} bids found.`
                            }
                        </p>
                        <Link
                            href="/auctions"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Browse Auctions
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredBids.map((bid) => (
                            <div key={bid.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={bid.productImage}
                                        alt={bid.productTitle}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {bid.productTitle}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Seller: {bid.sellerName}
                                                </p>
                                            </div>

                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bid.auctionStatus, bid.isWinning)}`}>
                                                {getStatusIcon(bid.auctionStatus, bid.isWinning)}
                                                <span className="ml-1">{getStatusText(bid.auctionStatus, bid.isWinning)}</span>
                                            </span>
                                        </div>

                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Your Bid</p>
                                                <p className="font-medium">${bid.bidAmount.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Current High</p>
                                                <p className="font-medium">${bid.currentHighestBid.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Max Bid</p>
                                                <p className="font-medium">${bid.maxBid.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">
                                                    {bid.auctionStatus === 'active' ? 'Time Left' : 'Ended'}
                                                </p>
                                                <p className="font-medium">
                                                    {bid.auctionStatus === 'active'
                                                        ? formatTimeRemaining(bid.auctionEndTime)
                                                        : new Date(bid.auctionEndTime).toLocaleDateString()
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                Bid placed {new Date(bid.bidTime).toLocaleDateString()}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/auctions/${bid.auctionId}`}
                                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Auction
                                                </Link>

                                                {bid.auctionStatus === 'won' && (
                                                    <Link
                                                        href={`/checkout?auction=${bid.auctionId}`}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                    >
                                                        Complete Purchase
                                                    </Link>
                                                )}
                                            </div>
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