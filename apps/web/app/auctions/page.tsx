'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Users, TrendingUp, Filter, Grid, List, Search } from 'lucide-react';
import AuctionCard from '../components/ui/AuctionCard';
// import Timer from '../components/ui/Timer';

interface Auction {
    id: string;
    productId: string;
    title: string;
    image: string;
    startingPrice: number;
    currentPrice: number;
    reservePrice?: number;
    endTime: string;
    totalBids: number;
    isReserveMet: boolean;
    seller: {
        name: string;
        rating: number;
    };
    condition: string;
    category: string;
}

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('ending_soon');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAuctions();
    }, [sortBy, filterCategory, searchQuery]);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: 'ACTIVE',
                sortBy,
                ...(filterCategory !== 'all' && { category: filterCategory }),
                ...(searchQuery && { search: searchQuery })
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions?${params}`);
            const data = await response.json();
            setAuctions(data.auctions || []);
        } catch (error) {
            console.error('Failed to fetch auctions:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'electronics', label: 'Electronics' },
        { value: 'fashion', label: 'Fashion' },
        { value: 'collectibles', label: 'Collectibles' },
        { value: 'vehicles', label: 'Vehicles' },
        { value: 'home-garden', label: 'Home & Garden' },
        { value: 'sports', label: 'Sports' }
    ];

    const sortOptions = [
        { value: 'ending_soon', label: 'Ending Soon' },
        { value: 'newest', label: 'Newest First' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'most_bids', label: 'Most Bids' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                Live Auctions
                            </h1>
                            <p className="text-gray-600 mt-2">Bid on unique items and win amazing deals</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search auctions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Filter className="h-4 w-4 mr-2" />
                                More Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Active Auctions</p>
                                <p className="text-2xl font-bold text-gray-900">{auctions.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Bids Today</p>
                                <p className="text-2xl font-bold text-gray-900">1,247</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Active Bidders</p>
                                <p className="text-2xl font-bold text-gray-900">892</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Ending Soon</p>
                                <p className="text-2xl font-bold text-gray-900">23</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auctions Grid/List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                                <div className="w-full h-48 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No active auctions found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new auctions.</p>
                        <Link
                            href="/sell"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start Your Own Auction
                        </Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                    }>
                        {auctions.map((auction) => (
                            <AuctionCard
                                key={auction.id}
                                auction={auction}
                                variant={viewMode === 'list' ? 'compact' : 'default'}
                            />
                        ))}
                    </div>
                )}

                {/* Featured Ending Soon */}
                {auctions.filter(a => {
                    const timeLeft = new Date(a.endTime).getTime() - new Date().getTime();
                    return timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
                }).length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                Ending Soon - Don't Miss Out!
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {auctions
                                    .filter(a => {
                                        const timeLeft = new Date(a.endTime).getTime() - new Date().getTime();
                                        return timeLeft < 24 * 60 * 60 * 1000;
                                    })
                                    .slice(0, 6)
                                    .map((auction) => (
                                        <AuctionCard
                                            key={auction.id}
                                            auction={auction}
                                            variant="featured"
                                        />
                                    ))}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}