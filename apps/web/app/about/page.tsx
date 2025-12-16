export default function AboutPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">About InstaSell</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            InstaSell is a modern marketplace platform that connects buyers and sellers worldwide.
                            We provide a secure, user-friendly environment for trading everything from electronics
                            to collectibles, with advanced features like real-time auctions and comprehensive
                            buyer protection.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            To create the world's most trusted and innovative marketplace where anyone can buy
                            and sell with confidence. We believe in empowering individuals and businesses to
                            reach their full potential through commerce.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose InstaSell?</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                            <li>Secure payment processing with buyer protection</li>
                            <li>Real-time auction system with advanced bidding features</li>
                            <li>Comprehensive seller tools and analytics</li>
                            <li>24/7 customer support and dispute resolution</li>
                            <li>Mobile-optimized experience across all devices</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}