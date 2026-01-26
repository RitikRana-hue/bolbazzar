'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Bell, Grid, List, Star } from 'lucide-react';
import { watchlistApi, type WatchlistItem } from '@/lib/api/watchlist';

interface SavedItem extends WatchlistItem {
    rating?: number;
    reviews?: number;
    dateAdded: string;
    priceChange?: number;
    inStock: boolean;
    originalPrice?: number;
}

export default function SavedPage() {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('date-added');
    const [filterBy, setFilterBy] = useState('all');
    const [page] = useState(1);

    useEffect(() => {
        fetchSavedItems();
    }, [page]);

    const fetchSavedItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await watchlistApi.getWatchlist(page, 20);

            // Map API response to SavedItem format
            const items: SavedItem[] = response.watchlist.map(item => ({
                ...item,
                dateAdded: item.addedAt,
                inStock: item.stock > 0,
                rating: 4.5, // TODO: Get from product details
                reviews: 100, // TODO: Get from product details
            }));

            setSavedItems(items);
        } catch (err: any) {
            console.error('Failed to fetch saved items:', err);
            setError(err.message || 'Failed to load watchlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromSaved = async (productId: string) => {
        try {
            await watchlistApi.removeFromWatchlist(productId);
            setSavedItems(prev => prev.filter(item => item.productId !== productId));
        } catch (err: any) {
            console.error('Failed to remove from watchlist:', err);
            alert(err.message || 'Failed to remove from watchlist');
        }
    };

    const filteredItems = savedItems.filter(item => {
        if (filterBy === 'all') return true;
        if (filterBy === 'electronics') return item.category.toLowerCase() === 'electronics';
        if (filterBy === 'fashion') return item.category.toLowerCase() === 'fashion';
        if (filterBy === 'collectibles') return item.category.toLowerCase() === 'collectibles';
        if (filterBy === 'home') return item.category.toLowerCase() === 'home & garden';
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
            case 'name':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your watchlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-16">
                        <Heart className="h-16 w-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load watchlist</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={fetchSavedItems}
                            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Modern Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Animated background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full blur-lg animate-bounce"></div>
                    <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                            <Heart className="h-4 w-4 mr-2 text-pink-300" />
                            Your Wishlist Collection
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                                Saved Items
                            </span>
                        </h1>

                        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Keep track of your favorite items and get notified of price drops
                        </p>

                        {/* Stats */}
                        <div className="flex justify-center space-x-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{savedItems.length}</div>
                                <div className="text-purple-100 text-sm">Saved Items</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">
                                    {savedItems.filter(item => item.priceChange && item.priceChange < 0).length}
                                </div>
                                <div className="text-purple-100 text-sm">Price Drops</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">
                                    {savedItems.filter(item => item.inStock).length}
                                </div>
                                <div className="text-purple-100 text-sm">In Stock</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {savedItems.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved items yet</h2>
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
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
                            {/* Filter and Sort */}
                            <div className="flex flex-wrap gap-4">
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories ({savedItems.length})</option>
                                    <option value="electronics">Electronics ({savedItems.filter(i => i.category.toLowerCase() === 'electronics').length})</option>
                                    <option value="fashion">Fashion ({savedItems.filter(i => i.category.toLowerCase() === 'fashion').length})</option>
                                    <option value="collectibles">Collectibles ({savedItems.filter(i => i.category.toLowerCase() === 'collectibles').length})</option>
                                    <option value="home">Home & Garden ({savedItems.filter(i => i.category.toLowerCase() === 'home & garden').length})</option>
                                    <option value="price-drops">Price drops ({savedItems.filter(i => i.priceChange && i.priceChange < 0).length})</option>
                                    <option value="out-of-stock">Out of stock ({savedItems.filter(i => !i.inStock).length})</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="date-added">Recently Added</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name A-Z</option>
                                </select>
                            </div>

                            {/* View Mode and Actions */}
                            <div className="flex items-center space-x-4">
                                <div className="flex bg-white rounded-xl p-1 border border-gray-200">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'grid'
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Grid className="h-4 w-4 mr-2" />
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list'
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <List className="h-4 w-4 mr-2" />
                                        List
                                    </button>
                                </div>

                                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Bell className="h-4 w-4" />
                                    <span>Notifications</span>
                                </button>
                            </div>
                        </div>

                        {/* Items Grid/List */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortedItems.map((item) => (
                                    <div key={item.id} className="relative group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                                        <div className="relative">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                                                }}
                                            />

                                            {/* Saved Controls */}
                                            <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => removeFromSaved(item.productId)}
                                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 text-red-600 hover:scale-110 transition-all duration-200"
                                                    title="Remove from saved"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            {/* Status Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col space-y-1">
                                                {item.priceChange && item.priceChange < 0 && (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                                        ${Math.abs(item.priceChange).toFixed(2)} off
                                                    </span>
                                                )}
                                                {item.priceChange && item.priceChange > 0 && (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                                        +${item.priceChange.toFixed(2)}
                                                    </span>
                                                )}
                                                {!item.inStock && (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                                        Out of stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <Link
                                                href={`/p/${item.productId}`}
                                                className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 block"
                                            >
                                                {item.title}
                                            </Link>

                                            <div className="flex items-center space-x-2 mb-3">
                                                <span className="text-xl font-bold text-gray-900">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                                {item.originalPrice && item.originalPrice > item.price && (
                                                    <>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ${item.originalPrice.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    {item.rating && (
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-3 w-3 ${i < Math.floor(item.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.reviews && <span>({item.reviews})</span>}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    Saved {new Date(item.dateAdded).toLocaleDateString()}
                                                </span>
                                            </div>
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
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-24 h-24 object-cover rounded-lg"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <Link
                                                    href={`/p/${item.productId}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                                                >
                                                    {item.title}
                                                </Link>
                                                <p className="text-sm text-gray-600 mb-2">by {item.seller.username}</p>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    {item.rating && (
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < Math.floor(item.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {item.reviews && <span className="text-sm text-gray-600">({item.reviews})</span>}
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <span className="text-gray-500">Saved {new Date(item.dateAdded).toLocaleDateString()}</span>
                                                    <span className="text-gray-500">Category: {item.category}</span>
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
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                                                    {item.originalPrice && (
                                                        <span className="text-sm text-gray-500 line-through">${item.originalPrice.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => removeFromSaved(item.productId)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove from saved"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Categories Summary */}
                        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Saved Categories</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Electronics', 'Fashion', 'Collectibles', 'Home & Garden'].map((category) => {
                                    const count = savedItems.filter(item =>
                                        item.category.toLowerCase() === category.toLowerCase()
                                    ).length;

                                    return (
                                        <Link
                                            key={category}
                                            href={`/category/${category.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                                            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                        >
                                            <h4 className="font-medium text-gray-900">{category}</h4>
                                            <p className="text-sm text-gray-600">{count} saved items</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}