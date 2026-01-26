'use client';

import { useState, useEffect } from 'react';
import {
    Check,
    X,
    CreditCard,
    Calendar,
    TrendingUp,
    Gavel
} from 'lucide-react';

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    billingPeriod: 'monthly' | 'yearly';
    features: string[];
    auctionCredits: number;
    listingFeeDiscount: number;
    priority: boolean;
    analytics: boolean;
    support: 'basic' | 'priority' | 'dedicated';
    popular?: boolean;
}

interface CurrentSubscription {
    planId: string;
    planName: string;
    status: 'active' | 'cancelled' | 'expired';
    nextBillingDate: string;
    auctionCreditsUsed: number;
    auctionCreditsTotal: number;
}

export default function SubscriptionPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            // Mock data - replace with actual API calls
            const mockPlans: SubscriptionPlan[] = [
                {
                    id: 'basic',
                    name: 'Basic',
                    price: 0,
                    billingPeriod: 'monthly',
                    features: [
                        'Up to 10 direct listings',
                        '5 auction credits per month',
                        'Basic analytics',
                        'Email support'
                    ],
                    auctionCredits: 5,
                    listingFeeDiscount: 0,
                    priority: false,
                    analytics: false,
                    support: 'basic'
                },
                {
                    id: 'pro',
                    name: 'Pro',
                    price: billingPeriod === 'monthly' ? 29.99 : 299.99,
                    billingPeriod: billingPeriod,
                    features: [
                        'Unlimited direct listings',
                        '50 auction credits per month',
                        'Advanced analytics & insights',
                        'Priority listing placement',
                        '10% listing fee discount',
                        'Priority email support'
                    ],
                    auctionCredits: 50,
                    listingFeeDiscount: 10,
                    priority: true,
                    analytics: true,
                    support: 'priority',
                    popular: true
                },
                {
                    id: 'enterprise',
                    name: 'Enterprise',
                    price: billingPeriod === 'monthly' ? 99.99 : 999.99,
                    billingPeriod: billingPeriod,
                    features: [
                        'Unlimited direct listings',
                        '200 auction credits per month',
                        'Advanced analytics & insights',
                        'Priority listing placement',
                        '20% listing fee discount',
                        'Dedicated account manager',
                        'Custom branding options',
                        'API access'
                    ],
                    auctionCredits: 200,
                    listingFeeDiscount: 20,
                    priority: true,
                    analytics: true,
                    support: 'dedicated'
                }
            ];

            const mockCurrentSubscription: CurrentSubscription = {
                planId: 'pro',
                planName: 'Pro',
                status: 'active',
                nextBillingDate: '2024-02-15T00:00:00Z',
                auctionCreditsUsed: 23,
                auctionCreditsTotal: 50
            };

            setPlans(mockPlans);
            setCurrentSubscription(mockCurrentSubscription);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch subscription data:', error);
            setLoading(false);
        }
    };

    const upgradePlan = async (planId: string) => {
        try {
            console.log('Upgrading to plan:', planId);
            // TODO: Implement Stripe checkout or payment flow
        } catch (error) {
            console.error('Failed to upgrade plan:', error);
        }
    };

    const cancelSubscription = async () => {
        try {
            if (currentSubscription) {
                setCurrentSubscription({
                    ...currentSubscription,
                    status: 'cancelled'
                });
            }
            // TODO: API call to cancel subscription
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
        }
    };

    const getSupportBadge = (support: string) => {
        switch (support) {
            case 'basic':
                return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Basic Support</span>;
            case 'priority':
                return <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Priority Support</span>;
            case 'dedicated':
                return <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Dedicated Manager</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Seller Subscription Plans</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Choose the perfect plan to grow your business. Get more auction credits,
                    advanced analytics, and priority support.
                </p>
            </div>

            {/* Current Subscription Status */}
            {currentSubscription && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-2xl font-bold text-blue-600">
                                    {currentSubscription.planName}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentSubscription.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : currentSubscription.status === 'cancelled'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {currentSubscription.status}
                                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-600">Next billing date</p>
                            <p className="font-medium">
                                {new Date(currentSubscription.nextBillingDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Auction Credits Usage */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Auction Credits</span>
                            <span className="text-sm text-gray-600">
                                {currentSubscription.auctionCreditsUsed} / {currentSubscription.auctionCreditsTotal} used
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                    width: `${(currentSubscription.auctionCreditsUsed / currentSubscription.auctionCreditsTotal) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Period Toggle */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'monthly'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingPeriod('yearly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${billingPeriod === 'yearly'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Yearly
                        <span className="ml-1 text-xs bg-green-100 text-green-600 px-1 rounded">Save 17%</span>
                    </button>
                </div>
            </div>

            {/* Subscription Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white rounded-lg shadow-lg overflow-hidden relative ${plan.popular ? 'ring-2 ring-blue-500' : ''
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        <div className="p-6">
                            {/* Plan Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold text-gray-900 mb-1">
                                    ${plan.price}
                                    <span className="text-lg font-normal text-gray-600">
                                        /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                                {billingPeriod === 'yearly' && plan.price > 0 && (
                                    <p className="text-sm text-green-600">
                                        Save ${((plan.price / 10) * 2).toFixed(2)} per year
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Key Stats */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="flex items-center justify-center mb-1">
                                            <Gavel className="h-4 w-4 text-purple-500 mr-1" />
                                            <span className="text-xs text-gray-600">Auction Credits</span>
                                        </div>
                                        <p className="font-bold text-gray-900">{plan.auctionCredits}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-center mb-1">
                                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                            <span className="text-xs text-gray-600">Fee Discount</span>
                                        </div>
                                        <p className="font-bold text-gray-900">{plan.listingFeeDiscount}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Support Badge */}
                            <div className="text-center mb-6">
                                {getSupportBadge(plan.support)}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => upgradePlan(plan.id)}
                                disabled={currentSubscription?.planId === plan.id}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${currentSubscription?.planId === plan.id
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                            >
                                {currentSubscription?.planId === plan.id
                                    ? 'Current Plan'
                                    : plan.price === 0
                                        ? 'Downgrade to Basic'
                                        : 'Upgrade Plan'
                                }
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Actions */}
            {currentSubscription && currentSubscription.status === 'active' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Update Payment Method
                        </button>

                        <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Billing History
                        </button>

                        <button
                            onClick={cancelSubscription}
                            className="flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">What are auction credits?</h4>
                        <p className="text-sm text-gray-600">
                            Auction credits are used to create auction listings. Each auction listing consumes one credit.
                            Credits reset monthly based on your subscription plan.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
                        <p className="text-sm text-gray-600">
                            Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately,
                            and billing is prorated accordingly.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">What happens if I exceed my credits?</h4>
                        <p className="text-sm text-gray-600">
                            You can purchase additional auction credits or upgrade to a higher plan.
                            Direct listings are unlimited on Pro and Enterprise plans.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                        <p className="text-sm text-gray-600">
                            New sellers get 14 days free on any paid plan. No credit card required to start.
                            Cancel anytime during the trial period.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}