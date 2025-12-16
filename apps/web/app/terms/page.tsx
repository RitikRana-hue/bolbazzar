export default function TermsPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <p className="text-gray-600 mb-6">Last updated: December 13, 2024</p>

                        <div className="space-y-8 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
                                <p>By accessing and using InstaSell, you accept and agree to be bound by the terms and provision of this agreement.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
                                <p className="mb-4">When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Safeguarding your account password</li>
                                    <li>All activities that occur under your account</li>
                                    <li>Notifying us immediately of any unauthorized use</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketplace Rules</h2>
                                <p className="mb-4">All users must comply with our marketplace policies:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Provide accurate item descriptions and photos</li>
                                    <li>Honor all sale commitments and auction bids</li>
                                    <li>Communicate respectfully with other users</li>
                                    <li>Pay all applicable fees and taxes</li>
                                    <li>Comply with all applicable laws and regulations</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
                                <p className="mb-4">You may not:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>List prohibited or illegal items</li>
                                    <li>Manipulate prices or engage in fraudulent activity</li>
                                    <li>Interfere with the proper functioning of the platform</li>
                                    <li>Violate intellectual property rights</li>
                                    <li>Harass or abuse other users</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Fees and Payments</h2>
                                <p>InstaSell charges fees for certain services. All fees are clearly disclosed before you incur them. Payment processing is handled by secure third-party providers.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                                <p>InstaSell shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
                                <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                                <p>Questions about the Terms of Service should be sent to us at:</p>
                                <p className="mt-2">
                                    Email: legal@instasell.com<br />
                                    Address: 123 Legal Street, San Francisco, CA 94105
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}