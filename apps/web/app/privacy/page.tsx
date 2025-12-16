export default function PrivacyPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <p className="text-gray-600 mb-6">Last updated: December 13, 2024</p>

                        <div className="space-y-8 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                                <p className="mb-4">We collect information you provide directly to us, such as when you:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Create an account or update your profile</li>
                                    <li>Make a purchase or list an item for sale</li>
                                    <li>Communicate with us or other users</li>
                                    <li>Participate in surveys or promotions</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                                <p className="mb-4">We use the information we collect to:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Provide, maintain, and improve our services</li>
                                    <li>Process transactions and send related information</li>
                                    <li>Send technical notices and support messages</li>
                                    <li>Communicate about products, services, and events</li>
                                    <li>Monitor and analyze trends and usage</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                                <p className="mb-4">We may share your information in the following situations:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>With your consent or at your direction</li>
                                    <li>With service providers who assist our operations</li>
                                    <li>For legal reasons or to protect rights and safety</li>
                                    <li>In connection with a business transfer</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                                <p className="mb-4">You have the right to:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Access and update your personal information</li>
                                    <li>Delete your account and personal data</li>
                                    <li>Opt out of marketing communications</li>
                                    <li>Request data portability</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                                <p className="mt-2">
                                    Email: privacy@instasell.com<br />
                                    Address: 123 Privacy Street, San Francisco, CA 94105
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}