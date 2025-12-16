'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    MessageCircle,
    Phone,
    Mail,
    ChevronRight,
    ChevronDown,
    HelpCircle,
    Shield,
    CreditCard,
    Package,
    Gavel,
    Truck,
    AlertCircle
} from 'lucide-react';

const faqCategories = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: HelpCircle,
        faqs: [
            {
                question: 'How do I create an account?',
                answer: 'Click "Sign Up" in the top right corner, fill in your details, and verify your email address. You can choose to be a buyer, seller, or both.'
            },
            {
                question: 'Is InstaSell free to use?',
                answer: 'Creating an account and browsing is free. Sellers pay small fees for auction listings and premium features. Buyers pay no fees.'
            },
            {
                question: 'How do I start selling?',
                answer: 'After creating an account, go to "Sell" and choose between direct listings or auctions. You\'ll need to top up your gas wallet for auction fees.'
            }
        ]
    },
    {
        id: 'buying',
        title: 'Buying & Bidding',
        icon: Package,
        faqs: [
            {
                question: 'How do auctions work?',
                answer: 'Place bids on items you want. The highest bidder when the auction ends wins. Auctions auto-extend by 5 minutes if bids are placed in the last 5 minutes.'
            },
            {
                question: 'What is the escrow system?',
                answer: 'Your payment is held securely for 7 days after purchase. Money is released to the seller after successful delivery confirmation.'
            },
            {
                question: 'Can I return items?',
                answer: 'Returns depend on the seller\'s policy. You can open disputes for items not as described or damaged during shipping.'
            }
        ]
    },
    {
        id: 'selling',
        title: 'Selling',
        icon: Gavel,
        faqs: [
            {
                question: 'What is the gas wallet?',
                answer: 'The gas wallet is used to pay for auction listing fees and premium features. Top it up before creating auction listings.'
            },
            {
                question: 'How do I get paid?',
                answer: 'Payments are held in escrow and released to your wallet after successful delivery. You can withdraw funds to your bank account.'
            },
            {
                question: 'What are the selling fees?',
                answer: 'Direct listings are free. Auction listings cost $2.50 from your gas wallet. Premium subscriptions offer reduced fees and extra features.'
            }
        ]
    },
    {
        id: 'payments',
        title: 'Payments & Wallet',
        icon: CreditCard,
        faqs: [
            {
                question: 'What payment methods are accepted?',
                answer: 'We accept credit/debit cards, UPI, net banking, and wallet payments. All payments are processed securely.'
            },
            {
                question: 'How does the wallet work?',
                answer: 'Your wallet stores funds for purchases and receives payments from sales. You can top up with various payment methods and withdraw to your bank.'
            },
            {
                question: 'When are refunds processed?',
                answer: 'Refunds are processed within 5-7 business days to your original payment method or wallet, depending on the payment type.'
            }
        ]
    },
    {
        id: 'delivery',
        title: 'Shipping & Delivery',
        icon: Truck,
        faqs: [
            {
                question: 'How does delivery work?',
                answer: 'Our delivery partners handle shipping with real-time tracking. Expensive items require open-box verification and digital signatures.'
            },
            {
                question: 'What if my item is damaged?',
                answer: 'Report damage immediately through the delivery tracking page. Our agents document condition with photos for insurance claims.'
            },
            {
                question: 'Can I track my order?',
                answer: 'Yes! You\'ll receive tracking information and can monitor your order\'s progress in real-time through your account.'
            }
        ]
    },
    {
        id: 'safety',
        title: 'Safety & Security',
        icon: Shield,
        faqs: [
            {
                question: 'How do you protect buyers?',
                answer: 'We use escrow payments, verified delivery, dispute resolution, and seller ratings to ensure safe transactions.'
            },
            {
                question: 'What if I have a dispute?',
                answer: 'Open a dispute through your order page. Our team mediates between buyers and sellers to reach fair resolutions.'
            },
            {
                question: 'How do you verify sellers?',
                answer: 'Sellers build reputation through ratings and reviews. We monitor for suspicious activity and have verification processes for high-value items.'
            }
        ]
    }
];

const contactOptions = [
    {
        title: 'Live Chat',
        description: 'Chat with our support team',
        icon: MessageCircle,
        action: 'Start Chat',
        available: '24/7',
        color: 'blue'
    },
    {
        title: 'Phone Support',
        description: 'Call us for immediate help',
        icon: Phone,
        action: '1-800-INSTASELL',
        available: 'Mon-Fri 9AM-6PM',
        color: 'green'
    },
    {
        title: 'Email Support',
        description: 'Send us a detailed message',
        icon: Mail,
        action: 'support@instasell.com',
        available: 'Response within 24h',
        color: 'purple'
    }
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredFaqs = faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.faqs.length > 0);

    const toggleFaq = (faqId: string) => {
        setOpenFaq(openFaq === faqId ? null : faqId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">How can we help you?</h1>
                    <p className="text-xl text-blue-100 mb-8">
                        Find answers to common questions or get in touch with our support team
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-xl shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {contactOptions.map((option) => (
                        <div key={option.title} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className={`w-12 h-12 bg-${option.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                                <option.icon className={`h-6 w-6 text-${option.color}-600`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                            <p className="text-gray-600 mb-4">{option.description}</p>
                            <div className="flex items-center justify-between">
                                <span className={`text-${option.color}-600 font-medium`}>{option.action}</span>
                                <span className="text-sm text-gray-500">{option.available}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Categories */}
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Category Sidebar */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
                        <div className="space-y-2">
                            {faqCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(
                                        selectedCategory === category.id ? null : category.id
                                    )}
                                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${selectedCategory === category.id
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <category.icon className="h-5 w-5 mr-3" />
                                    <span className="font-medium">{category.title}</span>
                                    <ChevronRight className="h-4 w-4 ml-auto" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Content */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
                        </h2>

                        {filteredFaqs.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                                <p className="text-gray-600">
                                    Try adjusting your search terms or browse by category
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {filteredFaqs.map((category) => (
                                    <div key={category.id} className={
                                        selectedCategory && selectedCategory !== category.id ? 'hidden' : ''
                                    }>
                                        <div className="flex items-center mb-4">
                                            <category.icon className="h-6 w-6 text-blue-600 mr-3" />
                                            <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {category.faqs.map((faq, index) => {
                                                const faqId = `${category.id}-${index}`;
                                                return (
                                                    <div key={faqId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                                        <button
                                                            onClick={() => toggleFaq(faqId)}
                                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                                        >
                                                            <span className="font-medium text-gray-900 pr-4">
                                                                {faq.question}
                                                            </span>
                                                            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openFaq === faqId ? 'rotate-180' : ''
                                                                }`} />
                                                        </button>
                                                        {openFaq === faqId && (
                                                            <div className="px-4 pb-4">
                                                                <p className="text-gray-600 leading-relaxed">
                                                                    {faq.answer}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Resources */}
                <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
                        <p className="text-gray-600">
                            Our support team is here to help you with any questions or issues
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Link href="/account/disputes" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <AlertCircle className="h-6 w-6 text-orange-600 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Report an Issue</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Having problems with an order or seller? Open a dispute for resolution.
                            </p>
                            <span className="text-orange-600 font-medium">Open Dispute →</span>
                        </Link>

                        <Link href="/messages" className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center mb-4">
                                <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-900">Contact Seller</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Have questions about a specific item? Message the seller directly.
                            </p>
                            <span className="text-blue-600 font-medium">Send Message →</span>
                        </Link>
                    </div>
                </div>

                {/* Popular Articles */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Help Articles</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'How to Win Auctions', category: 'Bidding Tips', readTime: '3 min' },
                            { title: 'Seller Success Guide', category: 'Selling', readTime: '5 min' },
                            { title: 'Payment Security', category: 'Safety', readTime: '2 min' },
                            { title: 'Delivery Tracking', category: 'Shipping', readTime: '2 min' },
                            { title: 'Dispute Resolution', category: 'Support', readTime: '4 min' },
                            { title: 'Account Settings', category: 'Account', readTime: '3 min' }
                        ].map((article, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {article.category}
                                    </span>
                                    <span className="text-xs text-gray-500">{article.readTime} read</span>
                                </div>
                                <h3 className="font-medium text-gray-900 mb-2">{article.title}</h3>
                                <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Read Article →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}