'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Heart, Gavel } from 'lucide-react';

const circularCategories = [
    { name: 'Laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Computer parts', image: 'https://images.unsplash.com/photo-1593642702821-c8da67b180a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Enterprise networking', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Tablets and eBooks', image: 'https://images.unsplash.com/photo-1561152163-636d43f01523?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Storage and blank media', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Lenses and filters', image: 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
];

const trendingCategories = [
    { name: 'Tech', image: 'https://images.unsplash.com/photo-1550009158-94ae76552485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Motors', image: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Luxury', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Collectibles and art', image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Home and garden', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Trading cards', image: 'https://images.unsplash.com/photo-1613771429939-953833938633?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
    { name: 'Health and beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc5445c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80' },
];

const deals = [
    { name: 'Bose Solo Soundbar 2 Home Theater, Certified Refurbished', price: '$91.00', originalPrice: '$199.99', image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { name: 'Apple iPhone 15 Pro Max A2849 256GB Unlocked Excellent Condition', price: '$610.48', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { name: 'ASUS ROG Ally 7" 120Hz FHD Touch AMD Ryzen Z1 16GB 512GB SSD W11...', price: '$389.00', originalPrice: '$649.99', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
    { name: 'Apple M1 MacBook Air 13.3" 8GB 128GB (Space Gray) A2337 2020 - w...', price: '$313.04', originalPrice: '$999.00', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80' },
];

const slides = [
    {
        title: 'All your faves are here',
        description: 'Refresh your space, elevate your style and power your work.',
        images: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
        ],
    },
    {
        title: 'New arrivals just for you',
        description: 'Discover the latest trends and must-have items.',
        images: [
            'https://images.unsplash.com/photo-1550009158-94ae76552485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1613771429939-953833938633?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
        ],
    },
    {
        title: 'Deals you can\'t miss',
        description: 'Save big on top brands and popular products.',
        images: [
            'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&q=80',
        ],
    },
];

export default function Home() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [hotBids, setHotBids] = useState<any[]>([]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000);

        const fetchHotBids = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions/live`);
                const data = await response.json();
                setHotBids(data);
            } catch (error) {
                console.error('Failed to fetch hot bids:', error);
            }
        };

        fetchHotBids();

        return () => clearInterval(slideInterval);
    }, []);

    return (
        <main className="bg-gray-100">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Hero Carousel */}
                <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white my-8 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

                    <div className="relative z-10 flex items-center justify-between p-12 min-h-[400px]">
                        <div className="max-w-lg">
                            <h1 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                {slides[currentSlide].title}
                            </h1>
                            <p className="mb-8 text-lg text-blue-100 leading-relaxed">
                                {slides[currentSlide].description}
                            </p>
                            <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                Start Shopping
                            </button>
                        </div>
                        <div className="hidden md:flex gap-6">
                            {slides[currentSlide].images.map((img, i) => (
                                <div key={i} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Slide ${currentSlide} image ${i + 1}`}
                                        className="w-32 h-32 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === i
                                    ? 'bg-white scale-125 shadow-lg'
                                    : 'bg-white/50 hover:bg-white/75'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
                    >
                        <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
                    >
                        <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                </section>

                {/* Shopping Made Easy */}
                <section className="bg-gradient-to-r from-white to-blue-50 p-8 flex justify-between items-center rounded-2xl shadow-lg border border-blue-100 mb-8 group hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 mb-2">Shopping made easy</h2>
                            <p className="text-gray-600 text-lg">Enjoy reliability, secure deliveries and hassle-free returns.</p>
                        </div>
                    </div>
                    <Link href="/all-categories" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Start Shopping
                    </Link>
                </section>

                {/* Quick Navigation */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <Link href="/auctions" className="group bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl text-center hover:from-purple-200 hover:to-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Gavel className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-purple-700 font-bold text-lg mb-2">Live Auctions</div>
                        <div className="text-purple-600 text-sm">Bid on items now</div>
                    </Link>
                    <Link href="/daily-deals" className="group bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-2xl text-center hover:from-orange-200 hover:to-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="text-orange-700 font-bold text-lg mb-2">Daily Deals</div>
                        <div className="text-orange-600 text-sm">Limited time offers</div>
                    </Link>
                    <Link href="/offers" className="group bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-2xl text-center hover:from-red-200 hover:to-red-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="text-red-700 font-bold text-lg mb-2">Flash Sales</div>
                        <div className="text-red-600 text-sm">Up to 70% off</div>
                    </Link>
                    <Link href="/sell" className="group bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl text-center hover:from-green-200 hover:to-green-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div className="text-green-700 font-bold text-lg mb-2">Start Selling</div>
                        <div className="text-green-600 text-sm">List your items</div>
                    </Link>
                </section>

                {/* Hot Bids Section */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">🔥 Hot Bids</h2>
                                <p className="text-gray-600">Trending auctions with active bidding</p>
                            </div>
                        </div>
                        <Link href="/auctions" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                            View All <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hotBids.length > 0 ? hotBids.map(bid => (
                            <Link href={`/p/${bid.id}`} key={bid.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="relative">
                                    <img src={bid.image} alt={bid.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                        🔥 HOT
                                    </div>
                                    <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-500">
                                        <Heart size={16} />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <p className="text-sm line-clamp-2 mb-3 text-gray-700 group-hover:text-gray-900">{bid.name}</p>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-bold text-xl text-green-600">${bid.price.toFixed(2)}</p>
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            <Gavel className="h-3 w-3 mr-1" />
                                            {bid.bids} bids
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            // Skeleton loading cards
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                                    <div className="w-full h-48 bg-gray-200"></div>
                                    <div className="p-5">
                                        <div className="h-4 bg-gray-200 rounded mb-3"></div>
                                        <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Circular Category Grids */}
                <section className="mb-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">The future in your hands</h2>
                        <p className="text-gray-600 text-lg">Discover cutting-edge technology and innovation</p>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-6 justify-items-center">
                        {circularCategories.map(cat => (
                            <Link
                                href={`/category/${cat.name.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                                key={cat.name}
                                className="group text-center hover:scale-110 transition-all duration-300"
                            >
                                <div className="relative mb-4">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg group-hover:shadow-2xl transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full group-hover:from-black/30 transition-all duration-300"></div>
                                </div>
                                <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">🔥 Trending on InstaSell</h2>
                        <p className="text-gray-600 text-lg">Popular categories everyone's talking about</p>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-6 justify-items-center">
                        {trendingCategories.map(cat => (
                            <Link
                                href={`/category/${cat.name.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                                key={cat.name}
                                className="group text-center hover:scale-110 transition-all duration-300"
                            >
                                <div className="relative mb-4">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg group-hover:shadow-2xl transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full group-hover:from-black/30 transition-all duration-300"></div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                                        🔥
                                    </div>
                                </div>
                                <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Today's Deals Carousel */}
                <section className="relative mb-12">
                    <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
                        <div className="snap-start flex-shrink-0 w-80 bg-gradient-to-br from-black via-gray-900 to-black text-white p-8 rounded-2xl shadow-2xl">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Today's Deals</h2>
                                <p className="text-gray-300 text-lg">All With Free Shipping</p>
                            </div>
                            <Link href="/daily-deals" className="inline-block bg-white text-black font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                Shop Now
                            </Link>
                        </div>
                        {deals.map((deal, index) => (
                            <Link
                                href={`/p/${index + 1}`}
                                key={deal.name}
                                className="snap-start flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 relative group transform hover:-translate-y-2"
                            >
                                <div className="relative">
                                    <img
                                        src={deal.image}
                                        alt={deal.name}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    {deal.originalPrice && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            SALE
                                        </div>
                                    )}
                                    <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-500">
                                        <Heart size={18} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm line-clamp-2 mb-4 text-gray-700 group-hover:text-gray-900 leading-relaxed">
                                        {deal.name}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-2xl text-green-600">{deal.price}</p>
                                            {deal.originalPrice && (
                                                <p className="text-sm text-gray-500 line-through">{deal.originalPrice}</p>
                                            )}
                                        </div>
                                        {deal.originalPrice && (
                                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                                {Math.round((1 - parseFloat(deal.price.replace('$', '')) / parseFloat(deal.originalPrice.replace('$', ''))) * 100)}% OFF
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 group">
                        <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 group">
                        <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                </section>

                {/* Promotional Banners */}
                <section className="bg-gradient-to-r from-orange-100 via-orange-50 to-yellow-100 p-10 flex justify-between items-center rounded-2xl mb-8 shadow-lg border border-orange-200 group hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">There's a deal for you, too</h2>
                            <p className="text-gray-700 text-lg">Don't miss a chance to save on items you've been looking for.</p>
                        </div>
                    </div>
                    <Link href="/daily-deals" className="bg-white font-semibold px-8 py-4 rounded-full border border-orange-300 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Explore Now
                    </Link>
                </section>

                <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-10 flex justify-between items-center rounded-2xl mb-8 shadow-2xl relative overflow-hidden group">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

                    <div className="relative z-10 flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Endless accessories. Epic prices.</h2>
                            <p className="text-gray-300 text-lg">Browse millions of upgrades for your ride.</p>
                        </div>
                    </div>
                    <Link href="/category/vehicles" className="relative z-10 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Shop Now
                    </Link>
                </section>
            </div>
        </main>
    );
}
