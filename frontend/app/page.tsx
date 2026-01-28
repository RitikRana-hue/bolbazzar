'use client';

import Link from 'next/link';

// Active auction items data
const activeAuctions = [
    {
        id: 1,
        name: 'Apple iPhone 15 Pro Max (256GB)',
        currentBid: '₹1,25,000',
        startingBid: '₹1,00,000',
        category: 'Electronics',
        seller: 'TechStore Official',
        rating: 4.5,
        reviews: 234,
        dateAdded: '2024-01-20',
        bidCount: 47,
        timeLeft: '2h 15m',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 2,
        name: 'Sony WH-1000XM5 Wireless Headphones',
        currentBid: '₹18,500',
        startingBid: '₹15,000',
        category: 'Electronics',
        seller: 'AudioHub',
        rating: 4.8,
        reviews: 189,
        dateAdded: '2024-01-18',
        bidCount: 23,
        timeLeft: '5h 30m',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 3,
        name: 'Samsung 55" 4K Smart TV',
        currentBid: '₹35,000',
        startingBid: '₹25,000',
        category: 'Electronics',
        seller: 'HomeTech Store',
        rating: 4.3,
        reviews: 156,
        dateAdded: '2024-01-15',
        bidCount: 89,
        timeLeft: '1h 45m',
        image: 'https://images.unsplash.com/photo-1593784997279-2c9184fe1f77?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 4,
        name: 'MacBook Air M2 (13-inch)',
        currentBid: '₹85,000',
        startingBid: '₹75,000',
        category: 'Electronics',
        seller: 'Apple Authorized',
        rating: 4.9,
        reviews: 412,
        dateAdded: '2024-01-10',
        bidCount: 34,
        timeLeft: '3h 20m',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 5,
        name: 'Nike Air Max 270',
        currentBid: '₹6,495',
        startingBid: '₹5,000',
        category: 'Fashion',
        seller: 'SneakerWorld',
        rating: 4.2,
        reviews: 89,
        dateAdded: '2024-01-08',
        bidCount: 12,
        timeLeft: '4h 10m',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 6,
        name: 'Canon EOS R6 Camera',
        currentBid: '₹1,85,000',
        startingBid: '₹1,80,000',
        category: 'Electronics',
        seller: 'Camera Pro',
        rating: 4.7,
        reviews: 67,
        dateAdded: '2024-01-05',
        bidCount: 8,
        timeLeft: '6h 45m',
        image: 'https://images.unsplash.com/photo-1516035069379-279e36e96c15?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
        id: 7,
        name: 'Dell XPS 15 Laptop',
        currentBid: '₹1,15,000',
        startingBid: '₹1,00,000',
        category: 'Electronics',
        seller: 'Dell Official',
        rating: 4.6,
        reviews: 298,
        dateAdded: '2024-01-03',
        bidCount: 41,
        timeLeft: '2h 55m',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
];

export default function HomePage() {
    return (
        <main className="bg-white">
            {/* Active Bids Section */}
            <div className="py-6 bg-gray-50">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Active Bids</h2>
                    <p className="text-sm text-gray-600">Scroll left to see more active auctions</p>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
                        {activeAuctions.map((item) => (
                            <div key={item.id} className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                                {/* Active Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        ACTIVE
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {item.category}
                                    </span>
                                </div>

                                {/* Product Image */}
                                <div className="mb-3 relative">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-32 object-cover rounded"
                                    />
                                </div>

                                {/* Product Name */}
                                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                    {item.name}
                                </h3>

                                {/* Bidding Information */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Current Bid</span>
                                        <span className="text-lg font-bold text-green-600">{item.currentBid}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Starting Bid</span>
                                        <span className="text-sm text-gray-700">{item.startingBid}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Bids</span>
                                        <span className="text-sm font-medium text-blue-600">{item.bidCount} bids</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Time Left</span>
                                        <span className="text-sm font-medium text-red-600">{item.timeLeft}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Seller</span>
                                        <span className="text-xs text-gray-700">{item.seller}</span>
                                    </div>
                                </div>

                                {/* Rating */}
                                {item.rating && (
                                    <div className="flex items-center mb-3">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-xs ${i < Math.floor(item.rating!) ? 'fill-current' : ''}`}>★</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 ml-1">({item.reviews})</span>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Link href={`/bid/${item.id}`} className="block w-full">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors">
                                        Place a Bid
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Auctions Section */}
            <div className="py-6 bg-gray-50">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Auctions</h2>
                    <p className="text-sm text-gray-600">Hot auctions you don't want to miss</p>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
                        {activeAuctions.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                                {/* Hot Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        HOT
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {item.category}
                                    </span>
                                </div>

                                {/* Product Image */}
                                <div className="mb-3 relative">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-32 object-cover rounded"
                                    />
                                </div>

                                {/* Product Name */}
                                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                    {item.name}
                                </h3>

                                {/* Bidding Information */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Current Bid</span>
                                        <span className="text-lg font-bold text-green-600">{item.currentBid}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Starting Bid</span>
                                        <span className="text-sm text-gray-700">{item.startingBid}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Bids</span>
                                        <span className="text-sm font-medium text-blue-600">{item.bidCount} bids</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Time Left</span>
                                        <span className="text-sm font-medium text-red-600">{item.timeLeft}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Seller</span>
                                        <span className="text-xs text-gray-700">{item.seller}</span>
                                    </div>
                                </div>

                                {/* Rating */}
                                {item.rating && (
                                    <div className="flex items-center mb-3">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-xs ${i < Math.floor(item.rating!) ? 'fill-current' : ''}`}>★</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600 ml-1">({item.reviews})</span>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Link href={`/bid/${item.id}`} className="block w-full">
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-medium transition-colors">
                                        Place a Bid
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
