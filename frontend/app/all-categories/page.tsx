'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Grid, List, TrendingUp, Package, Star } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    itemCount: number;
    isPopular: boolean;
    subcategories?: Category[];
}

export default function AllCategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        // Simulate API call - replace with actual API call
        setTimeout(() => {
            setCategories([
                {
                    id: '1',
                    name: 'Electronics',
                    slug: 'electronics',
                    description: 'Smartphones, laptops, cameras, and more tech gadgets',
                    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 15420,
                    isPopular: true,
                    subcategories: [
                        { id: '1a', name: 'Smartphones', slug: 'smartphones', description: '', image: '', itemCount: 3240, isPopular: true },
                        { id: '1b', name: 'Laptops', slug: 'laptops', description: '', image: '', itemCount: 2180, isPopular: true },
                        { id: '1c', name: 'Cameras', slug: 'cameras', description: '', image: '', itemCount: 1560, isPopular: false }
                    ]
                },
                {
                    id: '2',
                    name: 'Fashion & Apparel',
                    slug: 'fashion',
                    description: 'Clothing, shoes, accessories, and designer items',
                    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 12890,
                    isPopular: true,
                    subcategories: [
                        { id: '2a', name: 'Men\'s Clothing', slug: 'mens-clothing', description: '', image: '', itemCount: 4320, isPopular: true },
                        { id: '2b', name: 'Women\'s Clothing', slug: 'womens-clothing', description: '', image: '', itemCount: 5670, isPopular: true },
                        { id: '2c', name: 'Shoes', slug: 'shoes', description: '', image: '', itemCount: 2900, isPopular: true }
                    ]
                },
                {
                    id: '3',
                    name: 'Home & Garden',
                    slug: 'home-garden',
                    description: 'Furniture, decor, appliances, and garden supplies',
                    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 8760,
                    isPopular: true,
                    subcategories: [
                        { id: '3a', name: 'Furniture', slug: 'furniture', description: '', image: '', itemCount: 3240, isPopular: true },
                        { id: '3b', name: 'Home Decor', slug: 'home-decor', description: '', image: '', itemCount: 2890, isPopular: false },
                        { id: '3c', name: 'Appliances', slug: 'appliances', description: '', image: '', itemCount: 2630, isPopular: true }
                    ]
                },
                {
                    id: '4',
                    name: 'Automotive',
                    slug: 'automotive',
                    description: 'Cars, motorcycles, parts, and accessories',
                    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 6540,
                    isPopular: false,
                    subcategories: [
                        { id: '4a', name: 'Cars', slug: 'cars', description: '', image: '', itemCount: 2340, isPopular: true },
                        { id: '4b', name: 'Motorcycles', slug: 'motorcycles', description: '', image: '', itemCount: 890, isPopular: false },
                        { id: '4c', name: 'Parts & Accessories', slug: 'auto-parts', description: '', image: '', itemCount: 3310, isPopular: false }
                    ]
                },
                {
                    id: '5',
                    name: 'Sports & Recreation',
                    slug: 'sports',
                    description: 'Sports equipment, outdoor gear, and fitness items',
                    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 5430,
                    isPopular: false,
                    subcategories: [
                        { id: '5a', name: 'Fitness Equipment', slug: 'fitness', description: '', image: '', itemCount: 1890, isPopular: true },
                        { id: '5b', name: 'Outdoor Gear', slug: 'outdoor', description: '', image: '', itemCount: 2340, isPopular: false },
                        { id: '5c', name: 'Team Sports', slug: 'team-sports', description: '', image: '', itemCount: 1200, isPopular: false }
                    ]
                },
                {
                    id: '6',
                    name: 'Collectibles & Art',
                    slug: 'collectibles',
                    description: 'Antiques, artwork, coins, stamps, and rare items',
                    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 4320,
                    isPopular: true,
                    subcategories: [
                        { id: '6a', name: 'Artwork', slug: 'artwork', description: '', image: '', itemCount: 1560, isPopular: true },
                        { id: '6b', name: 'Antiques', slug: 'antiques', description: '', image: '', itemCount: 1890, isPopular: false },
                        { id: '6c', name: 'Coins & Stamps', slug: 'coins-stamps', description: '', image: '', itemCount: 870, isPopular: false }
                    ]
                },
                {
                    id: '7',
                    name: 'Books & Media',
                    slug: 'books-media',
                    description: 'Books, movies, music, and digital media',
                    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 3210,
                    isPopular: false,
                    subcategories: [
                        { id: '7a', name: 'Books', slug: 'books', description: '', image: '', itemCount: 1890, isPopular: false },
                        { id: '7b', name: 'Movies & TV', slug: 'movies-tv', description: '', image: '', itemCount: 890, isPopular: false },
                        { id: '7c', name: 'Music', slug: 'music', description: '', image: '', itemCount: 430, isPopular: false }
                    ]
                },
                {
                    id: '8',
                    name: 'Toys & Games',
                    slug: 'toys-games',
                    description: 'Toys, board games, video games, and collectible games',
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                    itemCount: 2890,
                    isPopular: false,
                    subcategories: [
                        { id: '8a', name: 'Video Games', slug: 'video-games', description: '', image: '', itemCount: 1340, isPopular: true },
                        { id: '8b', name: 'Board Games', slug: 'board-games', description: '', image: '', itemCount: 670, isPopular: false },
                        { id: '8c', name: 'Toys', slug: 'toys', description: '', image: '', itemCount: 880, isPopular: false }
                    ]
                }
            ]);
            setLoading(false);
        }, 1000);
    };

    // Filter categories based on search
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
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
                            <Package className="h-4 w-4 mr-2 text-blue-300" />
                            Browse All Categories
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                All Categories
                            </span>
                        </h1>

                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Discover thousands of items across all categories
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1">
                                    <div className="flex items-center">
                                        <Search className="absolute left-6 h-5 w-5 text-white/60" />
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-transparent text-white placeholder-white/60 text-lg focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* View Toggle */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {filteredCategories.length} Categories
                        </h2>
                        <p className="text-gray-600">Find exactly what you're looking for</p>
                    </div>

                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'grid'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Grid className="h-4 w-4 mr-2" />
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'list'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List className="h-4 w-4 mr-2" />
                            List
                        </button>
                    </div>
                </div>

                {/* Categories Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />

                                    {/* Popular Badge */}
                                    {category.isPopular && (
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                                                <Star className="h-3 w-3 mr-1" />
                                                Popular
                                            </span>
                                        </div>
                                    )}

                                    {/* Item Count */}
                                    <div className="absolute bottom-4 right-4">
                                        <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            {category.itemCount.toLocaleString()} items
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {category.description}
                                    </p>

                                    {/* Subcategories */}
                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Popular Subcategories
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {category.subcategories.slice(0, 3).map((sub) => (
                                                    <span
                                                        key={sub.id}
                                                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                                                    >
                                                        {sub.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 p-6"
                            >
                                <div className="flex items-center space-x-6">
                                    {/* Image */}
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {category.name}
                                                    </h3>
                                                    {category.isPopular && (
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Popular
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-3">
                                                    {category.description}
                                                </p>

                                                {/* Subcategories */}
                                                {category.subcategories && category.subcategories.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {category.subcategories.slice(0, 4).map((sub) => (
                                                            <span
                                                                key={sub.id}
                                                                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md"
                                                            >
                                                                {sub.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="flex items-center text-gray-600 mb-2">
                                                    <Package className="h-4 w-4 mr-1" />
                                                    <span className="text-sm font-medium">
                                                        {category.itemCount.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <TrendingUp className="h-4 w-4 mr-1" />
                                                    <span className="text-xs">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredCategories.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No categories found</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Try adjusting your search terms or browse all available categories
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}