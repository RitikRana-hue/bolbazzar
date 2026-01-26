'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Truck, Shield, Check, MapPin } from 'lucide-react';

interface CheckoutStep {
    id: string;
    title: string;
    completed: boolean;
}

export default function CheckoutPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [shippingMethod, setShippingMethod] = useState('standard');

    const steps: CheckoutStep[] = [
        { id: 'shipping', title: 'Shipping Address', completed: currentStep > 1 },
        { id: 'payment', title: 'Payment Method', completed: currentStep > 2 },
        { id: 'review', title: 'Review Order', completed: false }
    ];

    const orderItems = [
        {
            id: '1',
            title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
            price: 1199.99,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=100&h=100&fit=crop',
            seller: 'TechStore Pro'
        },
        {
            id: '2',
            title: 'Samsung Galaxy S24 Ultra 512GB',
            price: 999.99,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&h=100&fit=crop',
            seller: 'Galaxy Store'
        }
    ];

    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePlaceOrder = () => {
        // Process order logic here
        window.location.href = '/checkout/confirmation';
    };

    return (
        <main className="bg-gray-50 py-8">
            <div className="max-w-screen-xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link
                        href="/cart"
                        className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Back to Cart
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step.completed
                                        ? 'bg-green-600 border-green-600 text-white'
                                        : currentStep === index + 1
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-500'
                                    }`}>
                                    {step.completed ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <span className={`ml-3 font-medium ${step.completed || currentStep === index + 1
                                        ? 'text-gray-900'
                                        : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-4 ${step.completed ? 'bg-green-600' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Shipping Address */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-6">
                                    <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                                    <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                                </div>

                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="New York"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State
                                            </label>
                                            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>Select State</option>
                                                <option>New York</option>
                                                <option>California</option>
                                                <option>Texas</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="10001"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="save-address"
                                            className="mr-2"
                                        />
                                        <label htmlFor="save-address" className="text-sm text-gray-700">
                                            Save this address for future orders
                                        </label>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center mb-6">
                                    <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                                    <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="card"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="card" className="flex items-center cursor-pointer">
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            Credit/Debit Card
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="paypal"
                                            name="payment"
                                            value="paypal"
                                            checked={paymentMethod === 'paypal'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="paypal" className="cursor-pointer">
                                            PayPal
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="wallet"
                                            name="payment"
                                            value="wallet"
                                            checked={paymentMethod === 'wallet'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="wallet" className="cursor-pointer">
                                            InstaSell Wallet ($156.78 available)
                                        </label>
                                    </div>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="1234 5678 9012 3456"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expiry Date
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    CVV
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cardholder Name
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Shipping Method */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="standard"
                                                    name="shipping"
                                                    value="standard"
                                                    checked={shippingMethod === 'standard'}
                                                    onChange={(e) => setShippingMethod(e.target.value)}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <label htmlFor="standard" className="font-medium cursor-pointer">
                                                        Standard Shipping
                                                    </label>
                                                    <p className="text-sm text-gray-600">5-7 business days</p>
                                                </div>
                                            </div>
                                            <span className="font-medium">$9.99</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="express"
                                                    name="shipping"
                                                    value="express"
                                                    checked={shippingMethod === 'express'}
                                                    onChange={(e) => setShippingMethod(e.target.value)}
                                                    className="mr-3"
                                                />
                                                <div>
                                                    <label htmlFor="express" className="font-medium cursor-pointer">
                                                        Express Shipping
                                                    </label>
                                                    <p className="text-sm text-gray-600">2-3 business days</p>
                                                </div>
                                            </div>
                                            <span className="font-medium">$19.99</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Order */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>

                                {/* Order Items */}
                                <div className="space-y-4 mb-6">
                                    {orderItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.title}</h3>
                                                <p className="text-sm text-gray-600">by {item.seller}</p>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="font-medium">${item.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping & Payment Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                                        <div className="text-sm text-gray-600">
                                            <p>John Doe</p>
                                            <p>123 Main Street</p>
                                            <p>New York, NY 10001</p>
                                            <p>(555) 123-4567</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                                        <div className="text-sm text-gray-600">
                                            <p>Credit Card ending in 3456</p>
                                            <p>Standard Shipping (5-7 days)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start space-x-3 mb-6">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="mt-1"
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-700">
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-blue-600 hover:underline">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="text-blue-600 hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handlePreviousStep}
                                className={`px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${currentStep === 1 ? 'invisible' : ''
                                    }`}
                            >
                                Previous
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNextStep}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    onClick={handlePlaceOrder}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Place Order
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
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
                                    <span className="font-medium">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Info */}
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                                    <span>Secure checkout with SSL encryption</span>
                                </div>
                                <div className="flex items-center">
                                    <Truck className="h-4 w-4 mr-2 text-blue-600" />
                                    <span>Free returns within 30 days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}