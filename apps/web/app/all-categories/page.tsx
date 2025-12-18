'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Grid3X3, Package } from 'lucide-react';
import { categories, getCategorySlug } from '../data/categories';

export default function AllCategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter categories and subcategories based on search
    const filteredCategories = Object.entries(categories).reduce((acc, [categoryName, subcategories]) => {
        const filteredSubs = subcategories.filter(sub =>
            sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
            categoryName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredSubs.length > 0 || categoryName.toLowerCase().includes(searchQuery.toLowerCase())) {
            acc[categoryName] = searchQuery ? filteredSubs : subcategories;
        }

        return acc;
    }, {} as Record<string, string[]>);

    const totalItems = Object.values(filteredCategories).reduce((sum, subs) => sum + subs.length, 0);

    return (
        <div className="min-h-screen bg-white">
            {/* Improved Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="w-full px-6 py-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
                                <p className="text-gray-600 max-w-md">
                                    Discover thousands of items across all our categories and subcategories
                                </p>
                            </div>

                            {/* Enhanced Search */}
                            <div className="mt-4 md:mt-0 flex justify-center md:justify-end">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-4 py-3 border-2 border-white bg-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none w-80 text-base shadow-lg transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 py-8">
                {/* Categories List */}
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                    <Grid3X3 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Browse Categories</h2>
                                    <p className="text-sm text-gray-600">Find items across all categories</p>
                                </div>
                            </div>
                            <div className="bg-blue-50 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-blue-700">
                                    {totalItems} items
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Clean Category Layout */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                        {Object.entries(filteredCategories).map(([categoryName, subcategories]) => (
                            <div key={categoryName} className="space-y-4">
                                {/* Category Header */}
                                <div className="mb-4">
                                    <Link
                                        href={`/category/${getCategorySlug(categoryName)}`}
                                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        {categoryName}
                                    </Link>
                                    <div className="w-12 h-0.5 bg-blue-600 mt-1"></div>
                                </div>

                                {/* Subcategories List */}
                                <div className="space-y-2">
                                    {subcategories.map((subcategory) => (
                                        <Link
                                            key={subcategory}
                                            href={`/category/${getCategorySlug(subcategory)}`}
                                            className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                                        >
                                            {subcategory}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* No Results */}
                {Object.keys(filteredCategories).length === 0 && (
                    <div className="text-center py-16">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No categories found</h3>
                        <p className="text-gray-600">
                            Try adjusting your search terms to find what you're looking for
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}