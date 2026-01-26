export default function CookiesPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <p className="text-gray-600 mb-6">Last updated: December 13, 2024</p>

                        <div className="space-y-8 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies</h2>
                                <p>Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                                        <p>These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Cookies</h3>
                                        <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                                        <p>These cookies enable the website to provide enhanced functionality and personalization, such as remembering your login details and preferences.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                                        <p>These cookies are used to deliver advertisements more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
                                <p className="mb-4">You can control and manage cookies in various ways:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Browser settings: Most browsers allow you to refuse cookies or delete existing ones</li>
                                    <li>Cookie preferences: Use our cookie preference center to customize your settings</li>
                                    <li>Opt-out tools: Use industry opt-out tools for marketing cookies</li>
                                </ul>
                                <p className="mt-4">Please note that disabling certain cookies may affect the functionality of our website.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
                                <p>We may use third-party services that place cookies on your device. These include:</p>
                                <ul className="list-disc list-inside space-y-2 mt-4">
                                    <li>Google Analytics for website analytics</li>
                                    <li>Payment processors for secure transactions</li>
                                    <li>Social media platforms for sharing functionality</li>
                                    <li>Advertising networks for targeted ads</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                                <p>We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated revision date.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                                <p>If you have any questions about our use of cookies, please contact us at:</p>
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