'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Clock,
    Users,
    TrendingUp,
    Heart,
    Gavel,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface AuctionCardProps {
    id?: string;
    title?: string;
    currentBid?: number;
    bids?: number;
    endTime?: string;
    image?: string;
    seller?: string;
    // Legacy support
    auction?: {
        id: string;
        productId?: string;
        title: string;
        image: string;
        startingPrice: number;
        currentPrice: number;
        reservePrice?: number;
        endTime: string;
        totalBids: number;
        isReserveMet: boolean;
        seller: {
            name: string;
            rating: number;
        };
        condition: string;
        category: string;
    };
    variant?: 'default' | 'compact' | 'featured';
    showBidButton?: boolean;
}

export default function AuctionCard({
    id,
    title,
    currentBid,
    bids,
    endTime,
    image,
    seller,
    auction,
    variant = 'default',
    showBidButton = true
}: AuctionCardProps) {
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isEnded, setIsEnded] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Support both new and legacy props
    const auctionData = auction || {
        id: id || '',
        title: title || 'Untitled Auction',
        image: image || '/placeholder-product.jpg',
        currentPrice: currentBid || 0,
        endTime: endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        totalBids: bids || 0,
        seller: {
            name: seller || 'Unknown Seller',
            rating: 4.5
        },
        condition: 'New',
        category: 'Electronics',
        startingPrice: (currentBid || 0) * 0.8,
        isReserveMet: true
    };

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(auctionData.endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeRemaining('Ended');
                setIsEnded(true);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
                setTimeRemaining(`${minutes}m ${seconds}s`);
            } else {
                setTimeRemaining(`${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [auctionData.endTime]);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorited(!isFavorited);
    };

    const handleBidNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to auction page with bid modal
        window.location.href = `/auctions/${auctionData.id}?bid=true`;
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder-product.jpg';
        setIsLoading(false);
    };

    const getTimerColor = () => {
        if (isEnded) return 'bg-gray-500';

        const now = new Date().getTime();
        const end = new Date(auctionData.endTime).getTime();
        const diff = end - now;
        const hoursLeft = diff / (1000 * 60 * 60);

        if (hoursLeft < 1) return 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse';
        if (hoursLeft < 24) return 'bg-gradient-to-r from-orange-500 to-red-500';
        return 'bg-gradient-to-r from-green-500 to-blue-500';
    };

    const cardClasses = {
        default: 'bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300',
        compact: 'bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200',
        featured: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white'
    };

    const imageClasses = {
        default: 'w-full h-48 object-cover',
        compact: 'w-full h-32 object-cover',
        featured: 'w-full h-64 object-cover'
    };

    return (
        <Link href={`/auctions/${auctionData.id}`} className="block group">
            <div className={`${cardClasses[variant]} group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1`}>
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-t-lg bg-gray-100">
                    {isLoading && (
                        <div className={`${imageClasses[variant]} bg-gray-200 animate-pulse flex items-center justify-center`}>
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                    <img
                        src={auctionData.image}
                        alt={auctionData.title}
                        className={`${imageClasses[variant]} hover:scale-110 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />

                    {/* Auction Badge */}
                    <div className="absolute top-2 left-2">
                        <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                            <Gavel className="h-3 w-3 mr-1" />
                            AUCTION
                        </div>
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavorite}
                        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-colors ${isFavorited
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                            }`}
                    >
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>

                    {/* Timer */}
                    <div className="absolute bottom-2 left-2 right-2">
                        <div className={`${getTimerColor()} text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center`}>
                            <Clock className="h-4 w-4 mr-2" />
                            {timeRemaining}
                        </div>
                    </div>

                    {/* Reserve Status */}
                    {auctionData.reservePrice && (
                        <div className="absolute bottom-14 right-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center backdrop-blur-sm ${auctionData.isReserveMet
                                ? 'bg-green-500/90 text-white'
                                : 'bg-yellow-500/90 text-white'
                                }`}>
                                {auctionData.isReserveMet ? (
                                    <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Reserve Met
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Reserve Not Met
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {auctionData.title}
                    </h3>

                    {/* Price Info */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Current Bid:</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                ${auctionData.currentPrice.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Starting:</span>
                            <span className="text-gray-900 font-medium">
                                ${auctionData.startingPrice.toFixed(2)}
                            </span>
                        </div>

                        {auctionData.reservePrice && !auctionData.isReserveMet && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Reserve:</span>
                                <span className="text-orange-600 font-medium">
                                    ${auctionData.reservePrice.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bid Stats */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-full">
                                <Users className="h-3 w-3" />
                                <span className="font-medium">{auctionData.totalBids}</span>
                            </div>
                            <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                <TrendingUp className="h-3 w-3" />
                                <span className="font-medium">
                                    {auctionData.startingPrice > 0
                                        ? ((auctionData.currentPrice - auctionData.startingPrice) / auctionData.startingPrice * 100).toFixed(0)
                                        : '0'
                                    }%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Seller & Category */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {auctionData.seller.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-700 font-medium">{auctionData.seller.name}</span>
                        </div>
                        <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {auctionData.category}
                        </span>
                    </div>

                    {/* Condition */}
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {auctionData.condition}
                        </span>
                        <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(auctionData.seller.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="text-xs text-gray-600 ml-1">({auctionData.seller.rating})</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {showBidButton && !isEnded && (
                        <div className="pt-2 border-t border-gray-100">
                            <button
                                onClick={handleBidNow}
                                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Gavel className="h-4 w-4 mr-2" />
                                Place Bid
                                <div className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                                    ${(auctionData.currentPrice + 1).toFixed(2)}+
                                </div>
                            </button>
                        </div>
                    )}

                    {isEnded && (
                        <div className="pt-2 border-t border-gray-100">
                            <div className="text-center py-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium flex items-center justify-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Auction Ended
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}