export default function ChangePasswordPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Change Password</h1>
            <form className="space-y-4 max-w-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-700">Save Changes</button>
            </form>
        </div>
    );
}
