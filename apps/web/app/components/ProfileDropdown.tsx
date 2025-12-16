'use client';

import Link from 'next/link';
import { useContext } from 'react';
import {
    User,
    Package,
    CreditCard,
    Heart,
    MessageSquare,
    Settings,
    HelpCircle,
    LogOut,
    Shield,
    Gavel,
    Zap,
    Star,
    TrendingUp,
    FileText,
    MapPin
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function ProfileDropdown() {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    if (!user) return null;

    const userRole = user.role || 'buyer';
    const isAdmin = user.role === 'admin';
    const isSeller = user.role === 'seller';

    return (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] max-h-[85vh] overflow-hidden">
            {/* Invisible bridge to prevent hover gap */}
            <div className="absolute -top-2 right-0 w-full h-2 bg-transparent"></div>

            {/* Scrollable content */}
            <div className="max-h-[80vh] overflow-y-auto profile-dropdown-scroll py-2">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.name || user.email
                                }
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${userRole === 'admin' ? 'bg-red-100 text-red-800' :
                                    userRole === 'seller' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                    {userRole === 'delivery_agent' ? 'Delivery Agent' : userRole}
                                </span>
                                {user.isEmailVerified && (
                                    <span className="ml-2 inline-flex items-center text-green-600">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Section */}
                <div className="py-2">
                    <div className="px-4 py-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                    </div>
                    <Link href="/account" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        My Accounts
                    </Link>
                    <Link href="/account/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Package className="h-4 w-4 mr-3 text-gray-400" />
                        My Orders
                        {user.notifications && user.notifications > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {user.notifications}
                            </span>
                        )}
                    </Link>
                    <Link href="/account/bids" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Gavel className="h-4 w-4 mr-3 text-gray-400" />
                        My Bids
                    </Link>
                    <Link href="/watchlist" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Heart className="h-4 w-4 mr-3 text-gray-400" />
                        Watchlist
                    </Link>
                    <Link href="/account/wallet" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <CreditCard className="h-4 w-4 mr-3 text-gray-400" />
                        Wallet
                    </Link>
                    <Link href="/messages" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <MessageSquare className="h-4 w-4 mr-3 text-gray-400" />
                        Messages
                    </Link>
                </div>

                {/* Seller Section */}
                {isSeller && (
                    <div className="py-2 border-t border-gray-100">
                        <div className="px-4 py-1">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Seller Tools</p>
                        </div>
                        <Link href="/account/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <TrendingUp className="h-4 w-4 mr-3 text-green-500" />
                            Seller Dashboard
                        </Link>
                        <Link href="/sell/create" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Package className="h-4 w-4 mr-3 text-green-500" />
                            Create Listing
                        </Link>
                        <Link href="/account/listings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Gavel className="h-4 w-4 mr-3 text-green-500" />
                            My Listings
                        </Link>
                        <Link href="/account/gas-wallet" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Zap className="h-4 w-4 mr-3 text-green-500" />
                            Gas Wallet
                        </Link>
                        <Link href="/account/subscription" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Star className="h-4 w-4 mr-3 text-green-500" />
                            Subscription
                        </Link>
                    </div>
                )}

                {/* Admin Section */}
                {isAdmin && (
                    <div className="py-2 border-t border-gray-100">
                        <div className="px-4 py-1">
                            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Admin</p>
                        </div>
                        <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Shield className="h-4 w-4 mr-3 text-red-500" />
                            Admin Dashboard
                        </Link>
                        <Link href="/admin/users" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <User className="h-4 w-4 mr-3 text-red-500" />
                            User Management
                        </Link>
                        <Link href="/admin/disputes" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <MessageSquare className="h-4 w-4 mr-3 text-red-500" />
                            Disputes
                        </Link>
                    </div>
                )}

                {/* Buying & Selling */}
                <div className="py-2 border-t border-gray-100">
                    <div className="px-4 py-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buying & Selling</p>
                    </div>
                    <Link href="/account/transactions" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <FileText className="h-4 w-4 mr-3 text-gray-400" />
                        Transaction History
                    </Link>
                    <Link href="/account/refunds" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Package className="h-4 w-4 mr-3 text-gray-400" />
                        Refunds & Returns
                    </Link>
                    <Link href="/account/disputes" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Shield className="h-4 w-4 mr-3 text-gray-400" />
                        Disputes
                    </Link>
                    <Link href="/account/addresses" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                        Address Book
                    </Link>
                    <Link href="/account/payment-methods" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <CreditCard className="h-4 w-4 mr-3 text-gray-400" />
                        Payment Methods
                    </Link>
                </div>

                {/* Settings & Support */}
                <div className="py-2 border-t border-gray-100">
                    <div className="px-4 py-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Support</p>
                    </div>
                    <Link href="/account/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Account Settings
                    </Link>
                    <Link href="/help" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <HelpCircle className="h-4 w-4 mr-3 text-gray-400" />
                        Help & Support
                    </Link>
                </div>

                {/* Logout */}
                <div className="py-2 border-t border-gray-100">
                    <button
                        onClick={auth?.logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}