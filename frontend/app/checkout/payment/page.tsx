'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    CreditCard,
    Smartphone,
    Building,
    Wallet,
    Shield,
    CheckCircle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface PaymentMethod {
    id: string;
    type: 'card' | 'upi' | 'netbanking' | 'wallet';
    name: string;
    description: string;
    icon: React.ReactNode;
    fees?: string;
    processingTime?: string;
}

interface Order {
    id: string;
    total: number;
    items: any[];
    shippingAddress: any;
}

function PaymentContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    const [order, setOrder] = useState<Order | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string>('card');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);

    // Payment form states
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    const paymentMethods: PaymentMethod[] = [
        {
            id: 'card',
            type: 'card',
            name: 'Credit/Debit Card',
            description: 'Visa, Mastercard, American Express',
            icon: <CreditCard className="h-6 w-6" />,
            fees: 'No additional fees',
            processingTime: 'Instant'
        },
        {
            id: 'upi',
            type: 'upi',
            name: 'UPI',
            description: 'Pay using any UPI app',
            icon: <Smartphone className="h-6 w-6" />,
            fees: 'No additional fees',
            processingTime: 'Instant'
        },
        {
            id: 'netbanking',
            type: 'netbanking',
            name: 'Net Banking',
            description: 'Pay directly from your bank account',
            icon: <Building className="h-6 w-6" />,
            fees: 'Bank charges may apply',
            processingTime: '2-5 minutes'
        },
        {
            id: 'wallet',
            type: 'wallet',
            name: 'InstaSell Wallet',
            description: `Available balance: $${walletBalance.toFixed(2)}`,
            icon: <Wallet className="h-6 w-6" />,
            fees: 'No fees',
            processingTime: 'Instant'
        }
    ];

    const banks = [
        { code: 'sbi', name: 'State Bank of India' },
        { code: 'hdfc', name: 'HDFC Bank' },
        { code: 'icici', name: 'ICICI Bank' },
        { code: 'axis', name: 'Axis Bank' },
        { code: 'kotak', name: 'Kotak Mahindra Bank' },
        { code: 'pnb', name: 'Punjab National Bank' }
    ];

    useEffect(() => {
        if (orderId) {
            fetchOrder();
            fetchWalletBalance();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            // Mock data - replace with actual API call
            const mockOrder: Order = {
                id: orderId || 'ORD-12345',
                total: 1199.99,
                items: [
                    {
                        id: '1',
                        title: 'iPhone 15 Pro Max 256GB',
                        price: 1199.99,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=100'
                    }
                ],
                shippingAddress: {
                    name: 'John Doe',
                    street: '123 Main Street',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94102'
                }
            };

            setOrder(mockOrder);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            // Mock wallet balance
            setWalletBalance(250.00);
        } catch (error) {
            console.error('Failed to fetch wallet balance:', error);
        }
    };

    const processPayment = async () => {
        if (!order) return;

        setProcessing(true);

        try {
            let paymentData;

            switch (selectedMethod) {
                case 'card':
                    paymentData = await processCardPayment();
                    break;
                case 'upi':
                    paymentData = await processUPIPayment();
                    break;
                case 'netbanking':
                    paymentData = await processNetBankingPayment();
                    break;
                case 'wallet':
                    paymentData = await processWalletPayment();
                    break;
                default:
                    throw new Error('Invalid payment method');
            }

            // Redirect to confirmation page
            window.location.href = `/checkout/confirmation?order=${order.id}&payment=${paymentData.paymentId}`;
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const processCardPayment = async () => {
        // In real implementation, use Stripe Elements
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/card/create-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: order!.id,
                amount: order!.total
            })
        });

        return await response.json();
    };

    const processUPIPayment = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/upi/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: order!.id,
                amount: order!.total,
                upiId
            })
        });

        return await response.json();
    };

    const processNetBankingPayment = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/netbanking/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: order!.id,
                amount: order!.total,
                bankCode: selectedBank
            })
        });

        return await response.json();
    };

    const processWalletPayment = async () => {
        // Mock wallet payment
        return {
            paymentId: `wallet_${Date.now()}`,
            status: 'completed'
        };
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
                    <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
                    <p className="text-gray-500">
                        We couldn't find the order you're trying to pay for.
                    </p>
                    <Link href="/cart" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Cart
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link href="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Cart
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
                <p className="text-gray-600">Choose your preferred payment method</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Methods */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>

                        {/* Payment Method Selection */}
                        <div className="space-y-4 mb-6">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedMethod === method.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setSelectedMethod(method.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
                                            {method.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{method.name}</h3>
                                            <p className="text-sm text-gray-600">{method.description}</p>
                                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                <span>{method.fees}</span>
                                                <span>•</span>
                                                <span>{method.processingTime}</span>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === method.id
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300'
                                            }`}>
                                            {selectedMethod === method.id && (
                                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Form */}
                        <div className="border-t border-gray-200 pt-6">
                            {selectedMethod === 'card' && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">Card Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                value={cardDetails.number}
                                                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                value={cardDetails.cvv}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cardholder Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={cardDetails.name}
                                                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'upi' && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">UPI Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            UPI ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="yourname@paytm"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter your UPI ID (e.g., yourname@paytm, yourname@gpay)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'netbanking' && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">Select Your Bank</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {banks.map((bank) => (
                                            <div
                                                key={bank.code}
                                                className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedBank === bank.code
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setSelectedBank(bank.code)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${selectedBank === bank.code
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-gray-300'
                                                        }`}>
                                                        {selectedBank === bank.code && (
                                                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {bank.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedMethod === 'wallet' && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">Wallet Payment</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-900">
                                                    Available Balance: ${walletBalance.toFixed(2)}
                                                </p>
                                                <p className="text-sm text-green-700">
                                                    {walletBalance >= order.total
                                                        ? 'Sufficient balance for this purchase'
                                                        : `Need $${(order.total - walletBalance).toFixed(2)} more`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {walletBalance < order.total && (
                                        <Link
                                            href="/account/wallet"
                                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            Top up your wallet →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    {/* Order Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-gray-900">
                                        ${item.price.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
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
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-base font-medium text-gray-900">Total</span>
                                    <span className="text-base font-medium text-gray-900">
                                        ${order.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Secure Payment</h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    Your payment information is encrypted and secure. We never store your card details.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={processPayment}
                        disabled={processing || (selectedMethod === 'wallet' && walletBalance < order.total)}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </div>
                        ) : (
                            `Pay $${order.total.toFixed(2)}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <PaymentContent />
        </Suspense>
    );
}