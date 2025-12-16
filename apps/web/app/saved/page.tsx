'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Share, Bell, Grid, List, Star } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';

interface SavedItem {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    seller: string;
    rating: number;
    reviews: number;
    category: string;
    dateAdded: string;
    priceChange?: number;
    inStock: boolean;
}

export default function SavedPage() {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('date-added');
    const [filterBy, setFilterBy] = useState('all');

    useEffect(() => {
        fetchSavedItems();
    }, []);

    const fetchSavedItems = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockItems: SavedItem[] = [
                {
                    id: '1',
                    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                    price: 1199.99,
                    originalPrice: 1299.99,
                    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=300&h=300&fit=crop',
                    seller: 'TechStore Pro',
                    rating: 4.8,
                    reviews: 1247,
                    category: 'Electronics',
                    dateAdded: '2024-12-10',
                    priceChange: -50.00,
                    inStock: true
                },
                {
                    id: '2',
                    title: 'Nike Air Max 270 Sneakers',
                    price: 89.99,
                    originalPrice: 150.00,
                    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
                    seller: 'Sneaker Hub',
                    rating: 4.7,
                    reviews: 634,
                    category: 'Fashion',
                    dateAdded: '2024-12-08',
                    priceChange: 10.00,
                    inStock: true
                },
                {
                    id: '3',
                    title: 'Vintage Rolex Submariner',
                    price: 8999.99,
                    image: 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd6eaf?w=300&h=300&fit=crop',
                    seller: 'Luxury Watches',
                    rating: 4.9,
                    reviews: 89,
                    category: 'Collectibles',
                    dateAdded: '2024-12-05',
                    inStock: false
                }
            ];

            setSavedItems(mockItems);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch saved items:', error);
            setLoading(false);
        }
    };

    const removeFromSaved = (itemId: string) => {
        setSavedItems(prev => prev.filter(item => item.id !== itemId));
    };

    const filteredItems = savedItems.filter(item => {
        if (filterBy === 'all') return true;
        if (filterBy === 'electronics') return item.category.toLowerCase() === 'electronics';
        if (filterBy === 'fashion') return item.category.toLowerCase() === 'fashion';
        if (filterBy === 'collectibles') return item.category.toLowerCase() === 'collectibles';
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Items</h1>
                        <p className="text-gray-600">
                            {savedItems.length} items • Get notified when prices drop
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
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-4">
                                {/* Filter Dropdown */}
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All items ({savedItems.length})</option>
                                    <option value="electronics">Electronics ({savedItems.filter(i => i.category.toLowerCase() === 'electronics').length})</option>
                                    <option value="fashion">Fashion ({savedItems.filter(i => i.category.toLowerCase() === 'fashion').length})</option>
                                    <option value="collectibles">Collectibles ({savedItems.filter(i => i.category.toLowerCase() === 'collectibles').length})</option>
                                    <option value="price-drops">Price drops ({savedItems.filter(i => i.priceChange && i.priceChange < 0).length})</option>
                                    <option value="out-of-stock">Out of stock ({savedItems.filter(i => !i.inStock).length})</option>
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
                                    <option value="name">Name: A to Z</option>
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

                                        {/* Saved Controls */}
                                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => removeFromSaved(item.id)}
                                                className="p-2 bg-white/90 rounded-full shadow-md hover:bg-red-50 text-red-600"
                                                title="Remove from saved"
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
                                            {item.priceChange && item.priceChange > 0 && (
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                    +${item.priceChange.toFixed(2)}
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
                                                <Link
                                                    href={`/p/${item.id}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                                                >
                                                    {item.title}
                                                </Link>
                                                <p className="text-sm text-gray-600 mb-2">by {item.seller}</p>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-600">({item.reviews})</span>
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
                                                    onClick={() => removeFromSaved(item.id)}
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
        </main>
    );
}