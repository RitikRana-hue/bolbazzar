'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Clock,
    Gavel,
    Heart,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle,
    Eye,
    Filter,
    Calendar,
    Star,
    Zap,
    Timer
} from 'lucide-react';

interface SavedBid {
    id: string;
    auctionId: string;
    productTitle: string;
    productImage: string;
    currentBid: number;
    yourMaxBid: number;
    isWinning: boolean;
    auctionStatus: 'upcoming' | 'live' | 'ending-soon' | 'ended';
    startTime: string;
    endTime: string;
    seller: string;
    rating: number;
    reviews: number;
    category: string;
    watchers: number;
    totalBids: number;
    estimatedValue: number;
    condition: 'new' | 'used' | 'refurbished';
}

export default function SavedBidsPage() {
    const [savedBids, setSavedBids] = useState<SavedBid[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchSavedBids();

        // Update time every second for countdown timers
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchSavedBids = async () => {
        try {
            // Mock data - replace with actual API call
            const mockBids: SavedBid[] = [
                {
                    id: '1',
                    auctionId: 'AUC-001',
                    productTitle: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    currentBid: 1150.00,
                    yourMaxBid: 1200.00,
                    isWinning: false,
                    auctionStatus: 'live',
                    startTime: '2024-12-15T10:00:00Z',
                    endTime: '2024-12-18T20:00:00Z',
                    seller: 'TechStore Pro',
                    rating: 4.8,
                    reviews: 1247,
                    category: 'Electronics',
                    watchers: 89,
                    totalBids: 23,
                    estimatedValue: 1299.99,
                    condition: 'new'
                },
                {
                    id: '2',
                    auctionId: 'AUC-002',
                    productTitle: 'MacBook Pro M3 14-inch 512GB Space Black',
                    productImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    currentBid: 2100.00,
                    yourMaxBid: 2200.00,
                    isWinning: true,
                    auctionStatus: 'ending-soon',
                    startTime: '2024-12-16T14:00:00Z',
                    endTime: '2024-12-18T18:30:00Z',
                    seller: 'ElectroWorld',
                    rating: 4.9,
                    reviews: 634,
                    category: 'Electronics',
                    watchers: 156,
                    totalBids: 45,
                    estimatedValue: 2499.99,
                    condition: 'new'
                },
                {
                    id: '3',
                    auctionId: 'AUC-003',
                    productTitle: 'Vintage Rolex Submariner 1970s',
                    productImage: 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd6eaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    currentBid: 8500.00,
                    yourMaxBid: 9000.00,
                    isWinning: true,
                    auctionStatus: 'upcoming',
                    startTime: '2024-12-19T12:00:00Z',
                    endTime: '2024-12-22T18:00:00Z',
                    seller: 'Luxury Watches',
                    rating: 4.9,
                    reviews: 89,
                    category: 'Collectibles',
                    watchers: 234,
                    totalBids: 0,
                    estimatedValue: 12000.00,
                    condition: 'used'
                },
                {
                    id: '4',
                    auctionId: 'AUC-004',
                    productTitle: 'Nike Air Jordan 1 Retro High OG Chicago',
                    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    currentBid: 450.00,
                    yourMaxBid: 500.00,
                    isWinning: false,
                    auctionStatus: 'live',
                    startTime: '2024-12-17T09:00:00Z',
                    endTime: '2024-12-20T21:00:00Z',
                    seller: 'Sneaker Hub',
                    rating: 4.7,
                    reviews: 892,
                    category: 'Fashion',
                    watchers: 67,
                    totalBids: 18,
                    estimatedValue: 650.00,
                    condition: 'new'
                }
            ];

            setSavedBids(mockBids);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch saved bids:', error);
            setLoading(false);
        }
    };

    const getTimeUntilStart = (startTime: string) => {
        const start = new Date(startTime);
        const diff = start.getTime() - currentTime.getTime();

        if (diff <= 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        return `${minutes}m ${seconds}s`;
    };

    const getTimeRemaining = (endTime: string) => {
        const end = new Date(endTime);
        const diff = end.getTime() - currentTime.getTime();

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        return `${minutes}m ${seconds}s`;
    };

    const getStatusBadge = (bid: SavedBid) => {
        const timeUntilStart = getTimeUntilStart(bid.startTime);

        if (bid.auctionStatus === 'upcoming') {
            return (
                <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Timer className="h-4 w-4" />
                    <span>Starts in {timeUntilStart}</span>
                </div>
            );
        }

        if (bid.auctionStatus === 'ending-soon') {
            return (
                <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <span>Ending in {getTimeRemaining(bid.endTime)}</span>
                </div>
            );
        }

        if (bid.auctionStatus === 'live') {
            return (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Zap className="h-4 w-4" />
                    <span>Live • {getTimeRemaining(bid.endTime)}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                <XCircle className="h-4 w-4" />
                <span>Ended</span>
            </div>
        );
    };

    const getWinningStatus = (bid: SavedBid) => {
        if (bid.auctionStatus === 'upcoming') return null;

        if (bid.isWinning) {
            return (
                <div className="flex items-center space-x-1 text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>Winning</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center space-x-1 text-orange-600 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>Outbid</span>
                </div>
            );
        }
    };

    const filteredBids = savedBids.filter(bid => {
        switch (filter) {
            case 'upcoming':
                return bid.auctionStatus === 'upcoming';
            case 'live':
                return bid.auctionStatus === 'live';
            case 'winning':
                return bid.isWinning && bid.auctionStatus !== 'upcoming';
            case 'ending-soon':
                return bid.auctionStatus === 'ending-soon';
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
        <main className="bg-gray-50 py-8">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Bids</h1>
                        <p className="text-gray-600">
                            Track your auction bids and get notified when they start
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Bids ({savedBids.length})</option>
                            <option value="upcoming">Upcoming ({savedBids.filter(b => b.auctionStatus === 'upcoming').length})</option>
                            <option value="live">Live ({savedBids.filter(b => b.auctionStatus === 'live').length})</option>
                            <option value="winning">Winning ({savedBids.filter(b => b.isWinning && b.auctionStatus !== 'upcoming').length})</option>
                            <option value="ending-soon">Ending Soon ({savedBids.filter(b => b.auctionStatus === 'ending-soon').length})</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Saved</p>
                                <p className="text-2xl font-bold text-gray-900">{savedBids.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Heart className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Live Auctions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {savedBids.filter(b => b.auctionStatus === 'live').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Zap className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Currently Winning</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {savedBids.filter(b => b.isWinning && b.auctionStatus !== 'upcoming').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Starting Soon</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {savedBids.filter(b => b.auctionStatus === 'upcoming').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Timer className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {savedBids.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Gavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved bids yet</h2>
                        <p className="text-gray-600 mb-6">
                            Save auction items you're interested in to track when they start
                        </p>
                        <Link
                            href="/auctions"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Auctions
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredBids.map((bid) => (
                            <div key={bid.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="relative">
                                            <img
                                                src={bid.productImage}
                                                alt={bid.productTitle}
                                                className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute -top-2 -right-2">
                                                {getStatusBadge(bid)}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <Link
                                                    href={`/auctions/${bid.auctionId}`}
                                                    className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 group-hover:text-blue-600 transition-colors"
                                                >
                                                    {bid.productTitle}
                                                </Link>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span>{bid.rating}</span>
                                                    <span>({bid.reviews})</span>
                                                </div>
                                                <span>•</span>
                                                <span>{bid.seller}</span>
                                                <span>•</span>
                                                <span className="capitalize">{bid.condition}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                                                    <p className="font-bold text-lg text-gray-900">${bid.currentBid.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Your Max Bid</p>
                                                    <p className="font-bold text-lg text-blue-600">${bid.yourMaxBid.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="h-4 w-4" />
                                                        <span>{bid.watchers}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Gavel className="h-4 w-4" />
                                                        <span>{bid.totalBids} bids</span>
                                                    </div>
                                                </div>
                                                {getWinningStatus(bid)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                        <Link
                                            href={`/auctions/${bid.auctionId}`}
                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span>View Auction</span>
                                        </Link>

                                        <div className="flex items-center space-x-2">
                                            {bid.auctionStatus === 'live' && (
                                                <Link
                                                    href={`/auctions/${bid.auctionId}?bid=true`}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                >
                                                    Place Bid
                                                </Link>
                                            )}
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Heart className="h-5 w-5 fill-current" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Never Miss an Auction</h3>
                        <p className="text-gray-600 mb-6">
                            Get notified when your saved auctions are about to start or when you're outbid
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/auctions"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Browse More Auctions
                            </Link>
                            <Link
                                href="/account/settings"
                                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                            >
                                Notification Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}