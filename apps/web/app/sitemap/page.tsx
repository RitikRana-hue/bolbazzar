import Link from 'next/link';

export default function SitemapPage() {
    const sitePages = {
        'Main Pages': [
            { name: 'Home', url: '/' },
            { name: 'All Categories', url: '/all-categories' },
            { name: 'Advanced Search', url: '/advanced-search' },
            { name: 'Daily Deals', url: '/daily-deals' },
            { name: 'Live Auctions', url: '/auctions' },
            { name: 'Flash Sales', url: '/offers' },
            { name: 'Help Center', url: '/help' },
        ],
        'User Account': [
            { name: 'Sign Up', url: '/signup' },
            { name: 'Login', url: '/login' },
            { name: 'Account Dashboard', url: '/account' },
            { name: 'Profile', url: '/account/profile' },
            { name: 'Orders', url: '/account/orders' },
            { name: 'Bids', url: '/account/bids' },
            { name: 'Wallet', url: '/account/wallet' },
            { name: 'Addresses', url: '/account/addresses' },
            { name: 'Payment Methods', url: '/account/payment-methods' },
            { name: 'Disputes', url: '/account/disputes' },
            { name: 'Transactions', url: '/account/transactions' },
            { name: 'Refunds', url: '/account/refunds' },
        ],
        'Seller Tools': [
            { name: 'Start Selling', url: '/sell' },
            { name: 'Seller Dashboard', url: '/account/dashboard' },
            { name: 'My Listings', url: '/account/listings' },
            { name: 'Gas Wallet', url: '/account/gas-wallet' },
            { name: 'Seller Payouts', url: '/account/payouts' },
            { name: 'Subscription Plans', url: '/account/subscription' },
            { name: 'Seller Reviews', url: '/account/reviews' },
            { name: 'Seller Points', url: '/account/points' },
        ],
        'Shopping': [
            { name: 'Watchlist', url: '/watchlist' },
            { name: 'Saved Items', url: '/saved' },
            { name: 'Shopping Cart', url: '/cart' },
            { name: 'Checkout', url: '/checkout' },
            { name: 'Messages', url: '/messages' },
            { name: 'Notifications', url: '/notifications' },
        ],
        'Categories': [
            { name: 'Electronics', url: '/category/electronics' },
            { name: 'Fashion', url: '/category/fashion' },
            { name: 'Home & Garden', url: '/category/home-garden' },
            { name: 'Collectibles', url: '/category/collectibles' },
            { name: 'Vehicles', url: '/category/vehicles' },
            { name: 'Sports', url: '/category/sports' },
        ],
        'Admin Panel': [
            { name: 'Admin Dashboard', url: '/admin' },
            { name: 'User Management', url: '/admin/users' },
            { name: 'Dispute Management', url: '/admin/disputes' },
            { name: 'Analytics', url: '/admin/analytics' },
        ],
        'Company': [
            { name: 'About Us', url: '/about' },
            { name: 'Careers', url: '/careers' },
            { name: 'Press Center', url: '/press' },
            { name: 'Security Center', url: '/security' },
            { name: 'Developer Center', url: '/developers' },
        ],
        'Legal': [
            { name: 'Terms of Service', url: '/terms' },
            { name: 'Privacy Policy', url: '/privacy' },
            { name: 'Cookie Policy', url: '/cookies' },
            { name: 'Accessibility', url: '/accessibility' },
            { name: 'Policies', url: '/policies' },
        ],
    };

    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Sitemap</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                        <p className="text-gray-700 mb-6">
                            Find all pages and sections of the InstaSell marketplace. Use this sitemap to navigate
                            to any part of our platform quickly and easily.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Object.entries(sitePages).map(([section, pages]) => (
                                <div key={section} className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                                        {section}
                                    </h2>
                                    <ul className="space-y-2">
                                        {pages.map((page) => (
                                            <li key={page.url}>
                                                <Link
                                                    href={page.url}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                                >
                                                    {page.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h2 className="text-lg font-bold text-blue-900 mb-2">Need Help Finding Something?</h2>
                        <p className="text-blue-800 mb-4">
                            Can't find what you're looking for? Try our search function or contact our support team.
                        </p>
                        <div className="flex space-x-4">
                            <Link
                                href="/advanced-search"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Advanced Search
                            </Link>
                            <Link
                                href="/help"
                                className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Help Center
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}