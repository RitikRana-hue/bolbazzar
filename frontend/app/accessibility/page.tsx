export default function AccessibilityPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Accessibility Statement</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="space-y-8 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
                                <p>InstaSell is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Standards</h2>
                                <p className="mb-4">We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.</p>
                                <p>Our website includes features such as:</p>
                                <ul className="list-disc list-inside space-y-2 mt-4">
                                    <li>Keyboard navigation support</li>
                                    <li>Screen reader compatibility</li>
                                    <li>High contrast color schemes</li>
                                    <li>Resizable text and images</li>
                                    <li>Alternative text for images</li>
                                    <li>Descriptive link text</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ongoing Efforts</h2>
                                <p className="mb-4">We are actively working to improve accessibility through:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Regular accessibility audits and testing</li>
                                    <li>Staff training on accessibility best practices</li>
                                    <li>User feedback integration</li>
                                    <li>Third-party accessibility tool integration</li>
                                    <li>Continuous monitoring and updates</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Assistive Technologies</h2>
                                <p>Our website is designed to work with assistive technologies including:</p>
                                <ul className="list-disc list-inside space-y-2 mt-4">
                                    <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                                    <li>Voice recognition software</li>
                                    <li>Keyboard-only navigation</li>
                                    <li>Switch navigation</li>
                                    <li>Eye-tracking devices</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Issues</h2>
                                <p>We are aware of some accessibility limitations and are working to address them:</p>
                                <ul className="list-disc list-inside space-y-2 mt-4">
                                    <li>Some third-party embedded content may not be fully accessible</li>
                                    <li>Complex interactive elements are being improved</li>
                                    <li>Mobile accessibility enhancements are ongoing</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback and Support</h2>
                                <p className="mb-4">We welcome your feedback on the accessibility of InstaSell. Please let us know if you encounter accessibility barriers:</p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="font-semibold text-blue-900 mb-2">Contact Information:</p>
                                    <p className="text-blue-800">
                                        Email: accessibility@instasell.com<br />
                                        Phone: (555) 123-ACCESS<br />
                                        Address: 123 Accessibility Street, San Francisco, CA 94105
                                    </p>
                                </div>
                                <p className="mt-4">We aim to respond to accessibility feedback within 2 business days.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Alternative Formats</h2>
                                <p>If you need information from our website in an alternative format, please contact us. We can provide content in:</p>
                                <ul className="list-disc list-inside space-y-2 mt-4">
                                    <li>Large print</li>
                                    <li>Audio format</li>
                                    <li>Braille</li>
                                    <li>Electronic formats compatible with assistive technology</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}