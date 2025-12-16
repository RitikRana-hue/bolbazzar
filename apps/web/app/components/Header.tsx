'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Search,
    ShoppingCart,
    ChevronDown,
    Heart,
    Bell,
    MessageSquare,
    User,
    Menu,
    X,
    Gavel,
    Plus,
    Package,
    CreditCard,
    Shield,
    HelpCircle,
    Zap,
    Star
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { categories } from '../data/categories';
import ProfileDropdown from './ProfileDropdown';
import { NotificationIcon } from './ui/NotificationBadge';

export default function Header() {
    const auth = useContext(AuthContext);
    const [isCategoryOpen, setCategoryOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    // Get user from auth context
    const user = auth?.user;
    const isAuthenticated = !!user;

    // Type-safe property access with defaults
    const userCartItems = user?.cartItems || 0;
    const userNotifications = user?.notifications || 0;
    const userRole = user?.role || 'buyer';
    const userIsAdmin = user?.role === 'admin';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/advanced-search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Top Bar */}
                <div className="flex justify-between items-center text-xs text-gray-600 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center gap-6">
                        <span className="font-medium">Hi! {isAuthenticated ? (
                            <span className="text-blue-600">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.name || user.email
                                }
                                (<button onClick={auth?.logout} className="text-red-600 hover:underline font-medium">Logout</button>)
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

                {/* Main Header */}
                <div className="flex items-center gap-8 py-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Gavel className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            InstaSell
                        </h1>
                    </Link>

                    {/* Shop by Category Dropdown */}
                    <div className="hidden lg:block relative" onMouseEnter={() => setCategoryOpen(true)} onMouseLeave={() => setCategoryOpen(false)}>
                        <button className="flex items-center gap-1 text-sm text-gray-800 hover:text-blue-600">
                            <span>Shop by category</span>
                            <ChevronDown size={16} />
                        </button>
                        {isCategoryOpen && (
                            <div className="absolute top-full left-0 w-[800px] bg-white border border-gray-200 shadow-lg p-6 grid grid-cols-3 gap-6 z-10">
                                {Object.entries(categories).map(([mainCategory, subCategories]) => (
                                    <div key={mainCategory}>
                                        <h3 className="font-bold mb-2 text-blue-600">{mainCategory}</h3>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            {subCategories.map(sub => (
                                                <li key={sub}>
                                                    <Link
                                                        href={`/category/${sub.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                                                        className="hover:underline hover:text-blue-600"
                                                    >
                                                        {sub}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                <div className="col-span-3 border-t border-gray-200 pt-4 mt-4">
                                    <Link href="/all-categories" className="font-bold text-blue-600 hover:underline">
                                        All Categories &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-grow flex items-center border-2 border-blue-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                        <div className="p-3">
                            <Search size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 outline-none text-sm placeholder-gray-400 font-medium"
                        />
                        <select className="text-sm text-gray-600 border-l border-gray-200 px-4 py-3 bg-gray-50 outline-none hover:bg-gray-100 transition-colors">
                            <option>All Categories</option>
                            <option>Electronics</option>
                            <option>Fashion</option>
                            <option>Home & Garden</option>
                            <option>Collectibles</option>
                            <option>Vehicles</option>
                            <option>Sports</option>
                        </select>
                        <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-3 text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg">
                            Search
                        </button>
                    </form>

                    <Link href="/advanced-search" className="hidden lg:block text-xs text-gray-600 hover:underline">
                        Advanced
                    </Link>

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
                <div className="hidden md:flex justify-center items-center gap-8 text-sm py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mx-4 mb-2">
                    <Link href="/" className="font-bold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                        Home
                    </Link>
                    <Link href="/saved" className="flex items-center gap-1 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                        <Heart size={16} /> Saved
                    </Link>
                    <Link href="/category/electronics" className="hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                        Electronics
                    </Link>
                    <Link href="/category/fashion" className="hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                        Fashion
                    </Link>
                    <Link href="/category/collectibles" className="hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                        Collectibles
                    </Link>
                    <Link href="/category/sports" className="hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                        Sports
                    </Link>
                    <Link href="/category/home-garden" className="hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-200">
                        Home & Garden
                    </Link>
                    <Link href="/auctions" className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium px-3 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 transition-all duration-200">
                        <Gavel size={16} /> Live Auctions
                    </Link>
                    <Link href="/offers" className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 transition-all duration-200">
                        <Zap size={16} /> Flash Sales
                    </Link>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-4">
                        <div className="space-y-4">
                            {/* User Section */}
                            {isAuthenticated && (
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user.firstName && user.lastName
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : user.name || user.email
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
                                    <Link href="/auctions" className="flex items-center text-purple-600 hover:text-purple-700">
                                        <Gavel className="h-4 w-4 mr-2" />
                                        Live Auctions
                                    </Link>
                                    <Link href="/offers" className="flex items-center text-orange-600 hover:text-orange-700">
                                        <Zap className="h-4 w-4 mr-2" />
                                        Flash Sales
                                    </Link>
                                    <Link href="/daily-deals" className="flex items-center text-green-600 hover:text-green-700">
                                        <Star className="h-4 w-4 mr-2" />
                                        Daily Deals
                                    </Link>
                                </div>
                            </div>

                            {/* Seller Tools */}
                            {userRole === 'seller' && (
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
