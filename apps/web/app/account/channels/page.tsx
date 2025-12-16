'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Bell,
    Plus,
    Settings,
    Trash2,
    Package,
    Tag,
    User,
    Search
} from 'lucide-react';

interface Channel {
    id: string;
    type: 'seller' | 'category' | 'keyword';
    name: string;
    description: string;
    avatar?: string;
    subscribedAt: string;
    notificationCount: number;
    isActive: boolean;
    metadata: {
        sellerId?: string;
        categoryId?: string;
        keyword?: string;
        totalListings?: number;
        avgPrice?: number;
    };
}

export default function SavedChannelsPage() {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            // Mock data - replace with actual API call
            const mockChannels: Channel[] = [
                {
                    id: '1',
                    type: 'seller',
                    name: 'TechStore Inc',
                    description: 'Premium electronics and gadgets',
                    avatar: 'https://via.placeholder.com/40',
                    subscribedAt: '2024-01-10T00:00:00Z',
                    notificationCount: 12,
                    isActive: true,
                    metadata: {
                        sellerId: 'seller1',
                        totalListings: 156,
                        avgPrice: 299.99
                    }
                },
                {
                    id: '2',
                    type: 'category',
                    name: 'Smartphones',
                    description: 'Latest mobile phones and accessories',
                    subscribedAt: '2024-01-08T00:00:00Z',
                    notificationCount: 8,
                    isActive: true,
                    metadata: {
                        categoryId: 'cat-smartphones',
                        totalListings: 1240,
                        avgPrice: 599.99
                    }
                },
                {
                    id: '3',
                    type: 'keyword',
                    name: 'iPhone 15',
                    description: 'Notifications for iPhone 15 listings',
                    subscribedAt: '2024-01-12T00:00:00Z',
                    notificationCount: 5,
                    isActive: true,
                    metadata: {
                        keyword: 'iPhone 15',
                        totalListings: 89,
                        avgPrice: 899.99
                    }
                },
                {
                    id: '4',
                    type: 'seller',
                    name: 'Fashion Hub',
                    description: 'Trendy clothing and accessories',
                    avatar: 'https://via.placeholder.com/40',
                    subscribedAt: '2024-01-05T00:00:00Z',
                    notificationCount: 3,
                    isActive: false,
                    metadata: {
                        sellerId: 'seller2',
                        totalListings: 89,
                        avgPrice: 49.99
                    }
                },
                {
                    id: '5',
                    type: 'category',
                    name: 'Laptops',
                    description: 'Desktop and laptop computers',
                    subscribedAt: '2024-01-03T00:00:00Z',
                    notificationCount: 15,
                    isActive: true,
                    metadata: {
                        categoryId: 'cat-laptops',
                        totalListings: 567,
                        avgPrice: 1299.99
                    }
                }
            ];

            setChannels(mockChannels);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
            setLoading(false);
        }
    };

    const toggleChannel = async (channelId: string) => {
        setChannels(prev => prev.map(channel =>
            channel.id === channelId
                ? { ...channel, isActive: !channel.isActive }
                : channel
        ));

        // TODO: API call to update channel status
    };

    const unsubscribeChannel = async (channelId: string) => {
        if (confirm('Are you sure you want to unsubscribe from this channel?')) {
            setChannels(prev => prev.filter(channel => channel.id !== channelId));
            // TODO: API call to unsubscribe
        }
    };

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'seller':
                return <User className="h-5 w-5 text-blue-500" />;
            case 'category':
                return <Tag className="h-5 w-5 text-green-500" />;
            case 'keyword':
                return <Search className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const filteredChannels = channels.filter(channel => {
        const matchesFilter = filter === 'all' || channel.type === filter;
        const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            channel.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saved Channels</h1>
                    <p className="text-gray-600">Manage your notification subscriptions</p>
                </div>

                <Link
                    href="/channels/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Channel
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search channels..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2"
                    >
                        <option value="all">All Types</option>
                        <option value="seller">Sellers</option>
                        <option value="category">Categories</option>
                        <option value="keyword">Keywords</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Bell className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Channels</p>
                            <p className="text-2xl font-bold text-gray-900">{channels.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <User className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Sellers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {channels.filter(c => c.type === 'seller').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Tag className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Categories</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {channels.filter(c => c.type === 'category').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <Package className="h-8 w-8 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {channels.filter(c => c.isActive).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Channels List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredChannels.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No channels found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || filter !== 'all'
                                ? "No channels match your search criteria."
                                : "You haven't subscribed to any channels yet."
                            }
                        </p>
                        <Link
                            href="/channels/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Channel
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredChannels.map((channel) => (
                            <div key={channel.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    {/* Channel Icon/Avatar */}
                                    <div className="flex-shrink-0">
                                        {channel.avatar ? (
                                            <img
                                                src={channel.avatar}
                                                alt={channel.name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                {getChannelIcon(channel.type)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Channel Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {channel.name}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${channel.type === 'seller' ? 'bg-blue-100 text-blue-800' :
                                                        channel.type === 'category' ? 'bg-green-100 text-green-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {channel.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {channel.description}
                                                </p>
                                            </div>

                                            {/* Notification Badge */}
                                            {channel.notificationCount > 0 && (
                                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    {channel.notificationCount} new
                                                </span>
                                            )}
                                        </div>

                                        {/* Channel Stats */}
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500">
                                            <div>
                                                <span className="font-medium">
                                                    {channel.metadata.totalListings} listings
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Avg ${channel.metadata.avgPrice?.toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Since {new Date(channel.subscribedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-3 flex items-center space-x-4">
                                            <button
                                                onClick={() => toggleChannel(channel.id)}
                                                className={`inline-flex items-center text-sm font-medium ${channel.isActive
                                                    ? 'text-green-600 hover:text-green-700'
                                                    : 'text-gray-600 hover:text-gray-700'
                                                    }`}
                                            >
                                                <Bell className={`h-4 w-4 mr-1 ${channel.isActive ? 'fill-current' : ''}`} />
                                                {channel.isActive ? 'Active' : 'Paused'}
                                            </button>

                                            <Link
                                                href={`/channels/${channel.id}/settings`}
                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <Settings className="h-4 w-4 mr-1" />
                                                Settings
                                            </Link>

                                            <button
                                                onClick={() => unsubscribeChannel(channel.id)}
                                                className="inline-flex items-center text-sm text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Unsubscribe
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}