'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Heart,
    Eye,
    ShoppingCart,
    Star,
    Verified,
    Zap,
    Shield
} from 'lucide-react';

interface ProductCardProps {
    id?: string;
    title?: string;
    price?: number;
    originalPrice?: number;
    image?: string;
    seller?: string;
    rating?: number;
    reviews?: number;
    variant?: 'default' | 'compact' | 'featured';
    showActions?: boolean;
}

export default function ProductCard({
    id = '',
    title = '',
    price = 0,
    originalPrice,
    image = '',
    seller = '',
    rating,
    reviews,
    variant = 'default',
    showActions = true
}: ProductCardProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setIsFavorited(!isFavorited);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            console.log('Added to cart:', id);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const discountPercentage = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const cardClasses = {
        default: 'group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden',
        compact: 'group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden',
        featured: 'group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300 overflow-hidden relative'
    };

    const imageClasses = {
        default: 'w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500',
        compact: 'w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500',
        featured: 'w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500'
    };

    return (
        <Link href={`/p/${id}`} className="block">
            <div className={cardClasses[variant]}>
                {/* Featured Badge */}
                {variant === 'featured' && (
                    <div className="absolute top-0 right-0 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            FEATURED
                        </div>
                    </div>
                )}

                {/* Image Container */}
                <div className="relative overflow-hidden">
                    {/* Loading Skeleton */}
                    {!imageLoaded && (
                        <div className={`${imageClasses[variant].replace('object-cover', '')} bg-gray-200 animate-pulse flex items-center justify-center`}>
                            <div className="text-gray-400">
                                <Eye className="h-8 w-8" />
                            </div>
                        </div>
                    )}

                    <img
                        src={image}
                        alt={title}
                        className={`${imageClasses[variant]} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Overlay Actions */}
                    {showActions && (
                        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <button
                                onClick={handleFavorite}
                                disabled={isLoading}
                                className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${isFavorited
                                        ? 'bg-red-500 text-white scale-110'
                                        : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500 hover:scale-110'
                                    } ${isLoading ? 'animate-pulse' : ''}`}
                            >
                                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                            </button>
                            <button className="p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-500 backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-110">
                                <Eye className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-3 left-3">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                                <Zap className="h-3 w-3 mr-1" />
                                {discountPercentage}% OFF
                            </div>
                        </div>
                    )}

                    {/* Condition Badge */}
                    <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-full border border-white/20">
                            New
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                            ${price.toFixed(2)}
                        </span>
                        {originalPrice && originalPrice > price && (
                            <>
                                <span className="text-sm text-gray-500 line-through">
                                    ${originalPrice.toFixed(2)}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                    Save ${(originalPrice - price).toFixed(2)}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{seller}</span>
                            <Verified className="h-4 w-4 text-blue-500" />
                        </div>
                        {rating && (
                            <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-gray-700">
                                    {rating.toFixed(1)}
                                </span>
                                {reviews && (
                                    <span className="text-xs text-gray-500">
                                        ({reviews})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{Math.floor(Math.random() * 1000)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Heart className="h-3 w-3" />
                                <span>{Math.floor(Math.random() * 100)}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3 text-green-500" />
                            <span className="text-green-600 font-medium">Protected</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {showActions && (
                        <div className="flex space-x-2 pt-2">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}