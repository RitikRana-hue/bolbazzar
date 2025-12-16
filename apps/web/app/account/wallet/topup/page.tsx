'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CreditCard,
    Smartphone,
    Building,
    ArrowLeft,
    Plus,
    Shield,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface TopUpMethod {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    fees: string;
    minAmount: number;
}

export default function WalletTopUpPage() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<string>('card');
    const [amount, setAmount] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    // Payment form states
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    const topUpMethods: TopUpMethod[] = [
        {
            id: 'card',
            name: 'Credit/Debit Card',
            description: 'Instant top-up with any card',
            icon: <CreditCard className="h-6 w-6" />,
            fees: 'No fees',
            minAmount: 10
        },
        {
            id: 'upi',
            name: 'UPI',
            description: 'Pay using any UPI app',
            icon: <Smartphone className="h-6 w-6" />,
            fees: 'No fees',
            minAmount: 10
        },
        {
            id: 'netbanking',
            name: 'Net Banking',
            description: 'Direct bank transfer',
            icon: <Building className="h-6 w-6" />,
            fees: 'Bank charges may apply',
            minAmount: 10
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

    const quickAmounts = [10, 25, 50, 100, 250, 500];

    const handleTopUp = async () => {
        if (!amount || parseFloat(amount) < 10) {
            alert('Minimum top-up amount is $10');
            return;
        }

        setProcessing(true);

        try {
            let paymentDetails: any = {};

            switch (selectedMethod) {
                case 'card':
                    paymentDetails = cardDetails;
                    break;
                case 'upi':
                    paymentDetails = { upiId };
                    break;
                case 'netbanking':
                    paymentDetails = { bankCode: selectedBank };
                    break;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/wallet/topup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    paymentMethod: selectedMethod,
                    paymentDetails
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Handle successful top-up
                if (result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                } else {
                    router.push('/account/wallet?success=topup');
                }
            } else {
                throw new Error(result.error || 'Top-up failed');
            }
        } catch (error) {
            console.error('Top-up failed:', error);
            alert('Top-up failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link href="/account/wallet" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Wallet
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Top Up Wallet</h1>
                <p className="text-gray-600">Add money to your InstaSell wallet</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top-up Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Amount Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Amount</h2>

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {quickAmounts.map((quickAmount) => (
                                <button
                                    key={quickAmount}
                                    onClick={() => setAmount(quickAmount.toString())}
                                    className={`p-3 border rounded-lg text-center transition-colors ${amount === quickAmount.toString()
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    ${quickAmount}
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Or enter custom amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    min="10"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum amount: $10</p>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

                        <div className="space-y-3 mb-6">
                            {topUpMethods.map((method) => (
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
                                            <p className="text-xs text-gray-500">{method.fees}</p>
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

                        {/* Payment Details Form */}
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
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    {/* Top-up Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top-up Summary</h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount</span>
                                <span className="font-medium text-gray-900">
                                    ${amount || '0.00'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Processing Fee</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-base font-medium text-gray-900">Total</span>
                                    <span className="text-base font-medium text-gray-900">
                                        ${amount || '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleTopUp}
                            disabled={processing || !amount || parseFloat(amount) < 10}
                            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add ${amount || '0.00'}
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Secure Top-up</h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    Your payment is protected by bank-level security. Funds are instantly available.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-green-900 mb-2">Wallet Benefits</h3>
                        <ul className="text-xs text-green-700 space-y-1">
                            <li className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Instant payments
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2" />
                                No transaction fees
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Faster checkout
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Secure storage
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}