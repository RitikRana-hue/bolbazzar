'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Heart,
    Share2,
    Shield,
    Truck,
    Clock,
    Users,
    TrendingUp,
    Star,
    MessageSquare,
    Package,
    Award,
    Zap
} from 'lucide-react';

// Mock product data
const mockProduct = {
    id: 1,
    name: 'Apple iPhone 15 Pro Max (256GB)',
    description: 'Experience the pinnacle of smartphone technology with the iPhone 15 Pro Max. Featuring a stunning titanium design, powerful A17 Pro chip, and advanced camera system with 5x optical zoom. This device represents the perfect blend of luxury and performance.',
    price: '₹1,25,000',
    originalPrice: '₹1,39,900',
    category: 'Electronics',
    seller: 'TechStore Official',
    sellerRating: 4.8,
    sellerReviews: 1234,
    sellerVerified: true,
    rating: 4.5,
    reviews: 234,
    images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1593784997279-2c9184fe1f77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    specifications: {
        'Display': '6.7-inch Super Retina XDR OLED',
        'Processor': 'A17 Pro chip',
        'Storage': '256GB',
        'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
        'Battery': 'All-day battery life',
        'Color': 'Natural Titanium',
        'Condition': 'Brand New',
        'Warranty': '1 Year Manufacturer Warranty'
    },
    features: [
        '5G capable',
        'Face ID',
        'Ceramic Shield front',
        'ProMotion display',
        'Dynamic Island',
        'iOS 17',
        'Water resistant'
    ],
    shipping: {
        free: true,
        estimated: '2-3 business days',
        returns: '30 days return policy'
    }
};

// Mock bid data
const initialBids = [
    { id: 1, bidder: 'JohnDoe123', amount: '₹1,20,000', time: '2 min ago', isHighest: false },
    { id: 2, bidder: 'TechBuyer99', amount: '₹1,22,000', time: '1 min ago', isHighest: false },
    { id: 3, bidder: 'AuctionPro', amount: '₹1,25,000', time: '30 sec ago', isHighest: true },
];

export default function BidPage() {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);
    const [currentBid, setCurrentBid] = useState('₹1,25,000');
    const [bidAmount, setBidAmount] = useState('');
    const [bids, setBids] = useState(initialBids);
    const [timeLeft, setTimeLeft] = useState('2h 15m 30s');
    const [isSaved, setIsSaved] = useState(false);

    // Mock countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const parts = prev.split(':');
                let hours = parseInt(parts[0]);
                let minutes = parseInt(parts[1]);
                let seconds = parseInt(parts[2]);

                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;
                    if (minutes < 0) {
                        minutes = 59;
                        hours--;
                        if (hours < 0) {
                            clearInterval(timer);
                            return 'Auction Ended';
                        }
                    }
                }

                return `${hours}h ${minutes}m ${seconds}s`;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handlePlaceBid = () => {
        if (!bidAmount) return;

        const numericBid = parseInt(bidAmount.replace(/[^\d]/g, ''));
        const currentBidNumeric = parseInt(currentBid.replace(/[^\d]/g, ''));

        if (numericBid <= currentBidNumeric) {
            alert('Bid must be higher than current bid');
            return;
        }

        const newBid = {
            id: bids.length + 1,
            bidder: 'You',
            amount: `₹${numericBid.toLocaleString('en-IN')}`,
            time: 'Just now',
            isHighest: true
        };

        // Update previous highest bid
        const updatedBids = bids.map(bid => ({ ...bid, isHighest: false }));
        setBids([newBid, ...updatedBids]);
        setCurrentBid(newBid.amount);
        setBidAmount('');
    };

    const formatBidAmount = (value: string) => {
        const numeric = value.replace(/[^\d]/g, '');
        if (numeric.length === 0) return '';
        return `₹${parseInt(numeric).toLocaleString('en-IN')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900">Product Auction</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSaved(!isSaved)}
                                className={`p-2 rounded-lg ${isSaved ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <Heart className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Product Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Images */}
                        <div className="bg-white rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={mockProduct.images[selectedImage]}
                                        alt={mockProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {mockProduct.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-blue-500' : 'border-transparent'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${mockProduct.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="bg-white rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{mockProduct.name}</h1>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                                            {mockProduct.rating} ({mockProduct.reviews} reviews)
                                        </span>
                                        <span className="flex items-center">
                                            <Package className="h-4 w-4 mr-1" />
                                            {mockProduct.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Current Bid</div>
                                    <div className="text-2xl font-bold text-green-600">{currentBid}</div>
                                    <div className="text-sm text-gray-500">{mockProduct.originalPrice} retail</div>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">{mockProduct.description}</p>

                            {/* Features */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {mockProduct.features.map((feature, index) => (
                                        <div key={index} className="flex items-center text-sm text-gray-600">
                                            <Zap className="h-4 w-4 text-green-500 mr-2" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(mockProduct.specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-900">{key}</span>
                                            <span className="text-sm text-gray-600">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Information */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping & Returns</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Truck className="h-4 w-4 text-green-500 mr-3" />
                                        {mockProduct.shipping.free ? 'Free Shipping' : 'Shipping Available'} - {mockProduct.shipping.estimated}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Shield className="h-4 w-4 text-blue-500 mr-3" />
                                        {mockProduct.shipping.returns}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seller Information */}
                        <div className="bg-white rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold">TS</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900">{mockProduct.seller}</span>
                                            {mockProduct.sellerVerified && (
                                                <Shield className="h-4 w-4 text-blue-500 ml-2" fill="currentColor" />
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                                            {mockProduct.sellerRating} ({mockProduct.sellerReviews} reviews)
                                        </div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                                    View Store
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Bidding Section */}
                    <div className="space-y-6">
                        {/* Auction Status */}
                        <div className="bg-white rounded-lg p-6 border-2 border-red-200">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-4">
                                    <Clock className="h-3 w-3 mr-1" />
                                    LIVE AUCTION
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{currentBid}</div>
                                <div className="text-sm text-gray-600">Current Highest Bid</div>
                                <div className="text-lg font-semibold text-red-600 mt-4">{timeLeft}</div>
                                <div className="text-sm text-gray-600">Time Remaining</div>
                            </div>

                            {/* Place Bid Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Bid Amount
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(formatBidAmount(e.target.value))}
                                            placeholder="Enter bid amount"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={() => setBidAmount(`₹${(parseInt(currentBid.replace(/[^\d]/g, '')) + 1000).toLocaleString('en-IN')}`)}
                                            className="absolute right-2 top-2 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                        >
                                            Min +₹1,000
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceBid}
                                    disabled={!bidAmount}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors"
                                >
                                    Place Bid
                                </button>

                                <div className="text-xs text-gray-500 text-center">
                                    By placing a bid, you commit to purchase this item if you win
                                </div>
                            </div>
                        </div>

                        {/* Bid History */}
                        <div className="bg-white rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Bid History</h3>
                                <span className="text-sm text-gray-600">{bids.length} bids</span>
                            </div>
                            <div className="space-y-3">
                                {bids.map((bid) => (
                                    <div
                                        key={bid.id}
                                        className={`flex items-center justify-between p-3 rounded-lg ${bid.isHighest ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-700">
                                                    {bid.bidder.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{bid.bidder}</div>
                                                <div className="text-xs text-gray-500">{bid.time}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-semibold ${bid.isHighest ? 'text-green-600' : 'text-gray-900'}`}>
                                                {bid.amount}
                                            </div>
                                            {bid.isHighest && (
                                                <div className="text-xs text-green-600">Highest Bid</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Auction Stats */}
                        <div className="bg-white rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="h-4 w-4 mr-2" />
                                        Bidders
                                    </div>
                                    <span className="font-medium text-gray-900">{bids.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Price Change
                                    </div>
                                    <span className="font-medium text-green-600">+₹25,000</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Questions
                                    </div>
                                    <span className="font-medium text-gray-900">12</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Award className="h-4 w-4 mr-2" />
                                        Watchers
                                    </div>
                                    <span className="font-medium text-gray-900">48</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
