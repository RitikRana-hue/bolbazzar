'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Zap, Heart, Star, ChevronRight } from 'lucide-react';
import Timer from '../components/ui/Timer';

interface Deal {
    id: string;
    title: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    seller: string;
    rating: number;
    reviews: number;
    endTime: string;
    category: string;
    featured: boolean;
    soldCount: number;
    totalStock: number;
}

export default function DailyDealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [featuredDeal, setFeaturedDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All Deals', count: 0 },
        { id: 'electronics', name: 'Electronics', count: 0 },
        { id: 'fashion', name: 'Fashion', count: 0 },
        { id: 'home', name: 'Home & Garden', count: 0 },
        { id: 'sports', name: 'Sports', count: 0 },
        { id: 'beauty', name: 'Beauty', count: 0 }
    ];

    useEffect(() => {
        fetchDailyDeals();
    }, []);

    const fetchDailyDeals = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockDeals: Deal[] = [
                {
                    id: '1',
                    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                    price: 999.99,
                    originalPrice: 1299.99,
                    discount: 23,
                    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=300&h=300&fit=crop',
                    seller: 'TechStore Pro',
                    rating: 4.8,
                    reviews: 1247,
                    endTime: '2024-12-13T23:59:59Z',
                    category: 'electronics',
                    featured: true,
                    soldCount: 156,
                    totalStock: 200
                },
                {
                    id: '2',
                    title: 'Samsung 65" 4K Smart TV',
                    price: 599.99,
                    originalPrice: 899.99,
                    discount: 33,
                    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
                    seller: 'Electronics World',
                    rating: 4.6,
                    reviews: 892,
                    endTime: '2024-12-13T23:59:59Z',
                    category: 'electronics',
                    featured: false,
                    soldCount: 89,
                    totalStock: 150
                },
                {
                    id: '3',
                    title: 'Nike Air Max 270 Sneakers',
                    price: 89.99,
                    originalPrice: 150.00,
                    discount: 40,
                    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
                    seller: 'Sneaker Hub',
                    rating: 4.7,
                    reviews: 634,
                    endTime: '2024-12-13T23:59:59Z',
                    category: 'fashion',
                    featured: false,
                    soldCount: 234,
                    totalStock: 300
                },
                {
                    id: '4',
                    title: 'Dyson V15 Detect Cordless Vacuum',
                    price: 549.99,
                    originalPrice: 749.99,
                    discount: 27,
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
                    seller: 'Home Essentials',
                    rating: 4.9,
                    reviews: 445,
                    endTime: '2024-12-13T23:59:59Z',
                    category: 'home',
                    featured: false,
                    soldCount: 67,
                    totalStock: 100
                },
                {
                    id: '5',
                    title: 'Apple Watch Series 9 GPS 45mm',
                    price: 329.99,
                    originalPrice: 429.99,
                    discount: 23,
                    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop',
                    seller: 'Apple Store',
                    rating: 4.8,
                    reviews: 1156,
                    endTime: '2024-12-13T23:59:59Z',
                    category: 'electronics',
                    featured: false,
                    soldCount: 178,
                    totalStock: 250
                },
                {
                    id: '6',
                    title: 'Levi\'s 501 Original Fit Jeans',
                    price: 39.99,
                    originalPrice: 69.99,
                    discount: 43,
                    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
                    seller: 'Fashion Outlet',
                    rating: 4.5,
                    reviews: 789,
                    endTime: '2024-12-13T23:59:59Z',
                    category: 'fashion',
                    featured: false,
                    soldCount: 345,
                    totalStock: 500
                }
            ];

            setDeals(mockDeals);
            setFeaturedDeal(mockDeals.find(deal => deal.featured) || mockDeals[0]);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch daily deals:', error);
            setLoading(false);
        }
    };

    const filteredDeals = deals.filter(deal =>
        selectedCategory === 'all' || deal.category === selectedCategory
    );

    const getProgressPercentage = (sold: number, total: number) => {
        return Math.min((sold / total) * 100, 100);
    };

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
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Zap className="h-8 w-8 text-yellow-500 mr-2" />
                        <h1 className="text-4xl font-bold text-gray-900">Daily Deals</h1>
                    </div>
                    <p className="text-xl text-gray-600 mb-4">
                        Limited-time offers ending soon • Free shipping on all deals
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-lg">
                        <Clock className="h-5 w-5 text-red-500" />
                        <span className="text-gray-700">Deals end in:</span>
                        <Timer
                            endTime="2024-12-13T23:59:59Z"
                            className="text-red-600 font-bold"
                        />
                    </div>
                </div>

                {/* Featured Deal */}
                {featuredDeal && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
                        <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                            <div className="lg:w-1/2">
                                <div className="flex items-center mb-4">
                                    <Star className="h-6 w-6 text-yellow-400 mr-2" />
                                    <span className="text-xl font-bold">Deal of the Day</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-4">{featuredDeal.title}</h2>
                                <div className="flex items-center space-x-4 mb-4">
                                    <span className="text-4xl font-bold">${featuredDeal.price.toFixed(2)}</span>
                                    <span className="text-xl line-through text-gray-300">${featuredDeal.originalPrice.toFixed(2)}</span>
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-lg font-bold">
                                        {featuredDeal.discount}% OFF
                                    </span>
                                </div>
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Sold: {featuredDeal.soldCount}</span>
                                        <span>Available: {featuredDeal.totalStock - featuredDeal.soldCount}</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-3">
                                        <div
                                            className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${getProgressPercentage(featuredDeal.soldCount, featuredDeal.totalStock)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <Link
                                    href={`/p/${featuredDeal.id}`}
                                    className="inline-flex items-center bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    Shop Now
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                            <div className="lg:w-1/2">
                                <img
                                    src={featuredDeal.image}
                                    alt={featuredDeal.title}
                                    className="w-full max-w-md mx-auto rounded-xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-3 rounded-full font-medium transition-colors ${selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Deals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDeals.map((deal) => (
                        <div key={deal.id} className="relative group">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Deal Badge */}
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                        {deal.discount}% OFF
                                    </span>
                                </div>

                                {/* Wishlist Button */}
                                <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
                                </button>

                                {/* Product Image */}
                                <Link href={`/p/${deal.id}`}>
                                    <img
                                        src={deal.image}
                                        alt={deal.title}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link href={`/p/${deal.id}`}>
                                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                                            {deal.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center mb-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < Math.floor(deal.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600 ml-2">({deal.reviews})</span>
                                    </div>

                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-xl font-bold text-gray-900">${deal.price.toFixed(2)}</span>
                                        <span className="text-sm line-through text-gray-500">${deal.originalPrice.toFixed(2)}</span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">by {deal.seller}</p>

                                    {/* Stock Progress */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Sold: {deal.soldCount}</span>
                                            <span>{deal.totalStock - deal.soldCount} left</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getProgressPercentage(deal.soldCount, deal.totalStock)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Timer */}
                                    <div className="flex items-center justify-center text-sm text-red-600 font-medium">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <Timer
                                            endTime={deal.endTime}
                                            className="text-red-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Newsletter Signup */}
                <div className="bg-blue-600 rounded-2xl p-8 mt-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Never Miss a Deal</h2>
                    <p className="text-xl mb-6">Get notified about new daily deals and exclusive offers</p>
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button className="w-full sm:w-auto bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}