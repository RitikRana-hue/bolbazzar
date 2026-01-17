'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    Users,
    TrendingUp,
    Filter,
    Grid,
    List,
    Search,
    Star,
    DollarSign,
    Eye,
    RotateCcw,
    Sparkles,
    Wrench,
    Settings
} from 'lucide-react';
import AuctionCard from '../components/ui/AuctionCard';
import { auctionsApi } from '@/lib/api/auctions';
import { socketClient } from '@/lib/socket-client';
import { PaginatedResponse } from '@/lib/types';

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

interface ApiAuction {
    id: string;
    productId: string;
    sellerId: string;
    startingPrice: number;
    reservePrice?: number;
    currentPrice: number;
    bidIncrement: number;
    startTime: string;
    endTime: string;
    status: string;
    totalBids: number;
    winnerId?: string;
    autoExtend: boolean;
    extensionTime: number;
    title?: string;
    description?: string;
    condition?: string;
    categoryName?: string;
    categorySlug?: string;
    sellerName?: string;
    sellerFirstName?: string;
    sellerLastName?: string;
    primaryImage?: string;
    sellerRating?: number;
    isReserveMet?: boolean;
}

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('ending_soon');
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [condition, setCondition] = useState('all');
    const [page] = useState(1);

    const fetchAuctions = async () => {
        try {
            setLoading(true);

            const response: PaginatedResponse<ApiAuction> = await auctionsApi.getAuctions({
                search: searchQuery || undefined,
                minPrice: minPrice > 0 ? minPrice : undefined,
                maxPrice: maxPrice < 100000 ? maxPrice : undefined,
                sortBy: sortBy === 'ending_soon' ? 'endTime' : sortBy === 'price_low' ? 'currentPrice' : sortBy === 'price_high' ? 'currentPrice' : undefined,
                sortOrder: sortBy === 'price_high' ? 'DESC' : 'ASC',
                endingSoon: sortBy === 'ending_soon' ? true : undefined,
                page,
                limit: 12
            });

            // Transform API response to match component interface
            const transformedAuctions = response.data.map((auction: ApiAuction) => ({
                id: auction.id,
                productId: auction.productId,
                title: auction.title || 'Untitled Auction',
                image: auction.primaryImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                startingPrice: parseFloat(auction.startingPrice.toString()),
                currentPrice: parseFloat(auction.currentPrice.toString()),
                reservePrice: auction.reservePrice ? parseFloat(auction.reservePrice.toString()) : undefined,
                endTime: auction.endTime,
                totalBids: auction.totalBids || 0,
                isReserveMet: auction.isReserveMet || false,
                seller: {
                    name: auction.sellerName || 'Unknown Seller',
                    rating: auction.sellerRating || 4.5
                },
                condition: auction.condition || 'Used',
                category: auction.categoryName || 'Uncategorized'
            }));

            setAuctions(transformedAuctions);
        } catch (err: any) {
            console.error('Failed to fetch auctions:', err);
            // Handle error silently for now
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();

        // Setup Socket.IO for real-time bid updates
        socketClient.connect();

        // Listen for bid updates on all auctions
        socketClient.onNewBid((bidData: any) => {
            setAuctions(prev => prev.map(auction =>
                auction.id === bidData.auctionId
                    ? {
                        ...auction,
                        currentPrice: bidData.amount,
                        totalBids: (auction.totalBids || 0) + 1,
                        isReserveMet: bidData.isReserveMet || auction.isReserveMet
                    }
                    : auction
            ));
        });

        // Listen for auction end events
        socketClient.onAuctionEnded((data: any) => {
            setAuctions(prev => prev.filter(auction => auction.id !== data.auctionId));
        });

        return () => {
            socketClient.off('new_bid');
            socketClient.off('auction_ended');
        };
    }, [page, sortBy, searchQuery, minPrice, maxPrice, condition]);

    // Memoized filtering and sorting for better performance
    const sortedAuctions = useMemo(() => {
        // Filter auctions based on search and filters
        const filtered = auctions.filter(auction => {
            const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPrice = auction.currentPrice >= minPrice && auction.currentPrice <= maxPrice;
            return matchesSearch && matchesPrice;
        });

        // Sort auctions
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'ending_soon':
                    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
                case 'newest':
                    return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
                case 'price_low':
                    return a.currentPrice - b.currentPrice;
                case 'price_high':
                    return b.currentPrice - a.currentPrice;
                case 'most_bids':
                    return b.totalBids - a.totalBids;
                default:
                    return 0;
            }
        });
    }, [auctions, searchQuery, minPrice, maxPrice, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Professional Fixed Sidebar */}
                <div className="fixed left-0 top-[120px] h-[calc(100vh-120px)] w-80 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-xl z-10 overflow-y-auto">
                    {/* Sidebar Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Live Auctions</h1>
                                <p className="text-blue-100 text-sm">Find your perfect deal</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                <div className="text-lg font-bold">{auctions.length}</div>
                                <div className="text-xs text-blue-100">Active</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                                <div className="text-lg font-bold">892</div>
                                <div className="text-xs text-blue-100">Bidders</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Content */}
                    <div className="p-6 space-y-8">



                        {/* Price Range Slider */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                                    <DollarSign className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Price Range</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Price Display */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Min: ${minPrice.toLocaleString()}</span>
                                    <span className="text-gray-600">Max: ${maxPrice.toLocaleString()}</span>
                                </div>

                                {/* Min Price Slider */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Minimum Price</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100000"
                                        step="100"
                                        value={minPrice}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value <= maxPrice) {
                                                setMinPrice(value);
                                            }
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-green"
                                    />
                                </div>

                                {/* Max Price Slider */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Maximum Price</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100000"
                                        step="100"
                                        value={maxPrice}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value >= minPrice) {
                                                setMaxPrice(value);
                                            }
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-green"
                                    />
                                </div>

                                {/* Quick Price Presets */}
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <button
                                        onClick={() => { setMinPrice(0); setMaxPrice(500); }}
                                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Under $500
                                    </button>
                                    <button
                                        onClick={() => { setMinPrice(500); setMaxPrice(2000); }}
                                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        $500 - $2K
                                    </button>
                                    <button
                                        onClick={() => { setMinPrice(2000); setMaxPrice(10000); }}
                                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        $2K - $10K
                                    </button>
                                    <button
                                        onClick={() => { setMinPrice(10000); setMaxPrice(100000); }}
                                        className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        $10K+
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Condition */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                                    <Star className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Condition</h3>
                            </div>
                            <div className="space-y-1">
                                {[
                                    { value: 'all', label: 'Any Condition', icon: RotateCcw },
                                    { value: 'new', label: 'New', icon: Sparkles },
                                    { value: 'used', label: 'Used', icon: Wrench },
                                    { value: 'refurbished', label: 'Refurbished', icon: Settings }
                                ].map(cond => (
                                    <button
                                        key={cond.value}
                                        onClick={() => setCondition(cond.value)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center group ${condition === cond.value
                                            ? 'bg-orange-50 text-orange-700 border border-orange-200 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <cond.icon className={`mr-3 h-4 w-4 ${condition === cond.value ? 'text-orange-600' : 'text-gray-400'}`} />
                                        {cond.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <Filter className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900">Sort By</h3>
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                            >
                                <option value="ending_soon">Ending Soon</option>
                                <option value="newest">Newest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="most_bids">Most Bids</option>
                            </select>
                        </div>

                        {/* View Mode */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                    <Eye className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900">View Mode</h3>
                            </div>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${viewMode === 'grid'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Grid className="h-4 w-4 mr-1" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${viewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <List className="h-4 w-4 mr-1" />
                                    List
                                </button>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="pt-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setMinPrice(0);
                                    setMaxPrice(100000);
                                    setCondition('all');
                                    setSortBy('ending_soon');
                                }}
                                className="w-full py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium text-sm flex items-center justify-center group"
                            >
                                <Filter className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 ml-80 pt-[120px]">
                    {/* Top Bar with Search */}
                    <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-[120px] z-5">
                        <div className="flex items-center justify-between">
                            {/* Stats */}
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Active</p>
                                        <p className="text-sm font-bold text-gray-900">{sortedAuctions.length}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Bids Today</p>
                                        <p className="text-sm font-bold text-gray-900">1,247</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Bidders</p>
                                        <p className="text-sm font-bold text-gray-900">892</p>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search auctions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Auctions Content */}
                    <div className="p-8">
                        {loading ? (
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-4'
                            }>
                                {[...Array(6)].map((_, i) => (
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
                        ) : sortedAuctions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No auctions found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCondition('all');
                                        setMinPrice(0);
                                        setMaxPrice(100000);
                                    }}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-4'
                            }>
                                {sortedAuctions.map((auction) => (
                                    <AuctionCard
                                        key={auction.id}
                                        auction={auction}
                                        variant={viewMode === 'list' ? 'compact' : 'default'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}