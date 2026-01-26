'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Heart,
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Gavel,
    MoreHorizontal
} from 'lucide-react';

interface Listing {
    id: string;
    title: string;
    image: string;
    price: number;
    originalPrice?: number;
    category: string;
    condition: string;
    status: 'active' | 'sold' | 'draft' | 'inactive';
    type: 'direct' | 'auction';
    views: number;
    favorites: number;
    createdAt: string;
    endTime?: string;
    currentBid?: number;
    totalBids?: number;
}

export default function ListingsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Mock listings data
    const listings: Listing[] = [
        {
            id: '1',
            title: 'iPhone 15 Pro Max 256GB - Space Black',
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=200',
            price: 899.99,
            originalPrice: 1199.99,
            category: 'Electronics',
            condition: 'Like New',
            status: 'active',
            type: 'direct',
            views: 245,
            favorites: 18,
            createdAt: '2024-01-15'
        },
        {
            id: '2',
            title: 'MacBook Air M2 13-inch - Silver',
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200',
            price: 850.00,
            category: 'Electronics',
            condition: 'Excellent',
            status: 'active',
            type: 'auction',
            views: 189,
            favorites: 25,
            createdAt: '2024-01-14',
            endTime: '2024-01-20T15:30:00Z',
            currentBid: 850.00,
            totalBids: 12
        },
        {
            id: '3',
            title: 'AirPods Pro 2nd Generation',
            image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200',
            price: 199.99,
            category: 'Electronics',
            condition: 'New',
            status: 'sold',
            type: 'direct',
            views: 156,
            favorites: 8,
            createdAt: '2024-01-12'
        },
        {
            id: '4',
            title: 'Vintage Leather Jacket - Size M',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
            price: 75.00,
            category: 'Fashion',
            condition: 'Good',
            status: 'draft',
            type: 'direct',
            views: 0,
            favorites: 0,
            createdAt: '2024-01-10'
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'sold':
                return <Package className="h-4 w-4 text-blue-500" />;
            case 'draft':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'inactive':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'sold':
                return 'bg-blue-100 text-blue-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const tabs = [
        { id: 'all', name: 'All Listings', count: listings.length },
        { id: 'active', name: 'Active', count: listings.filter(l => l.status === 'active').length },
        { id: 'sold', name: 'Sold', count: listings.filter(l => l.status === 'sold').length },
        { id: 'draft', name: 'Drafts', count: listings.filter(l => l.status === 'draft').length },
        { id: 'auction', name: 'Auctions', count: listings.filter(l => l.type === 'auction').length }
    ];

    const filteredListings = listings.filter(listing => {
        if (activeTab !== 'all') {
            if (activeTab === 'auction' && listing.type !== 'auction') return false;
            if (activeTab !== 'auction' && listing.status !== activeTab) return false;
        }
        if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                    <p className="text-gray-600 mt-1">Manage your products and auctions</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="views">Most Viewed</option>
                    </select>
                    <Link
                        href="/sell/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Listing
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Listings</p>
                            <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === 'active').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Eye className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Views</p>
                            <p className="text-2xl font-bold text-gray-900">{listings.reduce((sum, l) => sum + l.views, 0)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Favorites</p>
                            <p className="text-2xl font-bold text-gray-900">{listings.reduce((sum, l) => sum + l.favorites, 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.name}
                            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                        {/* Image */}
                        <div className="relative">
                            <img
                                src={listing.image}
                                alt={listing.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3 flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(listing.status)}`}>
                                    {getStatusIcon(listing.status)}
                                    <span className="ml-1">{listing.status}</span>
                                </span>
                                {listing.type === 'auction' && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        <Gavel className="h-3 w-3 mr-1" />
                                        Auction
                                    </span>
                                )}
                            </div>
                            <div className="absolute top-3 right-3">
                                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">{listing.title}</h3>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-lg font-bold text-gray-900">
                                        ${listing.type === 'auction' && listing.currentBid ? listing.currentBid.toFixed(2) : listing.price.toFixed(2)}
                                    </p>
                                    {listing.originalPrice && (
                                        <p className="text-sm text-gray-500 line-through">${listing.originalPrice.toFixed(2)}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">{listing.category}</p>
                                    <p className="text-xs text-gray-500">{listing.condition}</p>
                                </div>
                            </div>

                            {/* Auction Info */}
                            {listing.type === 'auction' && listing.endTime && (
                                <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-purple-600 font-medium">
                                            {listing.totalBids} bids
                                        </span>
                                        <span className="text-gray-600">
                                            Ends {new Date(listing.endTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {listing.views}
                                    </div>
                                    <div className="flex items-center">
                                        <Heart className="h-4 w-4 mr-1" />
                                        {listing.favorites}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(listing.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <Link
                                    href={`/p/${listing.id}`}
                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Link>
                                <Link
                                    href={`/account/listings/${listing.id}/edit`}
                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                </Link>
                                <button className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredListings.length === 0 && (
                <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === 'all' ? 'No listings yet' : `No ${activeTab} listings`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {activeTab === 'all'
                            ? 'Create your first listing to start selling.'
                            : `You don't have any ${activeTab} listings at the moment.`
                        }
                    </p>
                    {activeTab === 'all' && (
                        <Link
                            href="/sell/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Listing
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}