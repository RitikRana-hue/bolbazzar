'use client';

import { useState } from 'react';
import {
    Plus,
    MapPin,
    Edit2,
    Trash2,
    Home,
    Building,
    Star,
    X
} from 'lucide-react';

interface Address {
    id: string;
    type: 'home' | 'work' | 'other';
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: '1',
            type: 'home',
            name: 'John Doe',
            street: '123 Main Street, Apt 4B',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'United States',
            phone: '+1 (555) 123-4567',
            isDefault: true
        },
        {
            id: '2',
            type: 'work',
            name: 'John Doe',
            street: '456 Business Ave, Suite 200',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            country: 'United States',
            phone: '+1 (555) 987-6543',
            isDefault: false
        }
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState<Partial<Address>>({
        type: 'home',
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: '',
        isDefault: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAddress) {
            // Update existing address
            setAddresses(addresses.map(addr =>
                addr.id === editingAddress.id
                    ? { ...addr, ...formData }
                    : addr
            ));
            setEditingAddress(null);
        } else {
            // Add new address
            const { id, ...addressData } = formData;
            const newAddress: Address = {
                id: Date.now().toString(),
                ...addressData as Omit<Address, 'id'>
            };
            setAddresses([...addresses, newAddress]);
        }

        setFormData({
            type: 'home',
            name: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
            phone: '',
            isDefault: false
        });
        setShowAddForm(false);
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData(address);
        setShowAddForm(true);
    };

    const handleDelete = (id: string) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
    };

    const handleSetDefault = (id: string) => {
        setAddresses(addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        })));
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingAddress(null);
        setFormData({
            type: 'home',
            name: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
            phone: '',
            isDefault: false
        });
    };

    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home':
                return <Home className="h-5 w-5 text-blue-600" />;
            case 'work':
                return <Building className="h-5 w-5 text-green-600" />;
            default:
                return <MapPin className="h-5 w-5 text-gray-600" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
                    <p className="text-gray-600 mt-1">Manage your shipping and billing addresses</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Address Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Street Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Street Address
                            </label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="123 Main Street, Apt 4B"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="New York"
                                />
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="NY"
                                />
                            </div>

                            {/* ZIP Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ZIP Code
                                </label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="10001"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="United States">United States</option>
                                    <option value="Canada">Canada</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Australia">Australia</option>
                                </select>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        {/* Default Address */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Set as default address
                            </label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {editingAddress ? 'Update Address' : 'Add Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
                {addresses.map((address) => (
                    <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="mt-1">
                                    {getAddressIcon(address.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="font-medium text-gray-900 capitalize">
                                            {address.type} Address
                                        </h3>
                                        {address.isDefault && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <Star className="h-3 w-3 mr-1" />
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray-700">
                                        <p className="font-medium">{address.name}</p>
                                        <p>{address.street}</p>
                                        <p>{address.city}, {address.state} {address.zipCode}</p>
                                        <p>{address.country}</p>
                                        {address.phone && <p className="mt-1 text-sm text-gray-600">{address.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Set Default
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEdit(address)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {addresses.length === 0 && (
                <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                    <p className="text-gray-600 mb-6">Add your first address to get started with shipping.</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Address
                    </button>
                </div>
            )}
        </div>
    );
}