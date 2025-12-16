'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Zap,
    Clock,
    Tag,
    TrendingUp,
    Heart,
    Filter,
    Grid,
    List,
    Star
} from 'lucide-react';

interface Offer {
    id: string;
    type: 'flash_sale' | 'daily_deal' | 'clearance' | 'bundle';
    title: string;
    description: string;
    image: string;
    originalPrice: number;
    salePrice: number;
    discountPercentage: number;
    endTime: string;
    stock: number;
    sold: number;
    seller: string;
    rating: number;
    reviewCount: number;
    isLimited: boolean;
    category: string;
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('discount');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            // Mock data - replace with actual API call
            const mockOffers: Offer[] = [
                {
                    id: '1',
                    type: 'flash_sale',
                    title: 'iPhone 15 Pro Max 256GB - Space Black',
                    description: 'Latest iPhone with titanium design and A17 Pro chip',
                    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=300',
                    originalPrice: 1199.99,
                    salePrice: 999.99,
                    discountPercentage: 17,
                    endTime: '2024-01-16T23:59:59Z',
                    stock: 50,
                    sold: 23,
                    seller: 'TechStore Inc',
                    rating: 4.8,
                    reviewCount: 156,
                    isLimited: true,
                    category: 'Electronics'
                },
                {
                    id: '2',
                    type: 'daily_deal',
                    title: 'MacBook Pro M3 14-inch 512GB',
                    description: 'Professional laptop with M3 chip and Liquid Retina XDR display',
                    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
                    originalPrice: 2399.99,
                    salePrice: 1999.99,
                    discountPercentage: 17,
                    endTime: '2024-01-16T23:59:59Z',
                    stock: 25,
                    sold: 8,
                    seller: 'ElectroWorld',
                    rating: 4.9,
                    reviewCount: 89,
                    isLimited: false,
                    category: 'Electronics'
                },
                {
                    id: '3',
                    type: 'clearance',
                    title: 'Samsung Galaxy S23 Ultra 256GB',
                    description: 'Previous generation flagship with S Pen and 200MP camera',
                    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300',
                    originalPrice: 1199.99,
                    salePrice: 799.99,
                    discountPercentage: 33,
                    endTime: '2024-01-20T23:59:59Z',
                    stock: 15,
                    sold: 12,
                    seller: 'GadgetHub',
                    rating: 4.7,
                    reviewCount: 234,
                    isLimited: true,
                    category: 'Electronics'
                },
                {
                    id: '4',
                    type: 'bundle',
                    title: 'iPad Pro 12.9" + Apple Pencil + Magic Keyboard',
                    description: 'Complete productivity bundle for creative professionals',
                    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300',
                    originalPrice: 1597.97,
                    salePrice: 1299.99,
                    discountPercentage: 19,
                    endTime: '2024-01-18T23:59:59Z',
                    stock: 30,
                    sold: 5,
                    seller: 'TechStore Inc',
                    rating: 4.6,
                    reviewCount: 67,
                    isLimited: false,
                    category: 'Electronics'
                },
                {
                    id: '5',
                    type: 'flash_sale',
                    title: 'Sony WH-1000XM5 Wireless Headphones',
                    description: 'Industry-leading noise canceling with premium sound quality',
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
                    originalPrice: 399.99,
                    salePrice: 279.99,
                    discountPercentage: 30,
                    endTime: '2024-01-16T18:00:00Z',
                    stock: 100,
                    sold: 67,
                    seller: 'AudioPro',
                    rating: 4.8,
                    reviewCount: 445,
                    isLimited: true,
                    category: 'Audio'
                },
                {
                    id: '6',
                    type: 'daily_deal',
                    title: 'Nintendo Switch OLED Console',
                    description: 'Enhanced gaming console with vibrant OLED screen',
                    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300',
                    originalPrice: 349.99,
                    salePrice: 299.99,
                    discountPercentage: 14,
                    endTime: '2024-01-16T23:59:59Z',
                    stock: 40,
                    sold: 18,
                    seller: 'GameZone',
                    rating: 4.7,
                    reviewCount: 178,
                    isLimited: false,
                    category: 'Gaming'
                }
            ];

            setOffers(mockOffers);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch offers:', error);
            setLoading(false);
        }
    };

    const getOfferTypeColor = (type: string) => {
        switch (type) {
            case 'flash_sale':
                return 'bg-red-100 text-red-800';
            case 'daily_deal':
                return 'bg-blue-100 text-blue-800';
            case 'clearance':
                return 'bg-orange-100 text-orange-800';
            case 'bundle':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getOfferTypeIcon = (type: string) => {
        switch (type) {
            case 'flash_sale':
                return <Zap className="h-3 w-3" />;
            case 'daily_deal':
                return <Clock className="h-3 w-3" />;
            case 'clearance':
                return <Tag className="h-3 w-3" />;
            case 'bundle':
                return <TrendingUp className="h-3 w-3" />;
            default:
                return <Tag className="h-3 w-3" />;
        }
    };

    const formatTimeRemaining = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }

        return `${hours}h ${minutes}m`;
    };

    const filteredOffers = offers.filter(offer => {
        if (filter === 'all') return true;
        return offer.type === filter;
    });

    const sortedOffers = [...filteredOffers].sort((a, b) => {
        switch (sortBy) {
            case 'discount':
                return b.discountPercentage - a.discountPercentage;
            case 'price_low':
                return a.salePrice - b.salePrice;
            case 'price_high':
                return b.salePrice - a.salePrice;
            case 'ending_soon':
                return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
            case 'popular':
                return b.sold - a.sold;
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
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Offers & Flash Sales</h1>
                <p className="text-gray-600">
                    Limited time deals and special offers. Don't miss out on these amazing savings!
                </p>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap gap-4">
                        {/* Filter by Type */}
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="all">All Offers</option>
                                <option value="flash_sale">Flash Sales</option>
                                <option value="daily_deal">Daily Deals</option>
                                <option value="clearance">Clearance</option>
                                <option value="bundle">Bundles</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="discount">Highest Discount</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="ending_soon">Ending Soon</option>
                            <option value="popular">Most Popular</option>
                        </select>
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Offers Grid/List */}
            <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
                {sortedOffers.map((offer) => (
                    <div key={offer.id} className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex' : ''
                        }`}>
                        {/* Image */}
                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                            <img
                                src={offer.image}
                                alt={offer.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Offer Type Badge */}
                            <div className="absolute top-2 left-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOfferTypeColor(offer.type)}`}>
                                    {getOfferTypeIcon(offer.type)}
                                    <span className="ml-1 capitalize">{offer.type.replace('_', ' ')}</span>
                                </span>
                            </div>

                            {/* Discount Badge */}
                            <div className="absolute top-2 right-2">
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    -{offer.discountPercentage}%
                                </span>
                            </div>

                            {/* Limited Badge */}
                            {offer.isLimited && (
                                <div className="absolute bottom-2 left-2">
                                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        Limited Stock
                                    </span>
                                </div>
                            )}

                            {/* Wishlist Button */}
                            <button className="absolute bottom-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                                <Heart className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-gray-900 line-clamp-2">
                                    {offer.title}
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {offer.description}
                            </p>

                            {/* Seller and Rating */}
                            <div className="flex items-center justify-between mb-3 text-sm">
                                <span className="text-gray-500">by {offer.seller}</span>
                                <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                    <span className="text-gray-600">{offer.rating}</span>
                                    <span className="text-gray-400">({offer.reviewCount})</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="text-xl font-bold text-gray-900">
                                    ${offer.salePrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    ${offer.originalPrice.toFixed(2)}
                                </span>
                            </div>

                            {/* Stock Progress */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Sold: {offer.sold}</span>
                                    <span>Available: {offer.stock}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{ width: `${(offer.sold / (offer.sold + offer.stock)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Time Remaining */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-1 text-sm text-red-600">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium">
                                        {formatTimeRemaining(offer.endTime)} left
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <Link
                                href={`/p/${offer.id}`}
                                className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                View Deal
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {sortedOffers.length === 0 && (
                <div className="text-center py-12">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
                    <p className="text-gray-500">
                        {filter === 'all'
                            ? "There are no active offers at the moment."
                            : `No ${filter.replace('_', ' ')} offers available.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
}