'use client';

import Link from 'next/link';
import { Gavel } from 'lucide-react';

interface MetroBidTileProps {
    href: string;
    title: string;
    price: number;
    bids: number;
    image: string;
    size?: 'small' | 'medium' | 'large' | 'wide' | 'tall';
    className?: string;
}

const sizeMap = {
    small: 'aspect-square',
    medium: 'aspect-square',
    large: 'col-span-2 row-span-2',
    wide: 'col-span-2 aspect-[2/1]',
    tall: 'row-span-2 aspect-[1/2]',
};

export default function MetroBidTile({
    href,
    title,
    price,
    bids,
    image,
    size = 'small',
    className = '',
}: MetroBidTileProps) {
    const sizeClass = sizeMap[size];

    // Determine text sizes based on tile size
    const titleSize = size === 'large' ? 'text-2xl' : size === 'wide' ? 'text-xl' : 'text-base';
    const priceSize = size === 'large' ? 'text-4xl' : size === 'wide' ? 'text-3xl' : 'text-2xl';
    const padding = size === 'large' ? 'p-8' : 'p-6';

    return (
        <Link
            href={href}
            className={`${sizeClass} ${padding} relative overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg group ${className}`}
            style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Content container */}
            <div className="relative z-10 h-full flex flex-col justify-between text-white">
                {/* Header with icon and bid count */}
                <div className="flex items-start justify-between">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-2 group-hover:bg-white/30 transition-colors duration-300">
                        <Gavel className={`${size === 'large' ? 'h-8 w-8' : 'h-6 w-6'} text-white`} />
                    </div>
                    <div className="bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg animate-pulse">
                        {bids} BIDS
                    </div>
                </div>

                {/* Title */}
                <div className="flex-1 flex items-center">
                    <h3 className={`${titleSize} font-bold line-clamp-2 text-white drop-shadow-lg`}>
                        {title}
                    </h3>
                </div>

                {/* Price and status */}
                <div className="space-y-1">
                    <div className={`${priceSize} font-bold text-white drop-shadow-lg`}>
                        ${price.toLocaleString()}
                    </div>
                    <div className="text-xs opacity-90 uppercase tracking-wider font-medium">
                        Current Bid
                    </div>

                    {/* Hot indicator for high bid count */}
                    {bids > 100 && (
                        <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                            🔥 HOT
                        </div>
                    )}
                </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </div>

            {/* Border glow effect for high-value items */}
            {price > 5000 && (
                <div className="absolute inset-0 border-2 border-yellow-400/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
        </Link>
    );
}

// Specialized variant for featured/trending bids
export function MetroFeaturedBidTile({
    href,
    title,
    price,
    bids,
    image,
    badge = 'FEATURED',
}: {
    href: string;
    title: string;
    price: number;
    bids: number;
    image: string;
    badge?: string;
}) {
    return (
        <Link
            href={href}
            className="col-span-2 row-span-2 p-8 relative overflow-hidden hover:scale-[1.02] transition-all duration-300 shadow-xl group"
            style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 h-full flex flex-col justify-between text-white">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                        {badge}
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                        <Gavel className="h-8 w-8 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h3 className="text-3xl font-bold line-clamp-2 text-white drop-shadow-lg">
                        {title}
                    </h3>

                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider animate-pulse">
                            {bids} BIDS
                        </div>
                        <div className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                            🔥 TRENDING
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <div className="text-5xl font-bold text-white drop-shadow-lg">
                        ${price.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-90 uppercase tracking-wider font-medium">
                        Current High Bid
                    </div>
                </div>
            </div>

            {/* Premium shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-out"></div>
            </div>

            {/* Premium border */}
            <div className="absolute inset-0 border-2 border-yellow-400/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
    );
}