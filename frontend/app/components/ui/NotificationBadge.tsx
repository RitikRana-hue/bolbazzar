'use client';

import { Bell, X, Clock } from 'lucide-react';

interface NotificationBadgeProps {
    count: number;
    variant?: 'default' | 'dot' | 'large';
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
    showZero?: boolean;
    maxCount?: number;
    onClick?: () => void;
    onDismiss?: () => void;
    className?: string;
}

export default function NotificationBadge({
    count,
    variant = 'default',
    color = 'red',
    showZero = false,
    maxCount = 99,
    onClick,
    onDismiss,
    className = ''
}: NotificationBadgeProps) {
    if (count === 0 && !showZero) return null;

    const getColorClasses = () => {
        const colors = {
            red: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25',
            blue: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25',
            green: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25',
            yellow: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25',
            purple: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25'
        };
        return colors[color];
    };

    const formatCount = () => {
        if (count > maxCount) {
            return `${maxCount}+`;
        }
        return count.toString();
    };

    const baseClasses = `inline-flex items-center justify-center font-bold ${getColorClasses()} transition-all duration-200`;

    if (variant === 'dot') {
        return (
            <span
                className={`${baseClasses} w-3 h-3 rounded-full animate-pulse hover:scale-110 cursor-pointer ${className}`}
                onClick={onClick}
            />
        );
    }

    if (variant === 'large') {
        return (
            <div
                className={`${baseClasses} px-6 py-3 rounded-full text-sm cursor-pointer hover:scale-105 hover:shadow-xl transform ${className}`}
                onClick={onClick}
            >
                <Bell className="h-4 w-4 mr-2 animate-pulse" />
                <span>{formatCount()} notification{count !== 1 ? 's' : ''}</span>
                {onDismiss && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="ml-3 hover:bg-white/20 rounded-full p-1.5 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <span
            className={`${baseClasses} min-w-[1.5rem] h-6 px-2 rounded-full text-xs cursor-pointer hover:scale-110 transform animate-pulse ${className}`}
            onClick={onClick}
        >
            {formatCount()}
        </span>
    );
}

// Notification Badge with Icon wrapper
interface NotificationIconProps {
    icon: React.ReactNode;
    count: number;
    variant?: 'default' | 'dot';
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
    onClick?: () => void;
    className?: string;
}

export function NotificationIcon({
    icon,
    count,
    variant = 'default',
    color = 'red',
    onClick,
    className = ''
}: NotificationIconProps) {
    return (
        <div className={`relative inline-block cursor-pointer hover:scale-110 transition-transform duration-200 ${className}`} onClick={onClick}>
            <div className="relative">
                {icon}
                {count > 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <NotificationBadge
                            count={count}
                            variant={variant}
                            color={color}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Notification List Item
interface NotificationItemProps {
    notification: {
        id: string;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        timestamp: string;
        isRead: boolean;
        actionUrl?: string;
    };
    onMarkAsRead?: (id: string) => void;
    onDismiss?: (id: string) => void;
    onClick?: (notification: any) => void;
}

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDismiss,
    onClick
}: NotificationItemProps) {
    const getTypeIcon = () => {
        switch (notification.type) {
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            default:
                return 'ℹ️';
        }
    };

    const getTypeColor = () => {
        switch (notification.type) {
            case 'success':
                return 'border-l-green-500';
            case 'warning':
                return 'border-l-yellow-500';
            case 'error':
                return 'border-l-red-500';
            default:
                return 'border-l-blue-500';
        }
    };

    const handleClick = () => {
        if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
        if (onClick) {
            onClick(notification);
        } else if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };

    return (
        <div
            className={`p-4 border-l-4 ${getTypeColor()} ${notification.isRead ? 'bg-gray-50/50' : 'bg-white'
                } hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md rounded-r-lg group`}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl bg-white rounded-full p-2 shadow-sm group-hover:scale-110 transition-transform">
                        {getTypeIcon()}
                    </div>
                    <div className="flex-1">
                        <h4 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'
                            } group-hover:text-blue-600 transition-colors`}>
                            {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'
                            } leading-relaxed`}>
                            {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-3 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(notification.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                    {!notification.isRead && (
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse shadow-lg"></div>
                    )}
                    {onDismiss && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}