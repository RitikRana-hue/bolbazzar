'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface MetroTileProps {
    href: string;
    color?: 'teal' | 'orange' | 'blue' | 'red' | 'purple' | 'green' | 'dark-blue' | 'lime' | 'magenta' | 'brown';
    size?: 'small' | 'medium' | 'large' | 'wide' | 'tall';
    title: string;
    subtitle?: string;
    price?: number;
    badge?: string;
    icon?: ReactNode;
    footer?: string;
    className?: string;
    backgroundImage?: string;
    useBackgroundImage?: boolean;
}

const colorMap = {
    teal: 'bg-[#00ABA9]',
    orange: 'bg-[#F09609]',
    blue: 'bg-[#1BA1E2]',
    red: 'bg-[#E51400]',
    purple: 'bg-[#8C0095]',
    green: 'bg-[#00A300]',
    'dark-blue': 'bg-[#2D89EF]',
    lime: 'bg-[#8CBF26]',
    magenta: 'bg-[#FF0097]',
    brown: 'bg-[#A05000]',
};

const sizeMap = {
    small: 'aspect-square',
    medium: 'aspect-square',
    large: 'col-span-2 row-span-2',
    wide: 'col-span-2',
    tall: 'row-span-2',
};

export default function MetroTile({
    href,
    color,
    size = 'small',
    title,
    subtitle,
    price,
    badge,
    icon,
    footer,
    className = '',
    backgroundImage,
    useBackgroundImage = false,
}: MetroTileProps) {
    const bgColor = color ? colorMap[color] : '';
    const sizeClass = sizeMap[size];

    const tileStyle = useBackgroundImage && backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    } : {};

    return (
        <Link
            href={href}
            className={`${useBackgroundImage ? '' : bgColor} ${sizeClass} text-white p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-200 shadow-lg group relative overflow-hidden ${className}`}
            style={tileStyle}
        >
            {/* Background overlay for image tiles */}
            {useBackgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            )}

            {/* Hover overlay */}
            <div className={`absolute inset-0 ${useBackgroundImage ? 'bg-black/20' : 'bg-black'} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Badge */}
                {badge && (
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold inline-block mb-3">
                        {badge}
                    </div>
                )}

                {/* Icon and Title */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        {subtitle && (
                            <div className="text-xs opacity-80 uppercase tracking-wider mb-1">
                                {subtitle}
                            </div>
                        )}
                        <h3 className={`font-semibold ${size === 'large' ? 'text-3xl' : size === 'wide' ? 'text-xl' : 'text-base'} line-clamp-2`}>
                            {title}
                        </h3>
                    </div>
                    {icon && (
                        <div className="ml-2">
                            {icon}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer with Price */}
            <div className="relative z-10">
                {price !== undefined && (
                    <>
                        <div className={`font-bold ${size === 'large' ? 'text-4xl' : size === 'wide' ? 'text-3xl' : 'text-2xl'}`}>
                            ${price.toLocaleString()}
                        </div>
                        {footer && (
                            <div className="text-xs opacity-80 uppercase tracking-wide mt-1">
                                {footer}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
        </Link>
    );
}

// Specialized variants
export function MetroBidTile({
    href,
    color,
    title,
    price,
    bids,
    icon,
}: {
    href: string;
    color: MetroTileProps['color'];
    title: string;
    price: number;
    bids: number;
    icon?: ReactNode;
}) {
    return (
        <MetroTile
            href={href}
            color={color}
            size="small"
            title={title}
            price={price}
            badge={`${bids} BIDS`}
            icon={icon}
            footer="Current Bid"
        />
    );
}

export function MetroProductTile({
    href,
    color,
    category,
    title,
    price,
    size = 'small',
    backgroundImage,
    useBackgroundImage = false,
}: {
    href: string;
    color?: MetroTileProps['color'];
    category: string;
    title: string;
    price: number;
    size?: MetroTileProps['size'];
    backgroundImage?: string;
    useBackgroundImage?: boolean;
}) {
    return (
        <MetroTile
            href={href}
            color={color}
            size={size}
            title={title}
            subtitle={category}
            price={price}
            footer="In Stock"
            backgroundImage={backgroundImage}
            useBackgroundImage={useBackgroundImage}
        />
    );
}

export function MetroFeatureTile({
    href,
    title,
    description,
    price,
    badge = 'FEATURED',
    backgroundImage,
}: {
    href: string;
    title: string;
    description: string;
    price: number;
    badge?: string;
    backgroundImage?: string;
}) {
    const tileStyle = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    } : {};

    return (
        <Link
            href={href}
            className={`${backgroundImage ? '' : 'bg-[#E51400]'} text-white p-8 col-span-2 row-span-2 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 shadow-lg group relative overflow-hidden`}
            style={tileStyle}
        >
            {/* Background overlay for image tiles */}
            {backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
            )}

            <div className={`absolute inset-0 ${backgroundImage ? 'bg-black/20' : 'bg-black'} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
            <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold inline-block mb-4">
                    {badge}
                </div>
                <h3 className="font-bold text-3xl mb-2 drop-shadow-lg">{title}</h3>
                <p className="text-sm opacity-90 mb-4 drop-shadow-md">{description}</p>
            </div>
            <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 drop-shadow-lg">${price.toLocaleString()}</div>
                <div className="text-sm opacity-80 uppercase tracking-wide">Buy Now</div>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
        </Link>
    );
}

export function MetroWideTile({
    href,
    color,
    category,
    title,
    description,
    price,
    badge,
    backgroundImage,
}: {
    href: string;
    color?: MetroTileProps['color'];
    category: string;
    title: string;
    description: string;
    price: number;
    badge?: string;
    backgroundImage?: string;
}) {
    const bgColor = color ? colorMap[color] : '';

    const tileStyle = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    } : {};

    return (
        <Link
            href={href}
            className={`${backgroundImage ? '' : bgColor} text-white p-6 col-span-2 flex items-center justify-between hover:scale-[1.02] transition-transform duration-200 shadow-lg group relative overflow-hidden`}
            style={tileStyle}
        >
            {/* Background overlay for image tiles */}
            {backgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20"></div>
            )}

            <div className={`absolute inset-0 ${backgroundImage ? 'bg-black/20' : 'bg-black'} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
            <div className="relative z-10">
                <div className="text-xs opacity-80 uppercase tracking-wider mb-1">{category}</div>
                <h3 className="font-bold text-xl mb-1 drop-shadow-lg">{title}</h3>
                <p className="text-sm opacity-90 drop-shadow-md">{description}</p>
                {badge && (
                    <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold inline-block mt-2">
                        {badge}
                    </div>
                )}
            </div>
            <div className="relative z-10 text-right">
                <div className="text-3xl font-bold drop-shadow-lg">${price.toLocaleString()}</div>
                <div className="text-xs opacity-80 uppercase tracking-wide">Bundle</div>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
        </Link>
    );
}