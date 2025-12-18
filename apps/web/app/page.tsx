'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Heart, Gavel } from 'lucide-react';
import { MetroProductTile, MetroFeatureTile, MetroWideTile } from './components/ui/MetroTile';
import MetroBidTile, { MetroFeaturedBidTile } from './components/ui/MetroBidTile';

const circularCategories = [
    { name: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Computer parts', image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Enterprise networking', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Tablets and eBooks', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Storage and blank media', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Lenses and filters', image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Gaming consoles', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Headphones', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Smart watches', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Cameras', image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Keyboards & mice', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
];

const trendingCategories = [
    { name: 'Tech', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Motors', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Luxury', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Collectibles and art', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Home and garden', image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Trading cards', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Health and beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Books', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'Toys & games', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
];

const deals = [
    { name: 'Bose Solo Soundbar 2 Home Theater, Certified Refurbished', price: '$91.00', originalPrice: '$199.99', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { name: 'Apple iPhone 15 Pro Max A2849 256GB Unlocked Excellent Condition', price: '$610.48', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { name: 'ASUS ROG Ally 7" 120Hz FHD Touch AMD Ryzen Z1 16GB 512GB SSD W11...', price: '$389.00', originalPrice: '$649.99', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { name: 'Apple M1 MacBook Air 13.3" 8GB 128GB (Space Gray) A2337 2020 - w...', price: '$313.04', originalPrice: '$999.00', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
];

const slides = [
    {
        title: 'Deals you can\'t miss',
        description: 'Save big on top brands and popular products.',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        buttonText: 'Start Shopping',
        buttonLink: '/deals'
    },
    {
        title: 'New arrivals just for you',
        description: 'Discover the latest trends and must-have items.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        buttonText: 'Browse New Items',
        buttonLink: '/new-arrivals'
    },
    {
        title: 'Live Auctions Available',
        description: 'Bid on exclusive items and win amazing deals.',
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        buttonText: 'Join Auctions',
        buttonLink: '/auctions'
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

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000);

        const fetchHotBids = async () => {
            try {
                // Mock data for hot bids with images and dynamic sizing - replace with actual API call
                const mockHotBids = [
                    {
                        id: '1',
                        name: 'iPhone 15 Pro Max 256GB',
                        price: 1150.00,
                        bids: 89,
                        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'large' // High bids = larger tile
                    },
                    {
                        id: '2',
                        name: 'MacBook Pro M3 14-inch',
                        price: 2100.00,
                        bids: 156,
                        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'wide' // Very high bids = wide tile
                    },
                    {
                        id: '3',
                        name: 'Vintage Rolex Submariner',
                        price: 8500.00,
                        bids: 234,
                        image: 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd6eaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'tall' // Premium item = tall tile
                    },
                    {
                        id: '4',
                        name: 'Nike Air Jordan 1 Chicago',
                        price: 450.00,
                        bids: 67,
                        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'medium'
                    },
                    {
                        id: '5',
                        name: 'Sony PlayStation 5',
                        price: 399.00,
                        bids: 123,
                        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'wide'
                    },
                    {
                        id: '6',
                        name: 'Canon EOS R5 Camera',
                        price: 2800.00,
                        bids: 45,
                        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'small'
                    },
                    {
                        id: '7',
                        name: 'Apple Watch Ultra',
                        price: 799.00,
                        bids: 78,
                        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'medium'
                    },
                    {
                        id: '8',
                        name: 'Gaming Setup Complete',
                        price: 2499.00,
                        bids: 198,
                        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                        size: 'large'
                    }
                ];
                setHotBids(mockHotBids);
            } catch (error) {
                console.error('Failed to fetch hot bids:', error);
            }
        };

        fetchHotBids();

        return () => clearInterval(slideInterval);
    }, []);

    return (
        <main className="bg-gray-100">
            <div className="w-full px-2">
                {/* Modern Hero Section */}
                <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white my-8 rounded-3xl overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="relative z-10 px-20 py-12 min-h-[500px]">
                        <div className="flex items-center justify-between">
                            {/* Text Content - Fixed Position */}
                            <div className="max-w-2xl flex-shrink-0">
                                <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                    <span className="text-sm font-medium">Live Auctions Available</span>
                                </div>

                                {/* Animated Text Container */}
                                <div className="min-h-[200px] flex flex-col justify-center">
                                    <h1
                                        key={`title-${currentSlide}`}
                                        className="text-6xl font-bold mb-6 leading-tight hero-text-animate"
                                    >
                                        <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                            {slides[currentSlide].title}
                                        </span>
                                    </h1>
                                    <p
                                        key={`desc-${currentSlide}`}
                                        className="mb-8 text-xl text-gray-300 leading-relaxed max-w-lg hero-text-animate"
                                        style={{ animationDelay: '0.1s' }}
                                    >
                                        {slides[currentSlide].description}
                                    </p>
                                </div>

                                {/* Action Buttons - Consistent Size Container */}
                                <div className="h-16 flex items-center">
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={slides[currentSlide].buttonLink}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 w-56 h-14 flex items-center justify-center text-center"
                                        >
                                            <span key={`btn-text-${currentSlide}`} className="hero-text-animate block">
                                                {slides[currentSlide].buttonText}
                                            </span>
                                        </Link>
                                        <Link
                                            href="/auctions"
                                            className="bg-white/10 backdrop-blur-md text-white font-semibold py-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 w-56 h-14 flex items-center justify-center text-center"
                                        >
                                            Browse Auctions
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Single Image - Proper Spacing */}
                            <div className="hidden lg:block relative ml-8">
                                <div className="relative w-72 h-72">
                                    {/* Background Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl scale-110 transition-all duration-700"></div>

                                    {/* Main Image */}
                                    <div className="relative w-full h-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
                                        <img
                                            key={currentSlide} // Force re-render for smooth transition
                                            src={slides[currentSlide].image}
                                            alt={slides[currentSlide].title}
                                            className="w-full h-full object-cover transition-all duration-700 ease-in-out transform hover:scale-110 hero-image-animate"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                            }}
                                        />

                                        {/* Image Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modern Slide Indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goToSlide(i)}
                                className={`h-1 rounded-full transition-all duration-300 hover:scale-125 ${currentSlide === i
                                    ? 'bg-white w-8 shadow-lg'
                                    : 'bg-white/30 w-4 hover:bg-white/50'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Modern Navigation - Properly Positioned */}
                    <button
                        onClick={prevSlide}
                        type="button"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group shadow-lg hover:shadow-xl"
                    >
                        <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group shadow-lg hover:shadow-xl"
                    >
                        <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                </section>



                {/* Professional Auction Navigation */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    <Link href="/auctions" className="group relative bg-white border border-gray-200 p-8 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:border-purple-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl mb-6 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                                <Gavel className="h-7 w-7 text-purple-600" />
                            </div>
                            <h3 className="text-gray-900 font-semibold text-lg mb-3">Live Auctions</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">Participate in real-time bidding and secure exclusive items at competitive prices.</p>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-medium">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                                    Live
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/saved-bids" className="group relative bg-white border border-gray-200 p-8 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:border-blue-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl mb-6 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                                <Heart className="h-7 w-7 text-blue-600" />
                            </div>
                            <h3 className="text-gray-900 font-semibold text-lg mb-3">Saved Bids</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">Monitor your watchlist and receive notifications for items you're interested in.</p>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                                    Watchlist
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/bid-history" className="group relative bg-white border border-gray-200 p-8 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:border-orange-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-orange-100 rounded-xl mb-6 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-300">
                                <svg className="h-7 w-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-gray-900 font-semibold text-lg mb-3">Bid History</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">Access detailed analytics and insights from your previous bidding activities.</p>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-medium">
                                    Analytics
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/sell" className="group relative bg-white border border-gray-200 p-8 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:border-emerald-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-100 rounded-xl mb-6 flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-300">
                                <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-gray-900 font-semibold text-lg mb-3">Start Selling</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">Create professional listings and reach thousands of potential buyers worldwide.</p>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
                                    List Items
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                        </div>
                    </Link>
                </section>

                {/* Modern Hot Bids Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">🔥 Hot Bids</h2>
                            <p className="text-gray-600 text-lg">Live auctions with active bidding</p>
                        </div>
                        <Link href="/auctions" className="inline-flex items-center bg-gray-900 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                            View All <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-fr">
                        {hotBids.length > 0 ? hotBids.map((bid, index) => {
                            // Check if this should be a featured tile (highest bids)
                            if (bid.bids > 200 && index === 0) {
                                return (
                                    <MetroFeaturedBidTile
                                        key={bid.id}
                                        href={`/auctions/${bid.id}`}
                                        title={bid.name}
                                        price={bid.price}
                                        bids={bid.bids}
                                        image={bid.image}
                                    />
                                );
                            }

                            return (
                                <MetroBidTile
                                    key={bid.id}
                                    href={`/auctions/${bid.id}`}
                                    title={bid.name}
                                    price={bid.price}
                                    bids={bid.bids}
                                    image={bid.image}
                                    size={bid.size}
                                />
                            );
                        }) : (
                            // Skeleton loading tiles with different sizes
                            [...Array(8)].map((_, i) => {
                                const sizes = ['aspect-square', 'col-span-2 aspect-[2/1]', 'aspect-square', 'row-span-2 aspect-[1/2]', 'aspect-square', 'aspect-square', 'col-span-2 row-span-2', 'aspect-square'];
                                const colors = ['bg-gray-300', 'bg-gray-400', 'bg-gray-300', 'bg-gray-400', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-300'];
                                return (
                                    <div key={i} className={`${colors[i]} ${sizes[i]} animate-pulse rounded-lg`}></div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Modern Popular Items Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">✨ Popular Items</h2>
                            <p className="text-gray-600 text-lg">Trending products everyone loves</p>
                        </div>
                        <Link href="/category/all" className="inline-flex items-center bg-gray-900 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                            View All <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Large Featured Tile */}
                        <MetroFeatureTile
                            href="/p/featured-1"
                            title="iPhone 15 Pro Max"
                            description="256GB Natural Titanium"
                            price={1199}
                            backgroundImage="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        />

                        {/* Regular Tiles with Background Images */}
                        <MetroProductTile
                            href="/p/2"
                            category="Laptops"
                            title="MacBook Pro M3"
                            price={2199}
                            backgroundImage="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />
                        <MetroProductTile
                            href="/p/3"
                            category="Audio"
                            title="Sony WH-1000XM5"
                            price={299}
                            backgroundImage="https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />
                        <MetroProductTile
                            href="/p/4"
                            category="Tablets"
                            title="iPad Pro 12.9&quot;"
                            price={1099}
                            backgroundImage="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />
                        <MetroProductTile
                            href="/p/5"
                            category="Phones"
                            title="Samsung Galaxy S24"
                            price={899}
                            backgroundImage="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />
                        <MetroProductTile
                            href="/p/6"
                            category="Audio"
                            title="AirPods Pro"
                            price={249}
                            backgroundImage="https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />
                        <MetroProductTile
                            href="/p/7"
                            category="Wearables"
                            title="Apple Watch Ultra"
                            price={799}
                            backgroundImage="https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />

                        {/* Additional Product Tiles */}
                        <MetroProductTile
                            href="/p/8"
                            category="Gaming"
                            title="RTX 4090 Graphics Card"
                            price={1599}
                            backgroundImage="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />

                        <MetroProductTile
                            href="/p/9"
                            category="Fashion"
                            title="Designer Sneakers"
                            price={350}
                            size="medium"
                            backgroundImage="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />

                        <MetroProductTile
                            href="/p/10"
                            category="Home"
                            title="Smart Home Hub"
                            price={199}
                            backgroundImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />

                        {/* Wide Tile with Background Image */}
                        <MetroWideTile
                            href="/p/gaming-setup"
                            category="Gaming"
                            title="Complete Gaming Setup"
                            description="PC + Monitor + Accessories"
                            price={2499}
                            backgroundImage="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                        />

                        {/* More varied tiles */}
                        <MetroProductTile
                            href="/p/11"
                            category="Camera"
                            title="Professional DSLR"
                            price={2299}
                            backgroundImage="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />

                        <MetroProductTile
                            href="/p/12"
                            category="Fitness"
                            title="Smart Fitness Tracker"
                            price={129}
                            backgroundImage="https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            useBackgroundImage={true}
                        />
                    </div>
                </section>

                {/* Scrollable Trending Categories - Now First */}
                <section className="mb-12 relative">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">🔥 Trending on InstaSell</h2>
                        <p className="text-gray-600 text-lg">Popular categories everyone's talking about</p>
                    </div>

                    {/* Scrollable Container */}
                    <div className="relative">
                        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4" id="trending-categories">
                            {trendingCategories.map(cat => (
                                <Link
                                    href={`/category/${cat.name.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                                    key={cat.name}
                                    className="group text-center hover:scale-110 transition-all duration-300 flex-shrink-0 snap-start"
                                >
                                    <div className="relative mb-4">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg group-hover:shadow-2xl transition-all duration-300"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full group-hover:from-black/30 transition-all duration-300"></div>
                                        <div className="absolute top-1 right-1 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse shadow-lg">
                                            🔥
                                        </div>
                                    </div>
                                    <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 transition-colors block w-20 md:w-24">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('trending-categories');
                                if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                            }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 group z-10"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={() => {
                                const container = document.getElementById('trending-categories');
                                if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 group z-10"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-700 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </section>

                {/* Scrollable Category Section - Now Second */}
                <section className="mb-12 relative">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">The future in your hands</h2>
                        <p className="text-gray-600 text-lg">Discover cutting-edge technology and innovation</p>
                    </div>

                    {/* Scrollable Container */}
                    <div className="relative">
                        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4" id="tech-categories">
                            {circularCategories.map(cat => (
                                <Link
                                    href={`/category/${cat.name.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                                    key={cat.name}
                                    className="group text-center hover:scale-110 transition-all duration-300 flex-shrink-0 snap-start"
                                >
                                    <div className="relative mb-4">
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-lg group-hover:shadow-2xl transition-all duration-300"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full group-hover:from-black/30 transition-all duration-300"></div>
                                    </div>
                                    <span className="font-semibold text-sm text-gray-700 group-hover:text-blue-600 transition-colors block w-20 md:w-24">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('tech-categories');
                                if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                            }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 group z-10"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={() => {
                                const container = document.getElementById('tech-categories');
                                if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 group z-10"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-700 group-hover:scale-110 transition-transform" />
                        </button>
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
