'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Share, Bell, Grid, List } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import AuctionCard from '../components/ui/AuctionCard';

interface WatchlistItem {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    seller: string;
    rating: number;
    reviews: number;
    isAuction: boolean;
    endTime?: string;
    currentBid?: number;
    bids?: number;
    dateAdded: string;
    priceChange?: number;
    inStock: boolean;
}

export default function WatchlistPage() {
    const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('date-added');
    const [filterBy, setFilterBy] = useState('all');

    useEffect(() => {
        fetchWatchlistItems();
    }, []);

    const fetchWatchlistItems = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockItems: WatchlistItem[] = [
                {
                    id: '1',
                    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                    price: 1199.99,
                    originalPrice: 1299.99,
                    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=300&h=300&fit=crop',
                    seller: 'TechStore Pro',
                    rating: 4.8,
                    reviews: 1247,
                    isAuction: false,
                    dateAdded: '2024-12-10',
                    priceChange: -50.00,
                    inStock: true
                },
                {
                    id: '2',
                    title: 'MacBook Pro M3 14-inch - Space Black',
                    price: 850.00,
                    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
                    seller: 'Apple Certified',
                    rating: 4.9,
                    reviews: 892,
                    isAuction: true,
                    endTime: '2024-12-15T18:30:00Z',
                    currentBid: 850.00,
                    bids: 23,
                    dateAdded: '2024-12-08',
                    inStock: true
                },
                {
                    id: '3',
                    title: 'Samsung Galaxy S24 Ultra 512GB',
                    price: 999.99,
                    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
                    seller: 'Galaxy Store',
                    rating: 4.7,
                    reviews: 634,
                    isAuction: false,
                    dateAdded: '2024-12-05',
                    priceChange: 25.00,
                    inStock: false
                }
            ];

            setWatchlistItems(mockItems);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch watchlist items:', error);
            setLoading(false);
        }
    };

    const removeFromWatchlist = (itemId: string) => {
        setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
    };

    const filteredItems = watchlistItems.filter(item => {
        if (filterBy === 'all') return true;
        if (filterBy === 'auctions') return item.isAuction;
        if (filterBy === 'buy-now') return !item.isAuction;
        if (filterBy === 'price-drops') return item.priceChange && item.priceChange < 0;
        if (filterBy === 'out-of-stock') return !item.inStock;
        return true;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        switch (sortBy) {
            case 'date-added':
                return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'ending-soon':
                if (!a.isAuction || !b.isAuction) return 0;
                return new Date(a.endTime!).getTime() - new Date(b.endTime!).getTime();
            default:
                return 0;
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Watchlist</h1>
                        <p className="text-gray-600">
                            {watchlistItems.length} items • Get notified when prices drop
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            <Share size={16} />
                            <span>Share list</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Bell size={16} />
                            <span>Notification settings</span>
                        </button>
                    </div>
                </div>

                {watchlistItems.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your watchlist is empty</h2>
                        <p className="text-gray-600 mb-6">
                            Save items you're interested in to keep track of them
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-4">
                                {/* Filter Dropdown */}
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All items ({watchlistItems.length})</option>
                                    <option value="auctions">Auctions ({watchlistItems.filter(i => i.isAuction).length})</option>
                                    <option value="buy-now">Buy It Now ({watchlistItems.filter(i => !i.isAuction).length})</option>
                                    <option value="price-drops">Price drops ({watchlistItems.filter(i => i.priceChange && i.priceChange < 0).length})</option>
                                    <option value="out-of-stock">Out of stock ({watchlistItems.filter(i => !i.inStock).length})</option>
                                </select>

                                {/* Sort Dropdown */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date-added">Recently added</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="ending-soon">Ending soon</option>
                                </select>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Items Grid/List */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortedItems.map((item) => (
                                    <div key={item.id} className="relative group">
                                        {item.isAuction ? (
                                            <AuctionCard
                                                id={item.id}
                                                title={item.title}
                                                currentBid={item.currentBid!}
                                                bids={item.bids!}
                                                endTime={item.endTime!}
                                                image={item.image}
                                                seller={item.seller}
                                            />
                                        ) : (
                                            <ProductCard
                                                id={item.id}
                                                title={item.title}
                                                price={item.price}
                                                originalPrice={item.originalPrice}
                                                image={item.image}
                                                seller={item.seller}
                                                rating={item.rating}
                                                reviews={item.reviews}
                                            />
                                        )}

                                        {/* Watchlist Controls */}
                                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => removeFromWatchlist(item.id)}
                                                className="p-2 bg-white/90 rounded-full shadow-md hover:bg-red-50 text-red-600"
                                                title="Remove from watchlist"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Status Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col space-y-1">
                                            {item.priceChange && item.priceChange < 0 && (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    ${Math.abs(item.priceChange).toFixed(2)} off
                                                </span>
                                            )}
                                            {!item.inStock && (
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                    Out of stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedItems.map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center space-x-6">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">by {item.seller}</p>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <span className="text-gray-500">Added {new Date(item.dateAdded).toLocaleDateString()}</span>
                                                    {item.priceChange && (
                                                        <span className={`${item.priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {item.priceChange < 0 ? '↓' : '↑'} ${Math.abs(item.priceChange).toFixed(2)}
                                                        </span>
                                                    )}
                                                    {!item.inStock && (
                                                        <span className="text-red-600">Out of stock</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {item.isAuction ? (
                                                    <div>
                                                        <p className="text-lg font-bold text-gray-900">${item.currentBid?.toFixed(2)}</p>
                                                        <p className="text-sm text-gray-600">{item.bids} bids</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</p>
                                                        {item.originalPrice && (
                                                            <p className="text-sm text-gray-500 line-through">${item.originalPrice.toFixed(2)}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => removeFromWatchlist(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove from watchlist"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}