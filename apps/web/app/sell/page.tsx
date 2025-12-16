'use client';

// import { useState } from 'react';
import Link from 'next/link';
import {
    Package,
    Gavel,
    Camera,
    DollarSign,
    Users,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Star,
    Zap,
    Shield
} from 'lucide-react';

export default function SellPage() {
    // const [, setListingType] = useState<'direct' | 'auction'>('direct');

    const benefits = [
        {
            icon: DollarSign,
            title: 'Maximize Your Earnings',
            description: 'Get the best prices for your items with our competitive marketplace',
            color: 'text-green-600 bg-green-100'
        },
        {
            icon: Users,
            title: 'Reach Millions of Buyers',
            description: 'Connect with buyers from around the world looking for your items',
            color: 'text-blue-600 bg-blue-100'
        },
        {
            icon: Shield,
            title: 'Secure Transactions',
            description: 'Protected payments and secure escrow system for peace of mind',
            color: 'text-purple-600 bg-purple-100'
        },
        {
            icon: TrendingUp,
            title: 'Seller Analytics',
            description: 'Track your performance with detailed insights and analytics',
            color: 'text-orange-600 bg-orange-100'
        }
    ];

    const sellingSteps = [
        {
            step: 1,
            title: 'Create Your Listing',
            description: 'Add photos, write a description, and set your price',
            icon: Camera
        },
        {
            step: 2,
            title: 'Choose Selling Method',
            description: 'Sell directly or create an auction for competitive bidding',
            icon: Gavel
        },
        {
            step: 3,
            title: 'Manage Orders',
            description: 'Process orders, communicate with buyers, and ship items',
            icon: Package
        },
        {
            step: 4,
            title: 'Get Paid',
            description: 'Receive payments securely through our escrow system',
            icon: DollarSign
        }
    ];

    const pricingPlans = [
        {
            name: 'Basic',
            price: 'Free',
            description: 'Perfect for occasional sellers',
            features: [
                'Up to 10 active listings',
                '5% final value fee',
                'Basic seller tools',
                'Standard support'
            ],
            buttonText: 'Start Selling Free',
            popular: false
        },
        {
            name: 'Premium',
            price: '$19.99/month',
            description: 'Best for regular sellers',
            features: [
                'Up to 100 active listings',
                '3% final value fee',
                'Advanced seller tools',
                'Priority support',
                'Seller analytics',
                'Promoted listings'
            ],
            buttonText: 'Upgrade to Premium',
            popular: true
        },
        {
            name: 'Enterprise',
            price: '$49.99/month',
            description: 'For high-volume sellers',
            features: [
                'Unlimited listings',
                '2% final value fee',
                'Full seller suite',
                'Dedicated support',
                'Advanced analytics',
                'API access',
                'Bulk tools'
            ],
            buttonText: 'Contact Sales',
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl font-bold mb-6 leading-tight">
                                Turn Your Items Into
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Cash</span>
                            </h1>
                            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                Join millions of sellers on InstaSell. List your items for free and reach buyers worldwide with our powerful selling platform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/sell/create"
                                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <Package className="h-5 w-5 mr-2" />
                                    Start Selling Now
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Link>
                                <Link
                                    href="/sell/auction"
                                    className="inline-flex items-center px-8 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Gavel className="h-5 w-5 mr-2" />
                                    Create Auction
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">2.5M+</div>
                                        <div className="text-blue-200 text-sm">Active Buyers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">$50M+</div>
                                        <div className="text-blue-200 text-sm">Items Sold</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">4.8★</div>
                                        <div className="text-blue-200 text-sm">Seller Rating</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-2">24/7</div>
                                        <div className="text-blue-200 text-sm">Support</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Benefits Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Sell on InstaSell?</h2>
                        <p className="text-xl text-gray-600">Join thousands of successful sellers and grow your business</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className={`w-12 h-12 rounded-lg ${benefit.color} flex items-center justify-center mb-4`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                    <p className="text-gray-600">{benefit.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* How It Works */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600">Get started in just a few simple steps</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {sellingSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className="relative">
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center mb-4">
                                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                                {step.step}
                                            </div>
                                            <Icon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                                        <p className="text-gray-600">{step.description}</p>
                                    </div>
                                    {index < sellingSteps.length - 1 && (
                                        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                            <ArrowRight className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selling Options */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Selling Method</h2>
                        <p className="text-xl text-gray-600">Pick the best way to sell your items</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                    <Package className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Direct Sale</h3>
                                    <p className="text-gray-600">Set a fixed price and sell immediately</p>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    Quick and easy setup
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    Immediate purchase option
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    No auction fees
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                    Predictable pricing
                                </li>
                            </ul>
                            <Link
                                href="/sell/create?type=direct"
                                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                                Create Direct Listing
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                    <Gavel className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Auction</h3>
                                    <p className="text-gray-600">Let buyers compete for your item</p>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                                    Potentially higher prices
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                                    Competitive bidding
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                                    Reserve price protection
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                                    Auto-extension feature
                                </li>
                            </ul>
                            <Link
                                href="/sell/create?type=auction"
                                className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                            >
                                Create Auction
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Pricing Plans */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Seller Plans</h2>
                        <p className="text-xl text-gray-600">Choose the plan that fits your selling needs</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <div key={index} className={`bg-white rounded-xl p-8 shadow-sm border-2 ${plan.popular ? 'border-blue-500 relative' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                                            <Star className="h-4 w-4 mr-1" />
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">{plan.price}</div>
                                    <p className="text-gray-600">{plan.description}</p>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.popular
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}>
                                    {plan.buttonText}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
                    <p className="text-xl text-blue-100 mb-8">Join thousands of successful sellers and turn your items into cash today</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/sell/create"
                            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <Package className="h-5 w-5 mr-2" />
                            Create Your First Listing
                        </Link>
                        <Link
                            href="/account/subscription"
                            className="inline-flex items-center px-8 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all duration-300 border-2 border-white/20"
                        >
                            <Zap className="h-5 w-5 mr-2" />
                            View Seller Plans
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}