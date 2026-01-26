export default function DevelopersPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Developer Center</h1>

                    <div className="space-y-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">InstaSell API</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>Build powerful integrations with the InstaSell marketplace:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>RESTful API with comprehensive endpoints</li>
                                    <li>Real-time webhooks for instant updates</li>
                                    <li>Secure authentication with API keys</li>
                                    <li>Rate limiting and usage analytics</li>
                                    <li>Sandbox environment for testing</li>
                                </ul>
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Get API Access
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentation</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-900 mb-2">API Reference</h3>
                                    <p className="text-gray-600 text-sm mb-3">Complete API documentation with examples</p>
                                    <a href="#" className="text-blue-600 hover:underline">View Documentation →</a>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-900 mb-2">SDKs & Libraries</h3>
                                    <p className="text-gray-600 text-sm mb-3">Official SDKs for popular programming languages</p>
                                    <a href="#" className="text-blue-600 hover:underline">Download SDKs →</a>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-900 mb-2">Code Examples</h3>
                                    <p className="text-gray-600 text-sm mb-3">Sample code and integration tutorials</p>
                                    <a href="#" className="text-blue-600 hover:underline">Browse Examples →</a>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-bold text-gray-900 mb-2">Webhooks Guide</h3>
                                    <p className="text-gray-600 text-sm mb-3">Set up real-time event notifications</p>
                                    <a href="#" className="text-blue-600 hover:underline">Setup Webhooks →</a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Developer Tools</h2>
                            <div className="space-y-4 text-gray-700">
                                <ul className="list-disc list-inside space-y-2">
                                    <li>API Explorer for testing endpoints</li>
                                    <li>Postman collection for quick setup</li>
                                    <li>GraphQL playground</li>
                                    <li>Real-time API monitoring dashboard</li>
                                    <li>Usage analytics and reporting</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Developer Support</h2>
                            <div className="space-y-4 text-gray-700">
                                <p>Get help with your integration:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Developer forum and community</li>
                                    <li>Technical support tickets</li>
                                    <li>Live chat during business hours</li>
                                    <li>Email: developers@instasell.com</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}