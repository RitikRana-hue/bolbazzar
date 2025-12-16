'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
    endTime: string;
    onExpire?: () => void;
    variant?: 'default' | 'compact' | 'large';
    showIcon?: boolean;
    autoExtend?: boolean;
    extensionTime?: number; // seconds
    className?: string;
}

export default function Timer({
    endTime,
    onExpire,
    variant = 'default',
    showIcon = true,
    autoExtend = false,
    extensionTime = 300,
    className
}: TimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
    });
    const [isExpired, setIsExpired] = useState(false);
    const [isExtended, setIsExtended] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                if (!isExpired) {
                    setIsExpired(true);
                    onExpire?.();
                }
                return;
            }

            // Auto-extend logic (for auctions)
            if (autoExtend && diff <= 5000 && !isExtended) { // Last 5 seconds
                setIsExtended(true);
                // In real implementation, this would trigger an API call
                console.log('Timer extended by', extensionTime, 'seconds');
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, total: diff });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime, onExpire, isExpired, autoExtend, extensionTime, isExtended]);

    const getUrgencyLevel = () => {
        const totalHours = timeLeft.total / (1000 * 60 * 60);
        if (totalHours < 1) return 'critical';
        if (totalHours < 24) return 'warning';
        return 'normal';
    };

    const getTimerStyles = () => {
        const urgency = getUrgencyLevel();
        const baseStyles = 'flex items-center justify-center font-mono font-bold backdrop-blur-sm';

        switch (variant) {
            case 'compact':
                return {
                    container: `${baseStyles} text-sm px-3 py-1.5 rounded-full shadow-sm`,
                    colors: {
                        normal: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
                        warning: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
                        critical: 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg'
                    }[urgency]
                };
            case 'large':
                return {
                    container: `${baseStyles} text-3xl px-8 py-6 rounded-2xl shadow-xl`,
                    colors: {
                        normal: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white',
                        warning: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white',
                        critical: 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 text-white animate-pulse shadow-2xl'
                    }[urgency]
                };
            default:
                return {
                    container: `${baseStyles} text-base px-4 py-2 rounded-lg shadow-md`,
                    colors: {
                        normal: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
                        warning: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
                        critical: 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg'
                    }[urgency]
                };
        }
    };

    const formatTime = () => {
        if (isExpired) return 'EXPIRED';

        const parts = [];

        if (timeLeft.days > 0) {
            parts.push(`${timeLeft.days}d`);
        }
        if (timeLeft.hours > 0 || timeLeft.days > 0) {
            parts.push(`${timeLeft.hours.toString().padStart(2, '0')}h`);
        }
        if (timeLeft.minutes > 0 || timeLeft.hours > 0 || timeLeft.days > 0) {
            parts.push(`${timeLeft.minutes.toString().padStart(2, '0')}m`);
        }
        parts.push(`${timeLeft.seconds.toString().padStart(2, '0')}s`);

        return parts.join(' ');
    };

    const formatDetailedTime = () => {
        if (isExpired) return 'Auction has ended';

        const parts = [];

        if (timeLeft.days > 0) {
            parts.push(`${timeLeft.days} day${timeLeft.days !== 1 ? 's' : ''}`);
        }
        if (timeLeft.hours > 0) {
            parts.push(`${timeLeft.hours} hour${timeLeft.hours !== 1 ? 's' : ''}`);
        }
        if (timeLeft.minutes > 0) {
            parts.push(`${timeLeft.minutes} minute${timeLeft.minutes !== 1 ? 's' : ''}`);
        }
        if (timeLeft.seconds > 0 && timeLeft.days === 0 && timeLeft.hours === 0) {
            parts.push(`${timeLeft.seconds} second${timeLeft.seconds !== 1 ? 's' : ''}`);
        }

        if (parts.length === 0) return 'Less than a second';

        return parts.join(', ') + ' remaining';
    };

    const styles = getTimerStyles();

    if (variant === 'large') {
        return (
            <div className="text-center space-y-6">
                <div className={`${styles.container} ${styles.colors} relative overflow-hidden`}>
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        {showIcon && !isExpired && <Clock className="h-8 w-8 mb-4 animate-pulse" />}
                        {isExpired && <AlertTriangle className="h-8 w-8 mb-4" />}

                        <div className="grid grid-cols-4 gap-6 text-center">
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-4xl font-bold mb-1">{timeLeft.days.toString().padStart(2, '0')}</div>
                                <div className="text-sm opacity-90 font-medium">Days</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-4xl font-bold mb-1">{timeLeft.hours.toString().padStart(2, '0')}</div>
                                <div className="text-sm opacity-90 font-medium">Hours</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-4xl font-bold mb-1">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                                <div className="text-sm opacity-90 font-medium">Minutes</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="text-4xl font-bold mb-1">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                                <div className="text-sm opacity-90 font-medium">Seconds</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <p className="text-gray-700 font-medium">{formatDetailedTime()}</p>
                </div>

                {isExtended && (
                    <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center justify-center text-yellow-800">
                            <AlertTriangle className="h-5 w-5 mr-2 animate-bounce" />
                            <span className="font-medium">
                                🎯 Auction extended by {extensionTime / 60} minutes due to last-minute bid!
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${styles.colors} relative overflow-hidden group ${className || ''}`}>
            {/* Subtle animation background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative z-10 flex items-center">
                {showIcon && !isExpired && <Clock className="h-4 w-4 mr-2 animate-pulse" />}
                {isExpired && <AlertTriangle className="h-4 w-4 mr-2" />}
                <span className="font-bold tracking-wide">{formatTime()}</span>
                {isExtended && variant !== 'compact' && (
                    <span className="ml-2 text-xs bg-yellow-200/90 text-yellow-800 px-2 py-0.5 rounded-full font-medium animate-pulse">
                        ⚡ Extended
                    </span>
                )}
            </div>
        </div>
    );
}