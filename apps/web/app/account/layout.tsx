'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import {
    User,
    Package,
    CreditCard,
    Heart,
    MessageSquare,
    Settings,
    Gavel,
    Star,
    TrendingUp,
    Wallet,
    Zap,
    FileText,
    Shield,
    Bell,
    MapPin,
    Award,
    RefreshCw,
    Home
} from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const auth = useContext(AuthContext);
    const pathname = usePathname();
    const user = auth?.user;

    const navigation = [
        {
            name: 'Overview',
            href: '/account',
            icon: Home,
            current: pathname === '/account'
        },
        {
            name: 'Profile',
            href: '/account/profile',
            icon: User,
            current: pathname === '/account/profile'
        },
        {
            name: 'Orders',
            href: '/account/orders',
            icon: Package,
            current: pathname === '/account/orders'
        },
        {
            name: 'Bids',
            href: '/account/bids',
            icon: Gavel,
            current: pathname === '/account/bids'
        },
        {
            name: 'Watchlist',
            href: '/watchlist',
            icon: Heart,
            current: pathname === '/watchlist'
        },
        {
            name: 'Wallet',
            href: '/account/wallet',
            icon: Wallet,
            current: pathname === '/account/wallet'
        },
        {
            name: 'Transactions',
            href: '/account/transactions',
            icon: FileText,
            current: pathname === '/account/transactions'
        },
        {
            name: 'Addresses',
            href: '/account/addresses',
            icon: MapPin,
            current: pathname === '/account/addresses'
        },
        {
            name: 'Payment Methods',
            href: '/account/payment-methods',
            icon: CreditCard,
            current: pathname === '/account/payment-methods'
        },
        {
            name: 'Messages',
            href: '/messages',
            icon: MessageSquare,
            current: pathname === '/messages'
        },
        {
            name: 'Notifications',
            href: '/notifications',
            icon: Bell,
            current: pathname === '/notifications'
        },
        {
            name: 'Disputes',
            href: '/account/disputes',
            icon: Shield,
            current: pathname === '/account/disputes'
        },
        {
            name: 'Refunds',
            href: '/account/refunds',
            icon: RefreshCw,
            current: pathname === '/account/refunds'
        },
        {
            name: 'Settings',
            href: '/account/settings',
            icon: Settings,
            current: pathname === '/account/settings'
        }
    ];

    const sellerNavigation = [
        {
            name: 'Seller Dashboard',
            href: '/account/dashboard',
            icon: TrendingUp,
            current: pathname === '/account/dashboard'
        },
        {
            name: 'My Listings',
            href: '/account/listings',
            icon: Package,
            current: pathname === '/account/listings'
        },
        {
            name: 'Gas Wallet',
            href: '/account/gas-wallet',
            icon: Zap,
            current: pathname === '/account/gas-wallet'
        },
        {
            name: 'Subscription',
            href: '/account/subscription',
            icon: Star,
            current: pathname === '/account/subscription'
        },
        {
            name: 'Reviews',
            href: '/account/reviews',
            icon: Award,
            current: pathname === '/account/reviews'
        }
    ];

    const isSeller = user?.role === 'seller' || user?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                            {/* User Info */}
                            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <User className="h-6 w-6 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.firstName && user?.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user?.name || user?.email || 'User'
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    <div className="flex items-center mt-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                user?.role === 'seller' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user?.role || 'buyer'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-1">
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Account
                                    </h3>
                                    {navigation.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${item.current
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className={`flex-shrink-0 -ml-1 mr-3 h-4 w-4 ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                                    }`} />
                                                <span className="truncate">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Seller Section */}
                                {isSeller && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Seller Tools
                                        </h3>
                                        {sellerNavigation.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${item.current
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Icon className={`flex-shrink-0 -ml-1 mr-3 h-4 w-4 ${item.current ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                                                        }`} />
                                                    <span className="truncate">{item.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="lg:col-span-9 mt-8 lg:mt-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}