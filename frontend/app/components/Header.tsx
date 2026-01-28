'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Search,
    ChevronDown,
    ShoppingCart,
    Heart,
    Bell,
    MessageSquare,
    User,
    Menu,
    X,
    Plus,
    Package,
    CreditCard,
    Shield,
    HelpCircle,
    Zap,
    Star
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import ProfileDropdown from './ProfileDropdown';
import { NotificationIcon } from './ui/NotificationBadge';
import { categories } from '../data/categories';

export default function Header() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // Type-safe property access with defaults
    const userCartItems = 0; // TODO: Get from cart store
    const userNotifications = 0; // TODO: Get from notifications store
    const userRole = user?.role || 'BUYER';
    const userIsAdmin = user?.role === 'ADMIN';

    const handleSearch = () => {
        if (searchQuery.trim()) {
            const categoryParam = selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
            window.location.href = `/advanced-search?q=${encodeURIComponent(searchQuery)}${categoryParam}`;
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
        };

        if (isProfileOpen || isCategoryDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen, isCategoryDropdownOpen]);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="w-full px-2">
                {/* Top Bar */}
                <div className="flex justify-between items-center text-xs text-gray-600 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center gap-6">
                        <span className="font-medium">Hi! {isAuthenticated && user ? (
                            <span className="text-blue-600">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username || user.email
                                }
                                (<button onClick={logout} className="text-red-600 hover:underline font-medium">Logout</button>)
                            </span>
                        ) : (
                            <><Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link> or <Link href="/signup" className="text-blue-600 hover:underline font-medium">register</Link></>
                        )}</span>
                        <Link href="/daily-deals" className="hover:text-blue-600 transition-colors flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            <Zap className="h-3 w-3 mr-1" />
                            Daily Deals
                        </Link>
                        <Link href="/help" className="hover:text-blue-600 transition-colors flex items-center">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Help & Contact
                        </Link>
                    </div>

                    {/* Search Bar in Top Bar */}
                    <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
                        <div className="flex items-stretch bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 w-full">
                            {/* Category Dropdown */}
                            <div
                                ref={categoryDropdownRef}
                                className="relative"
                            >
                                <div
                                    onClick={() => {
                                        console.log('Category dropdown clicked, current state:', isCategoryDropdownOpen);
                                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                                    }}
                                    className="flex items-center px-3 py-2 text-xs text-gray-600 border-r border-gray-300 hover:bg-gray-50 transition-colors min-w-[80px] justify-between cursor-pointer"
                                >
                                    <span className="truncate">{selectedCategory}</span>
                                    <ChevronDown size={12} className={`ml-1 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isCategoryDropdownOpen && (
                                    <div className="absolute top-full left-0 z-[9999] mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                        <div className="py-1">
                                            <div className="px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50">
                                                DEBUG: Dropdown is open!
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setSelectedCategory('All');
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                                All Categories
                                            </div>
                                            {Object.entries(categories).map(([mainCategory, subCategories]) => (
                                                <div key={mainCategory}>
                                                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                                                        {mainCategory}
                                                    </div>
                                                    {subCategories.map(sub => (
                                                        <div
                                                            key={sub}
                                                            onClick={() => {
                                                                setSelectedCategory(sub);
                                                                setIsCategoryDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left px-6 py-1 text-xs text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                                        >
                                                            {sub}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center pl-3 pr-2">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 py-2 px-1 outline-none text-sm placeholder-gray-500 bg-transparent"
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 text-white px-3 py-2 text-xs font-medium hover:bg-blue-700 transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/sell" className="hover:text-blue-600 transition-colors flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                            <Plus className="h-3 w-3 mr-1" />
                            Sell
                        </Link>
                        <Link href="/watchlist" className="hover:text-blue-600 transition-colors flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            Watchlist
                        </Link>
                        <Link href="/messages" className="hover:text-blue-600 transition-colors flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Messages
                        </Link>
                        <Link href="/notifications" className="hover:text-blue-600 transition-colors flex items-center">
                            <Bell className="h-3 w-3 mr-1" />
                            Notifications
                        </Link>
                        <div
                            ref={profileDropdownRef}
                            className="relative"
                            onMouseEnter={() => setProfileOpen(true)}
                            onMouseLeave={() => setProfileOpen(false)}
                        >
                            <button
                                onClick={() => setProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
                            >
                                <User className="h-3 w-3" />
                                <span>My InstaSell</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isProfileOpen && (
                                <div
                                    className="absolute right-0 top-full z-[9999]"
                                    onMouseEnter={() => setProfileOpen(true)}
                                    onMouseLeave={() => setProfileOpen(false)}
                                >
                                    {isAuthenticated ? <ProfileDropdown /> : (
                                        <div className="mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-4">
                                            {/* Invisible bridge to prevent hover gap */}
                                            <div className="absolute -top-2 right-0 w-full h-2 bg-transparent"></div>
                                            <div className="px-4 text-center">
                                                <p className="text-sm text-gray-600 mb-4">Sign in to access your account</p>
                                                <div className="space-y-2">
                                                    <Link href="/login" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                                        Sign In
                                                    </Link>
                                                    <Link href="/signup" className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                                        Create Account
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <Link href="/cart" className="relative hover:scale-110 transition-transform">
                            <div className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                                <ShoppingCart size={18} className="text-blue-600" />
                                {userCartItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                                        {userCartItems}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-1"
                    >
                        {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Main Header - Simplified */}
                <div className="flex items-center justify-end py-4 px-4 gap-6">
                    {/* Right Side Actions Only */}

                    {/* Mobile Actions */}
                    <div className="md:hidden flex items-center gap-2">
                        {isAuthenticated && (
                            <>
                                <NotificationIcon
                                    icon={<Bell className="h-5 w-5" />}
                                    count={userNotifications}
                                    onClick={() => window.location.href = '/notifications'}
                                    className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer"
                                />
                                <NotificationIcon
                                    icon={<ShoppingCart className="h-5 w-5" />}
                                    count={userCartItems}
                                    onClick={() => window.location.href = '/cart'}
                                    className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer"
                                />
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!isProfileOpen)}
                                        className="p-1 text-gray-600 hover:text-blue-600 cursor-pointer"
                                    >
                                        <User className="h-5 w-5" />
                                    </button>
                                    {isProfileOpen && (
                                        <div className="absolute right-0 top-full mt-2 z-50">
                                            <ProfileDropdown />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Secondary Navigation */}
                <div className="hidden md:flex justify-center items-center gap-1 text-sm py-2 bg-white border-t border-gray-100">
                    <Link href="/" className="font-medium text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                        Home
                    </Link>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-4">
                        <div className="space-y-4">
                            {/* User Section */}
                            {isAuthenticated && user && (
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={`${user.firstName || 'User'} avatar`} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user.firstName && user.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user.username || user.email
                                                }
                                            </p>
                                            <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <Link href="/account" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                            <User className="h-4 w-4 mr-2" />
                                            Account
                                        </Link>
                                        <Link href="/account/orders" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                            <Package className="h-4 w-4 mr-2" />
                                            Orders
                                        </Link>
                                        <Link href="/account/wallet" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Wallet
                                        </Link>
                                        <Link href="/messages" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Messages
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <Link href="/category/electronics" className="text-gray-600 hover:text-blue-600">Electronics</Link>
                                    <Link href="/category/fashion" className="text-gray-600 hover:text-blue-600">Fashion</Link>
                                    <Link href="/category/home-garden" className="text-gray-600 hover:text-blue-600">Home & Garden</Link>
                                    <Link href="/category/collectibles" className="text-gray-600 hover:text-blue-600">Collectibles</Link>
                                    <Link href="/category/vehicles" className="text-gray-600 hover:text-blue-600">Vehicles</Link>
                                    <Link href="/category/sports" className="text-gray-600 hover:text-blue-600">Sports</Link>
                                </div>
                            </div>

                            {/* Special Sections */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="space-y-2">
                                    <Link href="/daily-deals" className="flex items-center text-green-600 hover:text-green-700">
                                        <Star className="h-4 w-4 mr-2" />
                                        Daily Deals
                                    </Link>
                                </div>
                            </div>

                            {/* Seller Tools */}
                            {userRole === 'SELLER' && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-medium text-gray-900 mb-2">Seller Tools</h3>
                                    <div className="space-y-2 text-sm">
                                        <Link href="/account/dashboard" className="flex items-center text-gray-600 hover:text-blue-600">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Dashboard
                                        </Link>
                                        <Link href="/account/listings" className="flex items-center text-gray-600 hover:text-blue-600">
                                            <Package className="h-4 w-4 mr-2" />
                                            My Listings
                                        </Link>
                                        <Link href="/account/gas-wallet" className="flex items-center text-gray-600 hover:text-blue-600">
                                            <Zap className="h-4 w-4 mr-2" />
                                            Gas Wallet
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Admin Tools */}
                            {userIsAdmin && (
                                <div className="border-t border-gray-200 pt-4">
                                    <Link href="/admin" className="flex items-center text-red-600 hover:text-red-700">
                                        <Shield className="h-4 w-4 mr-2" />
                                        Admin Dashboard
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
