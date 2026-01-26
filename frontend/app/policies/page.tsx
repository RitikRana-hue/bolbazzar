export default function PoliciesPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Policies</h1>

                    <div className="space-y-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Selling Policies</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>All sellers must comply with our marketplace standards:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Accurate item descriptions and photos</li>
                                    <li>Prompt shipping and communication</li>
                                    <li>No prohibited or restricted items</li>
                                    <li>Compliance with local and international laws</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Buying Policies</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>Buyers are protected under our comprehensive policies:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Money-back guarantee for eligible purchases</li>
                                    <li>Dispute resolution process</li>
                                    <li>Secure payment processing</li>
                                    <li>Return and refund protections</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Items</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>The following items are not allowed on InstaSell:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Illegal or stolen goods</li>
                                    <li>Weapons and dangerous items</li>
                                    <li>Counterfeit or replica items</li>
                                    <li>Adult content and services</li>
                                    <li>Live animals</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction Policies</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>Special rules apply to auction listings:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Bids are binding commitments to purchase</li>
                                    <li>Auction extensions for last-minute bids</li>
                                    <li>Reserve price requirements</li>
                                    <li>Seller cancellation restrictions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}