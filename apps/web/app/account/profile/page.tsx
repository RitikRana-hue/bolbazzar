'use client';

import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit2,
    Save,
    X,
    Camera,
    Shield,
    Star,
    Award
} from 'lucide-react';

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        location: 'New York, NY',
        bio: 'Passionate collector and seller of vintage electronics and rare items.',
        website: 'https://johndoe.com'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        // Save profile data
        setIsEditing(false);
        // TODO: API call to update profile
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSave}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Photo Section */}
                <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                        <img
                            src="https://via.placeholder.com/120"
                            alt="Profile"
                            className="w-30 h-30 rounded-full object-cover border-4 border-gray-200"
                        />
                        {isEditing && (
                            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                                <Camera className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {formData.firstName} {formData.lastName}
                        </h2>
                        <p className="text-gray-600">{formData.email}</p>
                        <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-600">4.8 (127 reviews)</span>
                            </div>
                            <div className="flex items-center">
                                <Shield className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-gray-600">Verified</span>
                            </div>
                            <div className="flex items-center">
                                <Award className="h-4 w-4 text-purple-500 mr-1" />
                                <span className="text-sm text-gray-600">Top Seller</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{formData.firstName}</span>
                            </div>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{formData.lastName}</span>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{formData.email}</span>
                            <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Verified</span>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{formData.phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                        </label>
                        {isEditing ? (
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{new Date(formData.dateOfBirth).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                        </label>
                        {isEditing ? (
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="capitalize">{formData.gender.replace('_', ' ')}</span>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="City, State/Country"
                            />
                        ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{formData.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Website */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                        </label>
                        {isEditing ? (
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://yourwebsite.com"
                            />
                        ) : (
                            <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                                <span>{formData.website}</span>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                        </label>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <div className="px-3 py-2 bg-gray-50 rounded-lg">
                                <p className="text-gray-700">{formData.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">127</div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">89</div>
                        <div className="text-sm text-gray-600">Items Sold</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">4.8</div>
                        <div className="text-sm text-gray-600">Seller Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">2.5k</div>
                        <div className="text-sm text-gray-600">Profile Views</div>
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">Show email to other users</h3>
                            <p className="text-sm text-gray-600">Allow other users to see your email address</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">Show phone number</h3>
                            <p className="text-sm text-gray-600">Display your phone number on your profile</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">Show online status</h3>
                            <p className="text-sm text-gray-600">Let others know when you're online</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}