export default function PressPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Press Center</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest News</h2>

                        <div className="space-y-6">
                            <article className="border-b border-gray-200 pb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    InstaSell Launches Advanced Auction Platform
                                </h3>
                                <p className="text-gray-600 text-sm mb-3">December 13, 2024</p>
                                <p className="text-gray-700">
                                    InstaSell today announced the launch of its revolutionary real-time auction
                                    platform, featuring advanced bidding mechanics and comprehensive seller tools.
                                </p>
                            </article>

                            <article className="border-b border-gray-200 pb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    New Payment Integration Enhances User Experience
                                </h3>
                                <p className="text-gray-600 text-sm mb-3">December 10, 2024</p>
                                <p className="text-gray-700">
                                    The marketplace now supports multiple payment methods including UPI,
                                    digital wallets, and enhanced security features for safer transactions.
                                </p>
                            </article>

                            <article className="border-b border-gray-200 pb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    InstaSell Reaches 1 Million Active Users
                                </h3>
                                <p className="text-gray-600 text-sm mb-3">December 5, 2024</p>
                                <p className="text-gray-700">
                                    The platform celebrates a major milestone with over 1 million active users
                                    and $100 million in total transaction volume.
                                </p>
                            </article>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Kit</h2>
                            <p className="text-gray-700 mb-4">
                                Download our media kit for logos, brand guidelines, and company information.
                            </p>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Download Media Kit
                            </button>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Contact</h2>
                            <p className="text-gray-700">
                                For press inquiries, please contact:<br />
                                Email: press@instasell.com<br />
                                Phone: (555) 123-4567
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}