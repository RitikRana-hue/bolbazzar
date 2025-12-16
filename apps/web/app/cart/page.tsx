'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, Heart, ShoppingBag, Truck, Shield, ArrowRight } from 'lucide-react';

interface CartItem {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    seller: string;
    quantity: number;
    shipping: number;
    condition: string;
    inStock: boolean;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockItems: CartItem[] = [
                {
                    id: '1',
                    title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
                    price: 1199.99,
                    originalPrice: 1299.99,
                    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=300&h=300&fit=crop',
                    seller: 'TechStore Pro',
                    quantity: 1,
                    shipping: 0,
                    condition: 'New',
                    inStock: true
                },
                {
                    id: '2',
                    title: 'Samsung Galaxy S24 Ultra 512GB',
                    price: 999.99,
                    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
                    seller: 'Galaxy Store',
                    quantity: 1,
                    shipping: 9.99,
                    condition: 'New',
                    inStock: true
                },
                {
                    id: '3',
                    title: 'Apple Watch Series 9 GPS 45mm',
                    price: 329.99,
                    originalPrice: 429.99,
                    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop',
                    seller: 'Apple Store',
                    quantity: 2,
                    shipping: 0,
                    condition: 'New',
                    inStock: false
                }
            ];

            setCartItems(mockItems);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
            setLoading(false);
        }
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (itemId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const moveToWatchlist = (itemId: string) => {
        // Add to watchlist logic here
        removeItem(itemId);
    };

    const applyPromoCode = () => {
        // Mock promo code logic
        if (promoCode.toLowerCase() === 'save10') {
            setPromoDiscount(0.10);
        } else if (promoCode.toLowerCase() === 'welcome20') {
            setPromoDiscount(0.20);
        } else {
            setPromoDiscount(0);
            alert('Invalid promo code');
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalShipping = cartItems.reduce((sum, item) => sum + item.shipping, 0);
    const discountAmount = subtotal * promoDiscount;
    const total = subtotal + totalShipping - discountAmount;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 py-8">
            <div className="max-w-screen-xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">
                            Looks like you haven't added anything to your cart yet
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                                </h2>

                                <div className="space-y-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />

                                            <div className="flex-1">
                                                <Link
                                                    href={`/p/${item.id}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                                                >
                                                    {item.title}
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1">by {item.seller}</p>
                                                <p className="text-sm text-gray-600">Condition: {item.condition}</p>

                                                {!item.inStock && (
                                                    <p className="text-sm text-red-600 font-medium mt-1">
                                                        Currently out of stock
                                                    </p>
                                                )}

                                                <div className="flex items-center space-x-4 mt-3">
                                                    <button
                                                        onClick={() => moveToWatchlist(item.id)}
                                                        className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                                                    >
                                                        <Heart className="h-4 w-4 mr-1" />
                                                        Move to watchlist
                                                    </button>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="flex items-center text-sm text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ${item.price.toFixed(2)}
                                                    </span>
                                                    {item.originalPrice && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ${item.originalPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>

                                                {item.shipping > 0 && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        + ${item.shipping.toFixed(2)} shipping
                                                    </p>
                                                )}

                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-gray-50 disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-gray-50"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="font-medium text-gray-900 mb-4">Promo Code</h3>
                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Enter promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={applyPromoCode}
                                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoDiscount > 0 && (
                                    <p className="text-sm text-green-600 mt-2">
                                        Promo code applied! {(promoDiscount * 100).toFixed(0)}% discount
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">
                                            {totalShipping === 0 ? 'Free' : `$${totalShipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    {promoDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({(promoDiscount * 100).toFixed(0)}%)</span>
                                            <span>-${discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <Link
                                    href="/checkout"
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Link>

                                {/* Security & Shipping Info */}
                                <div className="mt-6 space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Shield className="h-4 w-4 mr-2 text-green-600" />
                                        <span>Secure checkout with SSL encryption</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Truck className="h-4 w-4 mr-2 text-blue-600" />
                                        <span>Free shipping on orders over $50</span>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-3">We accept:</p>
                                    <div className="flex space-x-2">
                                        <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                            VISA
                                        </div>
                                        <div className="w-10 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                            MC
                                        </div>
                                        <div className="w-10 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                                            AMEX
                                        </div>
                                        <div className="w-10 h-6 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
                                            PP
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recently Viewed */}
                {cartItems.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <img
                                        src={`https://images.unsplash.com/photo-${1550009158 + i}-94ae76552485?w=300&h=200&fit=crop`}
                                        alt="Recommended product"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                            Recommended Product {i}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-900">$99.99</p>
                                        <button className="w-full mt-3 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}