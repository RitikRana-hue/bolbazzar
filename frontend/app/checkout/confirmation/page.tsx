'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle,
    Package,
    Truck,
    MessageSquare,
    Download,
    Calendar,
    MapPin,
    CreditCard,
    Star
} from 'lucide-react';

interface OrderConfirmation {
    orderId: string;
    status: string;
    total: number;
    estimatedDelivery: string;
    trackingNumber?: string;
    items: {
        id: string;
        title: string;
        image: string;
        price: number;
        quantity: number;
        seller: string;
    }[];
    shippingAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    paymentMethod: {
        type: string;
        last4?: string;
        brand?: string;
    };
}

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');
    const [order, setOrder] = useState<OrderConfirmation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrderConfirmation();
        }
    }, [orderId]);

    const fetchOrderConfirmation = async () => {
        try {
            // Mock data - replace with actual API call
            const mockOrder: OrderConfirmation = {
                orderId: orderId || 'ORD-12345',
                status: 'confirmed',
                total: 1199.99,
                estimatedDelivery: '2024-01-18T00:00:00Z',
                trackingNumber: '1Z999AA1234567890',
                items: [
                    {
                        id: '1',
                        title: 'iPhone 15 Pro Max 256GB - Space Black',
                        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=200',
                        price: 1199.99,
                        quantity: 1,
                        seller: 'TechStore Inc'
                    }
                ],
                shippingAddress: {
                    name: 'John Doe',
                    street: '123 Main Street, Apt 4B',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94102'
                },
                paymentMethod: {
                    type: 'card',
                    last4: '4242',
                    brand: 'visa'
                }
            };

            setOrder(mockOrder);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch order confirmation:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
                    <p className="text-gray-500">
                        We couldn't find the order confirmation you're looking for.
                    </p>
                    <Link href="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-lg text-gray-600">
                    Thank you for your purchase. Your order has been confirmed and is being processed.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Order #{order.orderId}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500">Sold by {item.seller}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                            <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Shipping Address</p>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <p>{order.shippingAddress.name}</p>
                                        <p>{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Estimated Delivery</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {order.trackingNumber && (
                                <div className="flex items-start space-x-3">
                                    <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Tracking Number</p>
                                        <p className="text-sm text-gray-600 mt-1 font-mono">
                                            {order.trackingNumber}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                        <div className="flex items-start space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">Payment Method</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {order.paymentMethod.brand?.toUpperCase()} ending in {order.paymentMethod.last4}
                                </p>
                                <p className="text-sm text-green-600 mt-1">✓ Payment successful</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">${order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="text-gray-900">$0.00</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-base font-medium text-gray-900">Total</span>
                                    <span className="text-base font-medium text-gray-900">${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href={`/delivery/${order.orderId}`}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Truck className="h-4 w-4 mr-2" />
                                Track Order
                            </Link>

                            <Link
                                href={`/messages?order=${order.orderId}`}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Contact Seller
                            </Link>

                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                            </button>
                        </div>
                    </div>

                    {/* What's Next */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-sm font-medium text-blue-900 mb-3">What happens next?</h3>
                        <div className="space-y-3 text-sm text-blue-700">
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">1</span>
                                <span>We'll send you an email confirmation</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">2</span>
                                <span>Your order will be prepared for shipping</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">3</span>
                                <span>You'll receive tracking information once shipped</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">4</span>
                                <span>Your order will be delivered within the estimated timeframe</span>
                            </div>
                        </div>
                    </div>

                    {/* Review Reminder */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start space-x-3">
                            <Star className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-yellow-900">Leave a Review</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    After you receive your order, don't forget to leave a review to help other buyers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Continue Shopping */}
            <div className="text-center mt-8">
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}