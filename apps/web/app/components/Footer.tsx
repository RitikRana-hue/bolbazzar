'use client';

import Link from 'next/link';
import { Facebook, Twitter, Youtube, Gavel } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-200 mt-12">
            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 text-sm">
                    <div>
                        <h3 className="font-bold mb-6 text-blue-700 text-base">🛒 Buy</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/signup" className="hover:text-blue-600 transition-colors font-medium">Registration</Link></li>
                            <li><Link href="/help" className="hover:text-blue-600 transition-colors">Bidding & buying help</Link></li>
                            <li><Link href="/auctions" className="hover:text-blue-600 transition-colors">Live Auctions</Link></li>
                            <li><Link href="/daily-deals" className="hover:text-blue-600 transition-colors">Daily Deals</Link></li>
                            <li><Link href="/watchlist" className="hover:text-blue-600 transition-colors">Watchlist</Link></li>
                            <li><Link href="/advanced-search" className="hover:text-blue-600 transition-colors">Advanced Search</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 text-blue-700 text-base">💼 Sell</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/sell" className="hover:underline hover:text-blue-600">Start selling</Link></li>
                            <li><Link href="/account/subscription" className="hover:underline hover:text-blue-600">Seller subscriptions</Link></li>
                            <li><Link href="/account/dashboard" className="hover:underline hover:text-blue-600">Seller dashboard</Link></li>
                            <li><Link href="/account/listings" className="hover:underline hover:text-blue-600">Manage listings</Link></li>
                            <li><Link href="/account/gas-wallet" className="hover:underline hover:text-blue-600">Gas wallet</Link></li>
                            <li><Link href="/account/payouts" className="hover:underline hover:text-blue-600">Seller earnings</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 text-blue-700 text-base">👤 Account</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/account" className="hover:underline hover:text-blue-600">My account</Link></li>
                            <li><Link href="/account/orders" className="hover:underline hover:text-blue-600">Purchase history</Link></li>
                            <li><Link href="/account/bids" className="hover:underline hover:text-blue-600">My bids</Link></li>
                            <li><Link href="/account/wallet" className="hover:underline hover:text-blue-600">Wallet</Link></li>
                            <li><Link href="/account/addresses" className="hover:underline hover:text-blue-600">Addresses</Link></li>
                            <li><Link href="/account/payment-methods" className="hover:underline hover:text-blue-600">Payment methods</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 text-blue-700 text-base">📂 Categories</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/category/electronics" className="hover:underline hover:text-blue-600">Electronics</Link></li>
                            <li><Link href="/category/fashion" className="hover:underline hover:text-blue-600">Fashion</Link></li>
                            <li><Link href="/category/home-garden" className="hover:underline hover:text-blue-600">Home & Garden</Link></li>
                            <li><Link href="/category/collectibles" className="hover:underline hover:text-blue-600">Collectibles</Link></li>
                            <li><Link href="/category/vehicles" className="hover:underline hover:text-blue-600">Vehicles</Link></li>
                            <li><Link href="/all-categories" className="hover:underline hover:text-blue-600">All categories</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 text-blue-700 text-base">🛠️ Support</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/help" className="hover:underline hover:text-blue-600">Help center</Link></li>
                            <li><Link href="/messages" className="hover:underline hover:text-blue-600">Contact seller</Link></li>
                            <li><Link href="/account/disputes" className="hover:underline hover:text-blue-600">Resolution center</Link></li>
                            <li><Link href="/account/refunds" className="hover:underline hover:text-blue-600">Returns & refunds</Link></li>
                            <li><Link href="/notifications" className="hover:underline hover:text-blue-600">Notifications</Link></li>
                            <li><Link href="/account/channels" className="hover:underline hover:text-blue-600">Saved channels</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-6 text-blue-700 text-base">🏢 InstaSell</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li><Link href="/about" className="hover:underline hover:text-blue-600">About us</Link></li>
                            <li><Link href="/careers" className="hover:underline hover:text-blue-600">Careers</Link></li>
                            <li><Link href="/press" className="hover:underline hover:text-blue-600">Press center</Link></li>
                            <li><Link href="/policies" className="hover:underline hover:text-blue-600">Policies</Link></li>
                            <li><Link href="/security" className="hover:underline hover:text-blue-600">Security center</Link></li>
                            <li><Link href="/developers" className="hover:underline hover:text-blue-600">Developers</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Social Media & Newsletter */}
                <div className="border-t border-gray-200 pt-10 mt-10">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-8 mb-6 md:mb-0">
                            <div className="flex items-center group">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Gavel className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    InstaSell
                                </span>
                            </div>
                            <div className="flex space-x-4">
                                <Link href="#" className="text-gray-400 hover:text-blue-600 transition-all duration-300 p-2 rounded-full hover:bg-blue-50">
                                    <Facebook size={24} />
                                </Link>
                                <Link href="#" className="text-gray-400 hover:text-blue-600 transition-all duration-300 p-2 rounded-full hover:bg-blue-50">
                                    <Twitter size={24} />
                                </Link>
                                <Link href="#" className="text-gray-400 hover:text-pink-600 transition-all duration-300 p-2 rounded-full hover:bg-pink-50">
                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">IG</div>
                                </Link>
                                <Link href="#" className="text-gray-400 hover:text-red-600 transition-all duration-300 p-2 rounded-full hover:bg-red-50">
                                    <Youtube size={24} />
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700 font-medium">📧 Stay updated:</span>
                            <div className="flex shadow-lg rounded-xl overflow-hidden">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="px-4 py-3 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-64"
                                />
                                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 py-6 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
                        <p className="mb-4 md:mb-0 font-medium">
                            © 2024 InstaSell Inc. All Rights Reserved.
                            <span className="ml-2 text-blue-600">Made with ❤️ for sellers and buyers worldwide</span>
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <Link href="/privacy" className="hover:text-blue-600 transition-colors font-medium">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-blue-600 transition-colors font-medium">Terms of Service</Link>
                            <Link href="/cookies" className="hover:text-blue-600 transition-colors font-medium">Cookie Policy</Link>
                            <Link href="/accessibility" className="hover:text-blue-600 transition-colors font-medium">Accessibility</Link>
                            <Link href="/sitemap" className="hover:text-blue-600 transition-colors font-medium">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
