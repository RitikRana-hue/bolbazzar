'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Grid, List, ChevronRight, TrendingUp, Star, Package } from 'lucide-react';
import { categories, popularCategories, trendingCategories, getCategorySlug } from '../data/categories';

const categoryImages = {
    "Electronics": "https://images.unsplash.com/photo-1550009158-94ae76552485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Fashion": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Home & Garden": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Collectibles & Art": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Vehicles": "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Sports & Recreation": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Books & Media": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Health & Beauty": "https://images.unsplash.com/photo-1522335789203-aabd1fc5445c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Toys & Hobbies": "https://images.unsplash.com/photo-1558877385-8c1b8b6e5e8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    "Business & Industrial": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"
};

export default function AllCategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredCategories = Object.entries(categories).filter(([categoryName, subcategories]) =>
        categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subcategories.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
                            <p className="text-gray-600">Discover millions of items across all categories</p>
                        </div>

                        {/* Search and View Controls */}
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                                />
                            </div>

                            <div className="flex border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Popular Categories */}
                <section className="mb-12">
                    <div className="flex items-center mb-6">
                        <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {popularCategories.map((categoryName) => (
                            <Link
                                key={categoryName}
                                href={`/category/${getCategorySlug(categoryName)}`}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                <div className="aspect-square relative">
                                    <img
                                        src={categoryImages[categoryName as keyof typeof categoryImages]}
                                        alt={categoryName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="text-white font-semibold text-sm">{categoryName}</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Trending Subcategories */}
                <section className="mb-12">
                    <div className="flex items-center mb-6">
                        <Star className="h-6 w-6 text-yellow-500 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trendingCategories.map((subcategory) => (
                            <Link
                                key={subcategory}
                                href={`/category/${getCategorySlug(subcategory)}`}
                                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {subcategory}
                                        </h3>
                                        <p className="text-sm text-gray-600">Trending category</p>
                                    </div>
                                    <div className="flex items-center text-orange-500">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        <ChevronRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* All Categories */}
                <section>
                    <div className="flex items-center mb-6">
                        <Package className="h-6 w-6 text-blue-500 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">All Categories</h2>
                        <span className="ml-3 text-sm text-gray-500">
                            ({filteredCategories.length} categories)
                        </span>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCategories.map(([categoryName, subcategories]) => (
                                <div key={categoryName} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-center mb-4">
                                            <img
                                                src={categoryImages[categoryName as keyof typeof categoryImages]}
                                                alt={categoryName}
                                                className="w-12 h-12 rounded-lg object-cover mr-4"
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                                                <p className="text-sm text-gray-500">{subcategories.length} subcategories</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {subcategories.slice(0, 5).map((subcategory) => (
                                                <Link
                                                    key={subcategory}
                                                    href={`/category/${getCategorySlug(subcategory)}`}
                                                    className="block text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                                >
                                                    {subcategory}
                                                </Link>
                                            ))}
                                            {subcategories.length > 5 && (
                                                <Link
                                                    href={`/category/${getCategorySlug(categoryName)}`}
                                                    className="block text-sm text-blue-600 font-medium px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    +{subcategories.length - 5} more →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm">
                            {filteredCategories.map(([categoryName, subcategories], index) => (
                                <div key={categoryName} className={`${index !== 0 ? 'border-t border-gray-200' : ''}`}>
                                    <button
                                        onClick={() => setSelectedCategory(
                                            selectedCategory === categoryName ? null : categoryName
                                        )}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={categoryImages[categoryName as keyof typeof categoryImages]}
                                                alt={categoryName}
                                                className="w-10 h-10 rounded-lg object-cover mr-4"
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                                                <p className="text-sm text-gray-500">{subcategories.length} subcategories</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${selectedCategory === categoryName ? 'rotate-90' : ''
                                            }`} />
                                    </button>

                                    {selectedCategory === categoryName && (
                                        <div className="px-6 pb-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-14">
                                                {subcategories.map((subcategory) => (
                                                    <Link
                                                        key={subcategory}
                                                        href={`/category/${getCategorySlug(subcategory)}`}
                                                        className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
                                                    >
                                                        {subcategory}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* No Results */}
                {filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-600">
                            Try adjusting your search terms or browse all categories above
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}