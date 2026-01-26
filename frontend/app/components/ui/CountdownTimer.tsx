'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Timer } from 'lucide-react';

interface CountdownTimerProps {
    endTime: string;
    startTime?: string;
    status?: 'upcoming' | 'live' | 'ending-soon' | 'ended';
    showIcon?: boolean;
    className?: string;
    onTimeUp?: () => void;
}

export default function CountdownTimer({
    endTime,
    startTime,
    showIcon = true,
    className = '',
    onTimeUp
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

    const [timeUntilStart, setTimeUntilStart] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    } | null>(null);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const start = startTime ? new Date(startTime).getTime() : null;

            // Calculate time until start if auction hasn't started
            if (start && now < start) {
                const diffToStart = start - now;
                setTimeUntilStart({
                    days: Math.floor(diffToStart / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diffToStart % (1000 * 60)) / 1000),
                    total: diffToStart
                });
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                return;
            }

            // Calculate time until end
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                setTimeUntilStart(null);
                if (onTimeUp) onTimeUp();
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
                total: diff
            });
            setTimeUntilStart(null);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, [endTime, startTime, onTimeUp]);

    const formatTime = (time: { days: number; hours: number; minutes: number; seconds: number }) => {
        if (time.days > 0) {
            return `${time.days}d ${time.hours}h ${time.minutes}m`;
        }
        if (time.hours > 0) {
            return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
        }
        return `${time.minutes}m ${time.seconds}s`;
    };

    const getTimerColor = () => {
        if (timeUntilStart) return 'text-blue-600';
        if (timeLeft.total <= 0) return 'text-gray-500';
        if (timeLeft.total <= 300000) return 'text-red-600'; // Less than 5 minutes
        if (timeLeft.total <= 3600000) return 'text-orange-600'; // Less than 1 hour
        return 'text-green-600';
    };

    const getIcon = () => {
        if (timeUntilStart) return <Timer className="h-4 w-4" />;
        if (timeLeft.total <= 0) return <Clock className="h-4 w-4" />;
        if (timeLeft.total <= 300000) return <AlertCircle className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    if (timeUntilStart) {
        return (
            <div className={`flex items-center space-x-1 ${className}`}>
                {showIcon && getIcon()}
                <span className={`font-medium ${getTimerColor()}`}>
                    Starts in {formatTime(timeUntilStart)}
                </span>
            </div>
        );
    }

    if (timeLeft.total <= 0) {
        return (
            <div className={`flex items-center space-x-1 ${className}`}>
                {showIcon && <Clock className="h-4 w-4 text-gray-500" />}
                <span className="font-medium text-gray-500">Ended</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            {showIcon && getIcon()}
            <span className={`font-medium ${getTimerColor()}`}>
                {formatTime(timeLeft)}
            </span>
        </div>
    );
}

// Badge version for compact display
export function CountdownBadge({
    endTime,
    startTime,
    className = ''
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

    const [timeUntilStart, setTimeUntilStart] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    } | null>(null);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const start = startTime ? new Date(startTime).getTime() : null;

            if (start && now < start) {
                const diffToStart = start - now;
                setTimeUntilStart({
                    days: Math.floor(diffToStart / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diffToStart % (1000 * 60)) / 1000),
                    total: diffToStart
                });
                return;
            }

            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
                total: diff
            });
            setTimeUntilStart(null);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, [endTime, startTime]);

    const formatTime = (time: { days: number; hours: number; minutes: number; seconds: number }) => {
        if (time.days > 0) {
            return `${time.days}d ${time.hours}h`;
        }
        if (time.hours > 0) {
            return `${time.hours}h ${time.minutes}m`;
        }
        return `${time.minutes}m ${time.seconds}s`;
    };

    const getBadgeStyle = () => {
        if (timeUntilStart) return 'bg-blue-100 text-blue-800';
        if (timeLeft.total <= 0) return 'bg-gray-100 text-gray-800';
        if (timeLeft.total <= 300000) return 'bg-red-100 text-red-800 animate-pulse';
        if (timeLeft.total <= 3600000) return 'bg-orange-100 text-orange-800';
        return 'bg-green-100 text-green-800';
    };

    const getIcon = () => {
        if (timeUntilStart) return <Timer className="h-3 w-3" />;
        if (timeLeft.total <= 0) return <Clock className="h-3 w-3" />;
        if (timeLeft.total <= 300000) return <AlertCircle className="h-3 w-3" />;
        return <Clock className="h-3 w-3" />;
    };

    const getText = () => {
        if (timeUntilStart) return `Starts ${formatTime(timeUntilStart)}`;
        if (timeLeft.total <= 0) return 'Ended';
        return formatTime(timeLeft);
    };

    return (
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeStyle()} ${className}`}>
            {getIcon()}
            <span>{getText()}</span>
        </div>
    );
}