export default function SecurityPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Security Center</h1>

                    <div className="space-y-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Security</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>Protect your InstaSell account with these security measures:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Use a strong, unique password</li>
                                    <li>Enable two-factor authentication</li>
                                    <li>Regularly review account activity</li>
                                    <li>Keep your contact information updated</li>
                                    <li>Log out from shared devices</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Security</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>Your financial information is protected by:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>SSL encryption for all transactions</li>
                                    <li>PCI DSS compliance</li>
                                    <li>Secure payment processing partners</li>
                                    <li>Fraud detection systems</li>
                                    <li>Buyer protection programs</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Safe Trading Tips</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>Follow these guidelines for safe trading:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Only communicate through InstaSell messaging</li>
                                    <li>Use our secure payment system</li>
                                    <li>Verify seller ratings and reviews</li>
                                    <li>Report suspicious activity immediately</li>
                                    <li>Never share personal financial information</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Security Issues</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>If you encounter any security concerns:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Contact our security team immediately</li>
                                    <li>Email: security@instasell.com</li>
                                    <li>Phone: (555) 123-SAFE</li>
                                    <li>Use our secure reporting form</li>
                                </ul>
                                <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors mt-4">
                                    Report Security Issue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}