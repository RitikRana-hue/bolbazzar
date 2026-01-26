export default function CareersPage() {
    return (
        <main className="bg-gray-50 py-12">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Careers at InstaSell</h1>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            We're always looking for talented individuals to join our growing team.
                            At InstaSell, you'll work on cutting-edge technology that impacts millions
                            of users worldwide.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Open Positions</h2>
                        <div className="space-y-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-bold text-gray-900">Senior Full Stack Developer</h3>
                                <p className="text-gray-600">Remote • Full-time</p>
                                <p className="text-gray-700 mt-2">Join our engineering team to build scalable marketplace solutions.</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-bold text-gray-900">Product Manager</h3>
                                <p className="text-gray-600">San Francisco, CA • Full-time</p>
                                <p className="text-gray-700 mt-2">Lead product strategy and development for our marketplace platform.</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-bold text-gray-900">Customer Success Manager</h3>
                                <p className="text-gray-600">New York, NY • Full-time</p>
                                <p className="text-gray-700 mt-2">Help our users succeed on the InstaSell platform.</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Competitive salary and equity package</li>
                                <li>Comprehensive health, dental, and vision insurance</li>
                                <li>Flexible work arrangements and remote options</li>
                                <li>Professional development opportunities</li>
                                <li>Unlimited PTO policy</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}