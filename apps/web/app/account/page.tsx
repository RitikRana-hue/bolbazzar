'use client';

import Link from 'next/link';
import {
    Package,
    CreditCard,
    MapPin,
    Heart,
    Bell,
    MessageSquare,
    Gavel,
    Star,
    Shield,
    TrendingUp,
    Wallet,
    Zap,
    FileText,
    ChevronRight,
    User,
    ShoppingBag,
    Award
} from 'lucide-react';

export default function AccountPage() {
    // Mock user stats - replace with actual data
    const userStats = {
        totalOrders: 24,
        activeBids: 3,
        watchlistItems: 12,
        walletBalance: 156.78,
        sellerRating: 4.8,
        totalSales: 89
    };

    const quickActions = [
        {
            title: 'My Orders',
            description: 'Track your purchases and deliveries',
            icon: Package,
            href: '/account/orders',
            color: 'bg-blue-100 text-blue-600',
            count: userStats.totalOrders
        },
        {
            title: 'My Bids',
            description: 'Active and completed auction bids',
            icon: Gavel,
            href: '/account/bids',
            color: 'bg-purple-100 text-purple-600',
            count: userStats.activeBids
        },
        {
            title: 'Watchlist',
            description: 'Items you\'re watching',
            icon: Heart,
            href: '/watchlist',
            color: 'bg-red-100 text-red-600',
            count: userStats.watchlistItems
        },
        {
            title: 'Wallet',
            description: 'Manage your balance and payments',
            icon: Wallet,
            href: '/account/wallet',
            color: 'bg-green-100 text-green-600',
            balance: userStats.walletBalance
        },
        {
            title: 'Messages',
            description: 'Chat with buyers and sellers',
            icon: MessageSquare,
            href: '/messages',
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            title: 'Notifications',
            description: 'Stay updated with alerts',
            icon: Bell,
            href: '/notifications',
            color: 'bg-indigo-100 text-indigo-600'
        }
    ];

    const accountSections = [
        {
            title: 'Account Settings',
            items: [
                { name: 'Personal Information', href: '/account/profile', icon: User, description: 'Update your profile details' },
                { name: 'Addresses', href: '/account/addresses', icon: MapPin, description: 'Manage shipping addresses' },
                { name: 'Payment Methods', href: '/account/payment-methods', icon: CreditCard, description: 'Cards and payment options' },
                { name: 'Security Settings', href: '/account/security', icon: Shield, description: 'Password and security' },
                { name: 'Notification Preferences', href: '/account/notifications', icon: Bell, description: 'Control your alerts' }
            ]
        },
        {
            title: 'Buying & Selling',
            items: [
                { name: 'Purchase History', href: '/account/orders', icon: ShoppingBag, description: 'All your orders and purchases' },
                { name: 'Bid History', href: '/account/bids', icon: Gavel, description: 'Your auction activity' },
                { name: 'Seller Dashboard', href: '/account/dashboard', icon: TrendingUp, description: 'Manage your listings' },
                { name: 'My Listings', href: '/account/listings', icon: Package, description: 'Active and sold items' },
                { name: 'Seller Reviews', href: '/account/reviews', icon: Star, description: 'Customer feedback' },
                { name: 'Seller Points', href: '/account/points', icon: Award, description: 'Loyalty program status' }
            ]
        },
        {
            title: 'Financial',
            items: [
                { name: 'Wallet & Balance', href: '/account/wallet', icon: Wallet, description: 'Main wallet balance' },
                { name: 'Gas Wallet', href: '/account/gas-wallet', icon: Zap, description: 'Auction fees and subscriptions' },
                { name: 'Transaction History', href: '/account/transactions', icon: FileText, description: 'All payment activity' },
                { name: 'Refunds & Returns', href: '/account/refunds', icon: Package, description: 'Return status and refunds' },
                { name: 'Seller Payouts', href: '/account/payouts', icon: CreditCard, description: 'Earnings and withdrawals' }
            ]
        },
        {
            title: 'Communication & Support',
            items: [
                { name: 'Messages', href: '/messages', icon: MessageSquare, description: 'Chat with other users' },
                { name: 'Disputes', href: '/account/disputes', icon: Shield, description: 'Resolution center' },
                { name: 'Saved Channels', href: '/account/channels', icon: Bell, description: 'Seller and category subscriptions' },
                { name: 'Subscription Plans', href: '/account/subscription', icon: Star, description: 'Seller membership plans' }
            ]
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section - Matching Reference Image */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <img
                                src="https://via.placeholder.com/80"
                                alt="User Avatar"
                                className="w-20 h-20 rounded-full border-4 border-white/20"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Welcome back, User!</h1>
                            <p className="text-blue-100 mb-2">Member since December 2024</p>
                            <div className="flex items-center">
                                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span className="text-sm font-medium">Seller Rating: {userStats.sellerRating}/5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-100 text-sm mb-1">Total Sales</p>
                        <p className="text-4xl font-bold">{userStats.totalSales}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid - Matching Reference Image */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.title}
                                href={action.href}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group relative overflow-hidden"
                            >
                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                                    </div>

                                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {action.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{action.description}</p>

                                    <div className="flex items-center justify-between">
                                        {action.count !== undefined && (
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">{action.count}</p>
                                                <p className="text-xs text-gray-500">Items</p>
                                            </div>
                                        )}
                                        {action.balance !== undefined && (
                                            <div>
                                                <p className="text-2xl font-bold text-green-600">${action.balance.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">Available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Account Sections */}
            {accountSections.map((section) => (
                <div key={section.title}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Recent Activity */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Package className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Order delivered</p>
                                <p className="text-sm text-gray-600">iPhone 15 Pro Max - Order #12345</p>
                            </div>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Gavel className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Auction won</p>
                                <p className="text-sm text-gray-600">MacBook Pro M3 - Final bid: $850.00</p>
                            </div>
                            <span className="text-sm text-gray-500">1 day ago</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Payment received</p>
                                <p className="text-sm text-gray-600">Seller payout: $245.50</p>
                            </div>
                            <span className="text-sm text-gray-500">3 days ago</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <Link
                            href="/account/activity"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                        >
                            View all activity
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
